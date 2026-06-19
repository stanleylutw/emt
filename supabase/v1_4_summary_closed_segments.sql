-- EMT v1.4 summary count fix
-- Count visible non-standby rows once they are closed by a following row or session end.
-- This avoids stale note.open=true flags undercounting after history edits/deletes.

begin;

create or replace function public.get_duty_summary(
  p_start timestamptz default null,
  p_end timestamptz default null
)
returns table (
  duty_ms bigint,
  event_count integer,
  transported integer
)
language sql
stable
security invoker
set search_path = public
as $$
  with sessions as (
    select id, end_time, start_time
    from public.duty_sessions
    where user_id = auth.uid()
      and (p_start is null or start_time >= p_start)
      and (p_end is null or start_time < p_end)
  ),
  ordered_rows as (
    select
      d.session_id,
      d.dispatch_time,
      d.hospital,
      d.hospital_custom,
      d.patient_count,
      d.patient_count_custom,
      public.emt_safe_jsonb(d.note) as note_json,
      lead(d.dispatch_time) over (partition by d.session_id order by d.dispatch_time) as next_dispatch_time
    from public.duty_dispatches d
    join sessions s on s.id = d.session_id
  ),
  row_totals as (
    select
      greatest(
        0,
        floor(extract(epoch from (coalesce(r.next_dispatch_time, s.end_time, now()) - r.dispatch_time)) * 1000)
      )::bigint as row_ms,
      case
        when coalesce(r.note_json ->> 'segment', 'event') <> 'standby'
          and (r.next_dispatch_time is not null or s.end_time is not null)
        then 1
        else 0
      end as event_inc,
      case
        when coalesce(r.note_json ->> 'segment', 'event') = 'standby'
          or (r.next_dispatch_time is null and s.end_time is null)
        then 0
        when r.hospital = '其他' and r.hospital_custom = '未送'
        then 0
        when r.patient_count = '1'
        then 1
        when r.patient_count = '2'
        then 2
        when r.patient_count_custom ~ '^[0-9]+$'
        then greatest(0, r.patient_count_custom::int)
        else 0
      end as transported_inc
    from ordered_rows r
    join sessions s on s.id = r.session_id
  )
  select
    coalesce(sum(row_ms), 0)::bigint as duty_ms,
    coalesce(sum(event_inc), 0)::integer as event_count,
    coalesce(sum(transported_inc), 0)::integer as transported
  from row_totals;
$$;

grant execute on function public.get_duty_summary(timestamptz, timestamptz) to authenticated;

commit;
