-- تحسين قيود جدول exchange_rates
-- 1) توحيد year مع exchange_rate_day
-- 2) منع تكرار نفس اليوم

-- تصحيح year إذا كان لا يطابق سنة التاريخ
update public.exchange_rates
set year = extract(year from exchange_rate_day)::integer
where year <> extract(year from exchange_rate_day)::integer;

-- إزالة أي تكرار لنفس اليوم (نحتفظ بآخر سجل id)
delete from public.exchange_rates e
using public.exchange_rates d
where e.exchange_rate_day = d.exchange_rate_day
  and e.id < d.id;

-- قيد تطابق year مع exchange_rate_day
alter table public.exchange_rates
drop constraint if exists exchange_rates_year_matches_day_chk;

alter table public.exchange_rates
add constraint exchange_rates_year_matches_day_chk
check (year = extract(year from exchange_rate_day)::integer);

-- منع إدخال أكثر من سجل لنفس اليوم
create unique index if not exists exchange_rates_exchange_rate_day_unique_idx
  on public.exchange_rates (exchange_rate_day);
