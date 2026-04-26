-- توسيع التنبيهات: جدول عام in_app_notifications لأي "طلب اعتماد" (إجازة، قيود صرف، تسوية، قرارات…)
-- إن وُجد الجدول القديم vacation_notifications تُنقل بياناته ثم يُحذف.
--
-- مفاتيح:
--   category: يميّز نوع العملية (نص حر باتفاق المشروع)، مثال: vacation_approval, spend_restriction_approval
--   ref_type + ref_id: الإشارة إلى كيان معيّن (مثال: ref_type='vacation', ref_id='42')
--
-- بعد التطبيق: أضف مُعتمَدي الإجازة (فتحات 1–3) في vacation_approver_recipients، أو اترك لاحقاً لجداول توجيه عامة.

-- جدول مُستلمي اعتماد الإجازة (مشترك مع المهجرة 20260426120000 — idempotent)
create table if not exists public.vacation_approver_recipients (
  slot smallint primary key,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  constraint vacation_approver_recipients_slot_range check (slot between 1 and 3)
);
comment on table public.vacation_approver_recipients is 'حتى 3 مستخدمين يستلمون طلب اعتماد عند تسجيل إجازة';
alter table public.vacation_approver_recipients enable row level security;
drop policy if exists "vacation_approver_recipients_select_auth" on public.vacation_approver_recipients;
create policy "vacation_approver_recipients_select_auth"
  on public.vacation_approver_recipients for select
  to authenticated
  using (true);

create table if not exists public.in_app_notifications (
  id bigserial primary key,
  recipient_user_id uuid not null references public.user_profiles (id) on delete cascade,
  category text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  ref_type text not null default '',
  ref_id text not null default '',
  unique (category, ref_type, ref_id, recipient_user_id)
);

create index if not exists in_app_notifications_recipient_unread_idx
  on public.in_app_notifications (recipient_user_id, read_at, created_at desc);

create index if not exists in_app_notifications_category_idx
  on public.in_app_notifications (category, created_at desc);

comment on table public.in_app_notifications is 'تنبيهات داخل التطبيق: اعتمادات ومهام بانتظار إجراء (أي وحدة)';

-- ترحيل من الجدول القديم إن وُجد
do $migrate$
begin
  if to_regclass('public.vacation_notifications') is not null then
    insert into public.in_app_notifications (
      recipient_user_id,
      category,
      title,
      body,
      read_at,
      created_at,
      ref_type,
      ref_id
    )
    select
      n.recipient_user_id,
      'vacation_approval',
      n.title,
      n.body,
      n.read_at,
      n.created_at,
      'vacation',
      n.vacation_id::text
    from public.vacation_notifications n
    on conflict (category, ref_type, ref_id, recipient_user_id) do nothing;
  end if;
end
$migrate$;

-- إزالة المشغّلات/الجداول القديمة
drop trigger if exists vacations_after_insert_approval_notify on public.vacations;
drop trigger if exists vacations_after_update_done_notify on public.vacations;
drop function if exists public.create_vacation_approval_notifications() cascade;
drop function if exists public.vacation_after_update_delete_notifications() cascade;

drop table if exists public.vacation_notifications;

-- RLS
alter table public.in_app_notifications enable row level security;

drop policy if exists "in_app_notifications_select_own" on public.in_app_notifications;
create policy "in_app_notifications_select_own"
  on public.in_app_notifications for select
  to authenticated
  using (recipient_user_id = auth.uid());

drop policy if exists "in_app_notifications_update_read_own" on public.in_app_notifications;
create policy "in_app_notifications_update_read_own"
  on public.in_app_notifications for update
  to authenticated
  using (recipient_user_id = auth.uid())
  with check (recipient_user_id = auth.uid());

-- مُدخلات تلقائية: إجازة جديدة
create or replace function public.create_in_app_notifications_for_vacation()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.in_app_notifications (
    recipient_user_id,
    category,
    title,
    body,
    ref_type,
    ref_id
  )
  select
    r.user_id,
    'vacation_approval',
    'طلب إجازة — بانتظار الاعتماد',
    'طلب جديد: إجازة رقم ' || new.id
      || coalesce(' من ' || new.from_date::text, '')
      || ' إلى ' || coalesce(new.to_date::text, ''),
    'vacation',
    new.id::text
  from public.vacation_approver_recipients r
  on conflict (category, ref_type, ref_id, recipient_user_id) do nothing;

  return new;
end;
$fn$;

create trigger vacations_after_insert_in_app_notify
  after insert on public.vacations
  for each row execute function public.create_in_app_notifications_for_vacation();

-- حذف إشعارات تلك الإجازة عند اكتمال الاعتمادين (نفس سلوك المهجرة السابقة)
create or replace function public.delete_in_app_notifications_vacation_done()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if new.administrative_approval is true
     and new.management_approval is true
     and (old.administrative_approval is distinct from true
          or old.management_approval is distinct from true) then
    delete from public.in_app_notifications
    where category = 'vacation_approval'
      and ref_type = 'vacation'
      and ref_id = new.id::text;
  end if;
  return new;
end;
$fn$;

create trigger vacations_after_update_clear_in_app_notify
  after update on public.vacations
  for each row execute function public.delete_in_app_notifications_vacation_done();

-- عند اكتمال الاعتمادين: إزالة نص "تحت الاعتماد" من notes (منطق المهجرة 20260426120000)
create or replace function public.vacation_before_update_clear_pending()
returns trigger
language plpgsql
as $clear$
begin
  if new.administrative_approval is true
     and new.management_approval is true
     and (old.administrative_approval is distinct from true
          or old.management_approval is distinct from true) then
    if new.notes is not distinct from 'تحت الاعتماد' then
      new.notes := null;
    end if;
  end if;
  return new;
end;
$clear$;

drop trigger if exists vacations_before_update_clear_note on public.vacations;
create trigger vacations_before_update_clear_note
  before update on public.vacations
  for each row execute function public.vacation_before_update_clear_pending();