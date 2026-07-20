-- Realtime (spec section 5): publish the tables clients subscribe to,
-- scoped by trip_id on the client side.

-- The supabase_realtime publication exists on hosted and local stacks; create
-- it only when applying to a bare Postgres (e.g. CI verification).
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end;
$$;

alter publication supabase_realtime
  add table public.activities, public.checklist_items, public.activity_feed;

-- Full replica identity so update/delete events carry the old row, letting
-- clients reconcile without a refetch.
alter table public.activities replica identity full;
alter table public.checklist_items replica identity full;
alter table public.activity_feed replica identity full;
