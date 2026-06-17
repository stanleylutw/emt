-- EMT v1.2 dispatch constraint updates
-- Adds 安康耕莘 as a first-class hospital option for databases created before v1.2.

begin;

alter table public.duty_dispatches
  drop constraint if exists duty_dispatches_hospital_check;

alter table public.duty_dispatches
  add constraint duty_dispatches_hospital_check
  check (hospital in ('雙和', '永和耕莘', '慈濟', '新店耕莘', '板醫', '西園', '台大', '安康耕莘', '其他'));

commit;
