-- EMT v1.0 schema for Supabase
-- Includes: tables, constraints, indexes, updated_at trigger, RLS policies

begin;

create table if not exists public.duty_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  start_time timestamptz not null,
  task_type text not null check (task_type in ('協勤', '公差', '其他')),
  task_type_custom text,
  end_time timestamptz,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_duty_sessions_task_type_custom
    check (
      (task_type <> '其他' and task_type_custom is null)
      or
      (task_type = '其他' and length(btrim(coalesce(task_type_custom, ''))) > 0)
    )
);

create table if not exists public.duty_dispatches (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.duty_sessions (id) on delete cascade,
  seq_no int not null check (seq_no between 1 and 99),
  dispatch_time timestamptz not null,

  vehicle text not null check (vehicle in ('中和91', '中和92', '其他')),
  vehicle_custom text,

  case_type text not null check (case_type in ('外科', '內科', '火警', '其他')),
  case_type_custom text,

  patient_count text not null check (patient_count in ('1', '2', '其他')),
  patient_count_custom text,

  hospital text not null check (hospital in ('雙和', '永和耕莘', '慈濟', '新店耕莘', '板醫', '西園', '台大', '其他')),
  hospital_custom text,

  chief_complaint text not null,
  bp text,
  spo2 text,
  equipment_used text[] not null default '{}',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_duty_dispatches_session_seq unique (session_id, seq_no),

  constraint chk_duty_dispatches_vehicle_custom
    check (
      (vehicle <> '其他' and vehicle_custom is null)
      or
      (vehicle = '其他' and length(btrim(coalesce(vehicle_custom, ''))) > 0)
    ),
  constraint chk_duty_dispatches_case_type_custom
    check (
      (case_type <> '其他' and case_type_custom is null)
      or
      (case_type = '其他' and length(btrim(coalesce(case_type_custom, ''))) > 0)
    ),
  constraint chk_duty_dispatches_patient_count_custom
    check (
      (patient_count <> '其他' and patient_count_custom is null)
      or
      (patient_count = '其他' and length(btrim(coalesce(patient_count_custom, ''))) > 0)
    ),
  constraint chk_duty_dispatches_hospital_custom
    check (
      (hospital <> '其他' and hospital_custom is null)
      or
      (hospital = '其他' and length(btrim(coalesce(hospital_custom, ''))) > 0)
    )
);

create index if not exists idx_duty_sessions_user_start
  on public.duty_sessions (user_id, start_time desc);

create index if not exists idx_duty_sessions_status
  on public.duty_sessions (status);

create index if not exists idx_duty_dispatches_session_seq
  on public.duty_dispatches (session_id, seq_no);

create index if not exists idx_duty_dispatches_dispatch_time
  on public.duty_dispatches (dispatch_time desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_duty_sessions on public.duty_sessions;
create trigger trg_set_updated_at_duty_sessions
before update on public.duty_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_duty_dispatches on public.duty_dispatches;
create trigger trg_set_updated_at_duty_dispatches
before update on public.duty_dispatches
for each row
execute function public.set_updated_at();

alter table public.duty_sessions enable row level security;
alter table public.duty_dispatches enable row level security;

drop policy if exists "sessions_select_own" on public.duty_sessions;
create policy "sessions_select_own"
on public.duty_sessions
for select
using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.duty_sessions;
create policy "sessions_insert_own"
on public.duty_sessions
for insert
with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.duty_sessions;
create policy "sessions_update_own"
on public.duty_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "sessions_delete_own" on public.duty_sessions;
create policy "sessions_delete_own"
on public.duty_sessions
for delete
using (auth.uid() = user_id);

drop policy if exists "dispatches_select_own" on public.duty_dispatches;
create policy "dispatches_select_own"
on public.duty_dispatches
for select
using (
  exists (
    select 1
    from public.duty_sessions s
    where s.id = duty_dispatches.session_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "dispatches_insert_own" on public.duty_dispatches;
create policy "dispatches_insert_own"
on public.duty_dispatches
for insert
with check (
  exists (
    select 1
    from public.duty_sessions s
    where s.id = duty_dispatches.session_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "dispatches_update_own" on public.duty_dispatches;
create policy "dispatches_update_own"
on public.duty_dispatches
for update
using (
  exists (
    select 1
    from public.duty_sessions s
    where s.id = duty_dispatches.session_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.duty_sessions s
    where s.id = duty_dispatches.session_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "dispatches_delete_own" on public.duty_dispatches;
create policy "dispatches_delete_own"
on public.duty_dispatches
for delete
using (
  exists (
    select 1
    from public.duty_sessions s
    where s.id = duty_dispatches.session_id
      and s.user_id = auth.uid()
  )
);

commit;

