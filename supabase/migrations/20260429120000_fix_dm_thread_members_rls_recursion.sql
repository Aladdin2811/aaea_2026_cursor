-- إصلاح 42P17: infinite recursion في سياسة dm_thread_members
-- (السياسة السابقة كانت تستعلم من نفس الجدول داخل RLS)
-- نفّذ إذا كانت لديك الهجرة 20260429100000 بالنسخة الخاطئة.

-- بدون SET داخل STABLE (خطأ 0A000)؛ sql+security definer كافٍ لقراءة الأعضاء.
create or replace function public.user_is_member_of_dm_thread(p_thread_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select p_thread_id is not null
    and exists (
      select 1
      from public.dm_thread_members m
      where m.thread_id = p_thread_id
        and m.user_id = (select auth.uid())
    );
$$;

revoke all on function public.user_is_member_of_dm_thread(uuid) from public;
grant execute on function public.user_is_member_of_dm_thread(uuid) to authenticated;

drop policy if exists "dm_threads_select" on public.dm_threads;
create policy "dm_threads_select" on public.dm_threads
  for select to authenticated
  using (
    (kind = 'dm' and (auth.uid() = participant_low or auth.uid() = participant_high))
    or
    (kind = 'broadcast')
    or
    (kind = 'group' and public.user_is_member_of_dm_thread(id))
  );

drop policy if exists "dm_members_select" on public.dm_thread_members;
create policy "dm_members_select" on public.dm_thread_members
  for select to authenticated
  using (public.user_is_member_of_dm_thread(thread_id));

drop policy if exists "dm_messages_select" on public.dm_messages;
create policy "dm_messages_select" on public.dm_messages
  for select to authenticated
  using (
    exists (
      select 1
      from public.dm_threads t
      where t.id = thread_id
        and (
          t.kind = 'broadcast'
          or
          (t.kind = 'dm' and (auth.uid() = t.participant_low or auth.uid() = t.participant_high))
          or
          (t.kind = 'group' and public.user_is_member_of_dm_thread(t.id))
        )
    )
  );

drop policy if exists "dm_messages_insert" on public.dm_messages;
create policy "dm_messages_insert" on public.dm_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.dm_threads t
      where t.id = thread_id
        and (
          t.kind = 'broadcast'
          or
          (t.kind = 'dm' and (auth.uid() = t.participant_low or auth.uid() = t.participant_high))
          or
          (t.kind = 'group' and public.user_is_member_of_dm_thread(t.id))
        )
    )
  );

create or replace function public.dm_unread_incoming_count_for_me()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((
    select count(*)::bigint
    from public.dm_messages m
    where m.sender_id <> auth.uid()
      and m.deleted_at is null
      and m.created_at > coalesce((
        select s.last_read_at
        from public.dm_thread_read_state s
        where s.thread_id = m.thread_id
          and s.user_id = auth.uid()
      ), to_timestamp(0))
      and (
        exists (
          select 1
          from public.dm_threads t
          where t.id = m.thread_id
            and t.kind = 'broadcast'
        )
        or public.user_is_member_of_dm_thread(m.thread_id)
        or exists (
          select 1
          from public.dm_threads t2
          where t2.id = m.thread_id
            and t2.kind = 'dm'
            and (t2.participant_low = auth.uid() or t2.participant_high = auth.uid())
        )
      )
  ), 0);
$$;

comment on function public.user_is_member_of_dm_thread(uuid) is
  'للتوسّل من سياسات RLS دون الاستعلام مباشرة من dm_thread_members (تفادي 42P17)';
