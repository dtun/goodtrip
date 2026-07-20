-- Row-Level Security (spec section 15).
-- Every table has RLS enabled; access is gated through trip_members
-- (trip_member_access pattern). profiles are readable by all authenticated
-- users and writable only by their owner.

-- security definer so the check can read trip_members without recursing
-- through trip_members' own RLS policies.
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = p_trip_id
      and tm.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_trip_member(uuid) from public, anon;
grant execute on function public.is_trip_member(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.days enable row level security;
alter table public.activities enable row level security;
alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;
alter table public.activity_feed enable row level security;
alter table public.ai_conversations enable row level security;

-- profiles: read-all / write-own.
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- trips: members read and update; any authenticated user may create a trip
-- they own.
create policy "members read their trips"
  on public.trips for select
  to authenticated
  using (public.is_trip_member(id));

create policy "authenticated users create trips they own"
  on public.trips for insert
  to authenticated
  with check (created_by = (select auth.uid()));

create policy "members update their trips"
  on public.trips for update
  to authenticated
  using (public.is_trip_member(id))
  with check (public.is_trip_member(id));

-- trip_members: members see the roster; users join and leave as themselves.
-- (Self-serve join fits the single hardcoded-trip beta, spec section 13.)
create policy "members read the roster of their trips"
  on public.trip_members for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_trip_member(trip_id));

create policy "users join trips as themselves"
  on public.trip_members for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "users leave trips themselves"
  on public.trip_members for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- trip_member_access pattern for all trip-scoped content tables.
create policy "trip member access" on public.days
  for all to authenticated
  using (public.is_trip_member(trip_id))
  with check (public.is_trip_member(trip_id));

create policy "trip member access" on public.activities
  for all to authenticated
  using (public.is_trip_member(trip_id))
  with check (public.is_trip_member(trip_id));

create policy "trip member access" on public.checklists
  for all to authenticated
  using (public.is_trip_member(trip_id))
  with check (public.is_trip_member(trip_id));

create policy "trip member access" on public.checklist_items
  for all to authenticated
  using (public.is_trip_member(trip_id))
  with check (public.is_trip_member(trip_id));

create policy "trip member access" on public.activity_feed
  for all to authenticated
  using (public.is_trip_member(trip_id))
  with check (public.is_trip_member(trip_id));

create policy "trip member access" on public.ai_conversations
  for all to authenticated
  using (public.is_trip_member(trip_id))
  with check (public.is_trip_member(trip_id));
