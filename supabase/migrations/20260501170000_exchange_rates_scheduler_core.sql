-- Core objects for scheduled STB ACHAT exchange-rate capture

create table if not exists public.bank_holidays (
  holiday_date date primary key,
  holiday_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.bank_holidays is
'Official bank holidays used to skip automated exchange-rate capture.';

create table if not exists public.exchange_rate_job_runs (
  id bigserial primary key,
  target_day date not null,
  attempt_no smallint not null check (attempt_no between 1 and 3),
  source text not null default 'STB_ACHAT',
  status text not null,
  message text,
  usd numeric(10,3),
  eur numeric(10,3),
  created_at timestamptz not null default now()
);

create index if not exists exchange_rate_job_runs_target_day_idx
  on public.exchange_rate_job_runs (target_day, attempt_no);

create or replace function public.is_business_day(p_day date)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    extract(isodow from p_day)::int not in (6, 7)
    and not exists (
      select 1
      from public.bank_holidays h
      where h.holiday_date = p_day
        and h.is_active = true
    );
$$;

revoke all on function public.is_business_day(date) from public;
grant execute on function public.is_business_day(date) to authenticated;

create or replace function public.capture_exchange_rate_attempt(
  p_target_day date,
  p_attempt_no smallint,
  p_usd numeric(10,3),
  p_eur numeric(10,3),
  p_source text default 'STB_ACHAT'
)
returns table(status text, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message text;
  v_inserted boolean := false;
  v_row_count integer := 0;
begin
  if p_attempt_no < 1 or p_attempt_no > 3 then
    raise exception 'attempt number must be between 1 and 3';
  end if;

  if not public.is_business_day(p_target_day) then
    v_message := 'Skipped: non-business day';
    insert into public.exchange_rate_job_runs (
      target_day, attempt_no, source, status, message, usd, eur
    ) values (
      p_target_day, p_attempt_no, p_source, 'skipped_non_business_day', v_message, p_usd, p_eur
    );
    return query select 'skipped_non_business_day'::text, v_message;
    return;
  end if;

  if exists (
    select 1
    from public.exchange_rates e
    where e.exchange_rate_day = p_target_day
  ) then
    v_message := 'Skipped: rate already exists for target day';
    insert into public.exchange_rate_job_runs (
      target_day, attempt_no, source, status, message, usd, eur
    ) values (
      p_target_day, p_attempt_no, p_source, 'already_exists', v_message, p_usd, p_eur
    );
    return query select 'already_exists'::text, v_message;
    return;
  end if;

  if p_usd is null or p_eur is null then
    v_message := 'Missing source data (USD/EUR ACHAT not parsed)';
    insert into public.exchange_rate_job_runs (
      target_day, attempt_no, source, status, message, usd, eur
    ) values (
      p_target_day, p_attempt_no, p_source, 'missing_source_data', v_message, p_usd, p_eur
    );
    return query select 'missing_source_data'::text, v_message;
    return;
  end if;

  insert into public.exchange_rates (
    exchange_rate_day,
    usd,
    eur,
    year
  ) values (
    p_target_day,
    p_usd,
    p_eur,
    extract(year from p_target_day)::int
  )
  on conflict (exchange_rate_day) do nothing;

  get diagnostics v_row_count = row_count;
  v_inserted := v_row_count > 0;

  if v_inserted then
    v_message := 'Inserted exchange rate successfully';
    insert into public.exchange_rate_job_runs (
      target_day, attempt_no, source, status, message, usd, eur
    ) values (
      p_target_day, p_attempt_no, p_source, 'inserted', v_message, p_usd, p_eur
    );
    return query select 'inserted'::text, v_message;
  else
    v_message := 'Skipped: rate already exists (conflict)';
    insert into public.exchange_rate_job_runs (
      target_day, attempt_no, source, status, message, usd, eur
    ) values (
      p_target_day, p_attempt_no, p_source, 'already_exists', v_message, p_usd, p_eur
    );
    return query select 'already_exists'::text, v_message;
  end if;
end;
$$;

revoke all on function public.capture_exchange_rate_attempt(date,smallint,numeric,numeric,text) from public;
grant execute on function public.capture_exchange_rate_attempt(date,smallint,numeric,numeric,text) to authenticated;
