# supabase

Backend for GOODTrip: Postgres schema, row-level security policies, Realtime
configuration, edge functions, and seed data.

> **Status:** placeholder. Contents are created across the Phase 1 / Phase 4
> issues (see the repo's GitHub issues / milestones).

## Planned layout

```
supabase/
  migrations/        # SQL schema migrations (trips, days, activities, …)
  functions/
    ai-chat/         # Edge Function: Anthropic Claude API proxy
  seed.sql           # DC trip seed data (section 16 of the spec)
  config.toml        # Supabase CLI config
```

## Tables (spec section 3)

`trips`, `trip_members`, `days`, `activities`, `checklists`, `checklist_items`,
`profiles`, `activity_feed`, `ai_conversations`.

All tables have RLS enabled; access is gated through `trip_members` (spec
section 15).
