-- GOODTrip initial schema (spec section 3).
-- All 9 tables: trips, trip_members, days, activities, checklists,
-- checklist_items, profiles, activity_feed, ai_conversations.
-- UUID primary keys, ISO 8601 UTC timestamps (timestamptz).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- One row per auth user; created on first sign-in.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_color text not null default '#3C3B6E' check (avatar_color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  destination text not null,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  lodging text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trips_set_updated_at
  before update on public.trips
  for each row execute function public.set_updated_at();

-- Membership gates all RLS access (spec section 15).
create table public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique (trip_id, user_id)
);

create index trip_members_user_id_idx on public.trip_members (user_id);

create table public.days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  day_number integer not null check (day_number > 0),
  date date not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, day_number)
);

create index days_trip_id_idx on public.days (trip_id);

create trigger days_set_updated_at
  before update on public.days
  for each row execute function public.set_updated_at();

-- trip_id is denormalized onto activities, checklists, checklist_items, and
-- activity_feed so RLS checks and Realtime subscriptions can filter by trip
-- without joins (spec section 5).
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  day_id uuid not null references public.days (id) on delete cascade,
  position integer not null default 0 check (position >= 0),
  time_label text,
  title text not null check (char_length(title) between 1 and 200),
  location text,
  cost text,
  confirmed boolean not null default false,
  confirmed_note text,
  booking_url text,
  booking_code text,
  booking_cta text,
  tags text[] not null default '{}',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index activities_trip_id_idx on public.activities (trip_id);
create index activities_day_id_position_idx on public.activities (day_id, position);

create trigger activities_set_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- Global to the trip when day_id is null, per-day otherwise.
create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  day_id uuid references public.days (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index checklists_trip_id_idx on public.checklists (trip_id);
create index checklists_day_id_idx on public.checklists (day_id);

create trigger checklists_set_updated_at
  before update on public.checklists
  for each row execute function public.set_updated_at();

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  checklist_id uuid not null references public.checklists (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 300),
  position integer not null default 0 check (position >= 0),
  done boolean not null default false,
  done_by uuid references public.profiles (id) on delete set null,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index checklist_items_trip_id_idx on public.checklist_items (trip_id);
create index checklist_items_checklist_id_position_idx
  on public.checklist_items (checklist_id, position);

create trigger checklist_items_set_updated_at
  before update on public.checklist_items
  for each row execute function public.set_updated_at();

create table public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  verb text not null check (char_length(verb) between 1 and 60),
  target text not null,
  created_at timestamptz not null default now()
);

create index activity_feed_trip_id_created_at_idx
  on public.activity_feed (trip_id, created_at desc);

-- Present from Phase 1 but unused until Phase 4 (AI).
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_conversations_trip_id_idx on public.ai_conversations (trip_id);

create trigger ai_conversations_set_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_updated_at();
