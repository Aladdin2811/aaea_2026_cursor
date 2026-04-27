-- توسيع الرسائل: مجموعة، بث للجميع، تعديل/حذف ناعم للمرسل
-- يُنفَّذ في Supabase بعد 20260428090000_user_direct_messages.sql

-- 1) أعمدة جديدة في dm_threads
alter table public.dm_threads
  add column if not exists kind text not null default 'dm',
  add column if not exists title text,
  add column if not exists created_by uuid references auth.users (id) on delete set null;

-- القيم الافتراضية للسجلات القديمة
update public.dm_threads set kind = 'dm' where coalesce(kind, 'dm') = 'dm';

alter table public.dm_threads drop constraint if exists dm_threads_participants_order;
alter table public.dm_threads drop constraint if exists dm_threads_distinct;

alter table public.dm_threads alter column participant_low drop not null;
alter table public.dm_threads alter column participant_high drop not null;

drop index if exists dm_threads_pair_idx;
create unique index if not exists dm_threads_pair_idx
  on public.dm_threads (participant_low, participant_high)
  where kind = 'dm' and participant_low is not null and participant_high is not null;

-- قابل لإعادة التشغيل: إن وُجد القيد مسبقاً (تشغيل ثانٍ للهجرة)
alter table public.dm_threads drop constraint if exists dm_threads_kind_participants;

alter table public.dm_threads
  add constraint dm_threads_kind_participants check (
    (kind = 'dm' and participant_low is not null and participant_high is not null
     and participant_low < participant_high and participant_low is distinct from participant_high)
    or
    (kind in ('group', 'broadcast') and participant_low is null and participant_high is null)
  );

-- 2) أعضاء الخيوط
create table if not exists public.dm_thread_members (
  thread_id uuid not null references public.dm_threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create index if not exists dm_thread_members_user_idx
  on public.dm_thread_members (user_id);

create index if not exists dm_thread_members_thread_idx
  on public.dm_thread_members (thread_id);

-- إضافة مُشاركي الحوارات 1:1
insert into public.dm_thread_members (thread_id, user_id)
select id, participant_low
from public.dm_threads
where kind = 'dm' and participant_low is not null
on conflict do nothing;

insert into public.dm_thread_members (thread_id, user_id)
select id, participant_high
from public.dm_threads
where kind = 'dm' and participant_high is not null
on conflict do nothing;

-- 3) خيط بث واحد للمؤسسة
insert into public.dm_threads (kind, title, participant_low, participant_high, last_message_at, last_message_preview, last_sender_id)
select 'broadcast', 'إعلان — الجميع', null, null, null, null, null
where not exists (
  select 1 from public.dm_threads t where t.kind = 'broadcast'
);

-- 4) تعديل/حذف ناعم للرسائل
alter table public.dm_messages
  add column if not exists edited_at timestamptz,
  add column if not exists deleted_at timestamptz;

-- 5) مزامنة أعضاء عند إنشاء حوار 1:1 جديد
create or replace function public.dm_threads_after_insert_sync_members()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if new.kind = 'dm' and new.participant_low is not null and new.participant_high is not null then
    insert into public.dm_thread_members (thread_id, user_id)
    values (new.id, new.participant_low)
    on conflict do nothing;
    insert into public.dm_thread_members (thread_id, user_id)
    values (new.id, new.participant_high)
    on conflict do nothing;
  end if;
  return new;
end;
$fn$;

drop trigger if exists dm_threads_sync_members on public.dm_threads;
create trigger dm_threads_sync_members
  after insert on public.dm_threads
  for each row
  execute function public.dm_threads_after_insert_sync_members();

-- 6) إنشاء مجموعة + أعضاء
create or replace function public.create_group_thread(
  p_member_ids uuid[],
  p_title text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn$
declare
  me uuid := auth.uid();
  tid uuid;
  uid uuid;
  merged uuid[];
  other_count int;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if p_member_ids is null or cardinality(p_member_ids) < 1 then
    raise exception 'يُرجى اختيار مستقبل واحد على الأقل';
  end if;

  select coalesce(
    array(
      select distinct u
      from unnest(p_member_ids || array[me]::uuid[]) as t(u)
      where u is not null
    ),
    array[]::uuid[]
  ) into merged;

  select count(*)::int into other_count
  from unnest(merged) u where u is distinct from me;
  if other_count < 1 then
    raise exception 'يُرجى اختيار مستقبلين على الأقل للمجموعة (أنت + شخص آخر)';
  end if;

  insert into public.dm_threads (kind, title, created_by, participant_low, participant_high, last_message_at, last_message_preview, last_sender_id)
  values (
    'group',
    case when p_title is not null and length(trim(p_title)) > 0 then nullif(trim(p_title), '') else null end,
    me,
    null,
    null,
    null,
    null,
    null
  ) returning id into tid;

  foreach uid in array merged
  loop
    insert into public.dm_thread_members (thread_id, user_id) values (tid, uid)
    on conflict do nothing;
  end loop;

  return tid;
end;
$fn$;

-- 7) معرّف خيط البث
create or replace function public.get_broadcast_thread_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select t.id
  from public.dm_threads t
  where t.kind = 'broadcast'
  order by t.created_at
  limit 1;
$$;

-- 7.1) التحقق من عضوية الخيط دون استعلام dm_thread_members داخل سياسة (42P17).
-- sql + security definer: قراءة بصلاحيات مالك الدالة (يُتجاوَز RLS عند المالك) — دون SET (0A000 على STABLE).
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

-- 8) RLS: إعادة سياسات dm_threads
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

drop policy if exists "dm_threads_insert" on public.dm_threads;
create policy "dm_threads_insert" on public.dm_threads
  for insert to authenticated
  with check (
    kind = 'dm'
    and (auth.uid() in (participant_low, participant_high))
  );

-- 9) RLS: أعضاء الخيت (رؤية زملاء الخيت فقط)
alter table public.dm_thread_members enable row level security;

drop policy if exists "dm_members_select" on public.dm_thread_members;
create policy "dm_members_select" on public.dm_thread_members
  for select to authenticated
  using (public.user_is_member_of_dm_thread(thread_id));

-- 10) رسائل: سياسة القراءة/الإدخال/تعديل الحذف الناعم
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

drop policy if exists "dm_messages_update_own" on public.dm_messages;
create policy "dm_messages_update_own" on public.dm_messages
  for update to authenticated
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- 11) عداد غير المقروء: يشمل المجموعة والبث
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

-- 12) منح
revoke all on function public.create_group_thread(uuid[], text) from public;
grant execute on function public.create_group_thread(uuid[], text) to authenticated;

revoke all on function public.get_broadcast_thread_id() from public;
grant execute on function public.get_broadcast_thread_id() to authenticated;