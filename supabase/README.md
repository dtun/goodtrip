# supabase

Backend for GOODTrip: Postgres schema, row-level security policies, Realtime
configuration, edge functions, and seed data.

## Layout

```
supabase/
  migrations/
    20260720000100_initial_schema.sql   # all 9 tables (spec section 3)
    20260720000200_rls_policies.sql     # RLS + is_trip_member() (spec section 15)
    20260720000300_realtime.sql         # Realtime publication (spec section 5)
  seed.sql           # DC trip seed data (spec section 16)
  config.toml        # Supabase CLI config (anonymous sign-ins enabled)
```

The `ai-chat` Edge Function (Anthropic Claude API proxy) lands in Phase 4
(issue #24).

## Local development

Requires Docker and the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
supabase start     # boots the local stack, applies migrations
supabase db reset  # re-applies migrations and runs seed.sql
```

`supabase start` prints the API URL and anon key for `apps/web/.env.local`.
The seeded trip id (`NEXT_PUBLIC_GOODTRIP_TRIP_ID`) is
`11111111-1111-4111-8111-111111111111`.

Without Docker, migrations and the seed can still be verified against a fresh
Postgres — they are plain SQL with no platform-specific dependencies beyond
the `auth` schema (stub `auth.users` + `auth.uid()` for bare-Postgres runs).

## Tables (spec section 3)

`trips`, `trip_members`, `days`, `activities`, `checklists`, `checklist_items`,
`profiles`, `activity_feed`, `ai_conversations`.

All tables have RLS enabled; access is gated through `trip_members` via the
security-definer `is_trip_member()` helper (spec section 15). `profiles` is
read-all / write-own. Users may insert and delete only their own
`trip_members` row — first launch signs in anonymously and self-joins the
hardcoded beta trip (spec sections 4 and 13).

`activities`, `checklist_items`, and `activity_feed` are in the
`supabase_realtime` publication; clients scope subscriptions by the
denormalized `trip_id` column (spec section 5).

## Seed data (spec section 16)

"Washington DC — America's 250th Birthday", Jul 21–29 2026: 8 family
profiles, 9 days, 31 activities (confirmed flags, booking links and codes),
Clothing/Essentials/Documents global checklists, Morning/Evening checklists
for Days 2–8, and a starter activity feed. Content mirrors
`apps/web/src/lib/trip.ts`. The `auth.users` inserts are local-dev stubs that
satisfy the `profiles` foreign key.
