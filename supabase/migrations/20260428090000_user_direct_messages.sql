-- رسائل مباشرة بين مستخدمي المشروع (1:1 لكل خيط، رد داخل نفس الخيط)
-- نفّذ في Supabase. يفعّل Realtime على dm_messages (إن لم تكن الجداول مُضافَة مسبقاً لنشر supabase_realtime).

-- مفاتيح: participant_low < participant_high (مقارنة uuid)

create table if not exists public.dm_threads (
  id uuid primary key default gen_random_uuid(),
  participant_low uuid not null references auth.users (id) on delete cascade,
  participant_high uuid not null references auth.users (id) on delete cascade,
  last_message_at timestamptz,
  last_message_preview text,
  last_sender_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint dm_threads_participants_order check (participant_low < participant_high),
  constraint dm_threads_distinct check (participant_low is distinct from participant_high)
);

create unique index if not exists dm_threads_pair_idx
  on public.dm_threads (participant_low, participant_high);

create index if not exists dm_threads_last_at_idx
  on public.dm_threads (last_message_at desc nulls last);

create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.dm_threads (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  reply_to_id uuid references public.dm_messages (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint dm_messages_body_nonempty check (char_length(trim(body)) > 0)
);

create index if not exists dm_messages_thread_created
  on public.dm_messages (thread_id, created_at);

create table if not exists public.dm_thread_read_state (
  thread_id uuid not null references public.dm_threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  last_read_at timestamptz not null default to_timestamp(0),
  primary key (thread_id, user_id)
);

-- تحديث الخيط عند وصول رسالة
create or replace function public.dm_messages_after_insert_update_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dm_threads
  set
    last_message_at = new.created_at,
    last_message_preview = left(trim(new.body), 200),
    last_sender_id = new.sender_id
  where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists dm_messages_after_insert on public.dm_messages;
create trigger dm_messages_after_insert
  after insert on public.dm_messages
  for each row execute function public.dm_messages_after_insert_update_thread();

-- إحضار خيط جديد بأمان (لا يتكرر زوج المشاركين)
create or replace function public.get_or_create_dm_thread(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  plow uuid;
  phigh uuid;
  tid uuid;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if p_other_user_id is null or p_other_user_id = me then
    raise exception 'invalid recipient';
  end if;
  if p_other_user_id < me then
    plow := p_other_user_id;
    phigh := me;
  else
    plow := me;
    phigh := p_other_user_id;
  end if;

  select t.id into tid
  from public.dm_threads t
  where t.participant_low = plow and t.participant_high = phigh;

  if tid is not null then
    return tid;
  end if;

  insert into public.dm_threads (participant_low, participant_high)
  values (plow, phigh)
  on conflict (participant_low, participant_high) do nothing
  returning id into tid;

  if tid is null then
    select t.id into tid
    from public.dm_threads t
    where t.participant_low = plow and t.participant_high = phigh;
  end if;

  return tid;
end;
$$;

revoke all on function public.get_or_create_dm_thread(uuid) from public;
grant execute on function public.get_or_create_dm_thread(uuid) to authenticated;

-- عدّ الرسائل من الآخرين بعد آخر علامة قراءة (للشارة في الهيدر)
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
    join public.dm_threads t on t.id = m.thread_id
    where (t.participant_low = auth.uid() or t.participant_high = auth.uid())
      and m.sender_id <> auth.uid()
      and m.created_at > coalesce((
        select s.last_read_at
        from public.dm_thread_read_state s
        where s.thread_id = m.thread_id
          and s.user_id = auth.uid()
      ), to_timestamp(0))
  ), 0);
$$;

revoke all on function public.dm_unread_incoming_count_for_me() from public;
grant execute on function public.dm_unread_incoming_count_for_me() to authenticated;

-- RLS
alter table public.dm_threads enable row level security;
alter table public.dm_messages enable row level security;
alter table public.dm_thread_read_state enable row level security;

drop policy if exists "dm_threads_select" on public.dm_threads;
create policy "dm_threads_select" on public.dm_threads
  for select to authenticated
  using (auth.uid() = participant_low or auth.uid() = participant_high);

drop policy if exists "dm_threads_insert" on public.dm_threads;
create policy "dm_threads_insert" on public.dm_threads
  for insert to authenticated
  with check (auth.uid() in (participant_low, participant_high));

-- لا تُفتح سياسة update على dm_threads لـ authenticated؛ المشغّل security definer يحدّث preview.

drop policy if exists "dm_messages_select" on public.dm_messages;
create policy "dm_messages_select" on public.dm_messages
  for select to authenticated
  using (
    exists (
      select 1
      from public.dm_threads t
      where t.id = dm_messages.thread_id
        and (auth.uid() = t.participant_low or auth.uid() = t.participant_high)
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
        and (auth.uid() = t.participant_low or auth.uid() = t.participant_high)
    )
  );

drop policy if exists "dm_read_state_select" on public.dm_thread_read_state;
create policy "dm_read_state_select" on public.dm_thread_read_state
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "dm_read_state_insert" on public.dm_thread_read_state;
create policy "dm_read_state_insert" on public.dm_thread_read_state
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "dm_read_state_update" on public.dm_thread_read_state;
create policy "dm_read_state_update" on public.dm_thread_read_state
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Realtime (يُرجّح أن يتحمل التكرار في لوحة supabase)
do $pub$
begin
  begin
    execute 'alter publication supabase_realtime add table public.dm_messages';
  exception
    when duplicate_object then null;
  end;
end
$pub$;

alter table public.dm_messages replica identity full;

comment on table public.dm_threads is 'حوار مباشر 1:1 (زوج مرتب مرتين participant_low/high)';
comment on table public.dm_messages is 'رسائل داخل حوار';
comment on table public.dm_thread_read_state is 'آخر وقت قراءة لكل مستخدم وخيط';
