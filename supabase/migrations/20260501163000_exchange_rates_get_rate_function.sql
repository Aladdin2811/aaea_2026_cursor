-- دالة قراءة آمنة لسعر الصرف ليوم محدد
-- ترجع usd و eur لتاريخ معين من جدول exchange_rates

create or replace function public.get_exchange_rate_for_day(p_day date)
returns table(
  exchange_rate_day date,
  usd numeric(10,3),
  eur numeric(10,3)
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.exchange_rate_day,
    e.usd,
    e.eur
  from public.exchange_rates e
  where e.exchange_rate_day = p_day
  limit 1;
$$;

comment on function public.get_exchange_rate_for_day(date) is
'قراءة سعر صرف الدولار/اليورو ليوم محدد من exchange_rates';

revoke all on function public.get_exchange_rate_for_day(date) from public;
grant execute on function public.get_exchange_rate_for_day(date) to authenticated;
