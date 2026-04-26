-- إشعارات اعتماد الإجازات: مستقبلو الاعتماد (3 فتحات) + سجل إشعار لكل إجازة جديدة
-- + إفراغ الملاحظة "تحت الاعتماد" وحذف الإشعارات عند اكتمال الاعتمادين
--
-- ما يجب فعله يدوياً بعد تطبيق الهجرة (مرة واحدة):
-- 1) إدراج 3 صفوف في public.vacation_approver_recipients (slot 1,2,3) بم UUID مستخدمين
--    الموجودين في user_profiles (من لوحة Supabase: Authentication + جدول user_profiles).
--    مثال:
--      insert into public.vacation_approver_recipients (slot, user_id) values
--        (1, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid),
--        (2, 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'::uuid),
--        (3, 'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz'::uuid)
--    on conflict (slot) do update set user_id = excluded.user_id;
-- 2) اختبر من التطبيق: تسجيل إجازة — يجب أن يظهر للمعتمدين تسجيلات في public.vacation_notifications.

-- مُستلمو الاعتماد: ثلاثة فتحات ثابتة
create table if not exists public.vacation_approver_recipients (
  slot smallint primary key,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  constraint vacation_approver_recipients_slot_range check (slot between 1 and 3)
);

comment on table public.vacation_approver_recipients is 'مستخدمون يستلمون إشعاراً لكل إجازة تُسجّل (حتى 3 فتحات)';

-- إشعارات لطلب الاعتماد
create table if not exists public.vacation_notifications (
  id bigserial primary key,
  vacation_id integer not null references public.vacations (id) on delete cascade,
  recipient_user_id uuid not null references public.user_profiles (id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint vacation_notifications_vacation_recipient_unique
    unique (vacation_id, recipient_user_id)
);

create index if not exists vacation_notifications_recipient_unread_idx
  on public.vacation_notifications (recipient_user_id, read_at, created_at desc);

comment on table public.vacation_notifications is 'إشعارات اعتماد إجازة: يُولَّد تلقائياً عند تسجيل سجل جديد';

alter table public.vacation_approver_recipients enable row level security;
alter table public.vacation_notifications enable row level security;

-- المستخدم يرى مُستلمي الاعتماد: قراءة للجميع المسجّلين (بيئة داخلية؛ يُشدد لاحقاً)
drop policy if exists "vacation_approver_recipients_select_auth" on public.vacation_approver_recipients;
create policy "vacation_approver_recipients_select_auth"
  on public.vacation_approver_recipients for select
  to authenticated
  using (true);

-- تعديل مُعتمِدين: يبقى من SQL/لوحة الإدارة أو سياسة لاحقة للمدراء فقط
-- (لا يُدرج here insert للجميع)

-- إشعارات: القراءة لصاحب السجل
drop policy if exists "vacation_notifications_select_own" on public.vacation_notifications;
create policy "vacation_notifications_select_own"
  on public.vacation_notifications for select
  to authenticated
  using (recipient_user_id = auth.uid());

-- تحديث تاريخ القراءة
drop policy if exists "vacation_notifications_update_read_own" on public.vacation_notifications;
create policy "vacation_notifications_update_read_own"
  on public.vacation_notifications for update
  to authenticated
  using (recipient_user_id = auth.uid())
  with check (recipient_user_id = auth.uid());

-- === إشعار عند إدراج إجازة جديدة
create or replace function public.create_vacation_approval_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.vacation_notifications (vacation_id, recipient_user_id, title, body)
  select
    new.id,
    r.user_id,
    'طلب إجازة — بانتظار الاعتماد',
    'طلب جديد: إجازة رقم ' || new.id
      || coalesce(' من ' || new.from_date::text, '')
      || ' إلى ' || coalesce(new.to_date::text, '')
  from public.vacation_approver_recipients r
  on conflict (vacation_id, recipient_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists vacations_after_insert_approval_notify on public.vacations;
create trigger vacations_after_insert_approval_notify
  after insert on public.vacations
  for each row execute function public.create_vacation_approval_notifications();

-- === عند اكتمال الاعتمادين: إزالة "تحت الاعتماد" + حذف سجلات الإشعار لهذه الإجازة
create or replace function public.vacation_before_update_clear_pending()
returns trigger
language plpgsql
as $$
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
$$;

drop trigger if exists vacations_before_update_clear_note on public.vacations;
create trigger vacations_before_update_clear_note
  before update on public.vacations
  for each row execute function public.vacation_before_update_clear_pending();

create or replace function public.vacation_after_update_delete_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.administrative_approval is true
     and new.management_approval is true
     and (old.administrative_approval is distinct from true
          or old.management_approval is distinct from true) then
    delete from public.vacation_notifications
    where vacation_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists vacations_after_update_done_notify on public.vacations;
create trigger vacations_after_update_done_notify
  after update on public.vacations
  for each row execute function public.vacation_after_update_delete_notifications();
