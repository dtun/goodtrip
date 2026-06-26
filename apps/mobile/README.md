# goodtrip-mobile

The GOODTrip iOS app — React Native (Expo) + Supabase. This is the primary v1.0
deliverable described in [`/goodtrip_app_spec.md`](../../goodtrip_app_spec.md).

> **Status:** placeholder. The Expo project is scaffolded in the Phase 1
> foundation issues (see the repo's GitHub issues / milestones).

## Planned stack

| Layer      | Choice                                |
| ---------- | ------------------------------------- |
| Framework  | React Native 0.76+ (New Architecture) |
| Tooling    | Expo + EAS Build (TestFlight)         |
| Navigation | React Navigation v7                   |
| Backend    | Supabase (`@supabase/supabase-js`)    |
| Styling    | NativeWind v4                         |
| State      | Jotai + TanStack Query v5             |
| Auth       | Supabase Auth + Apple Sign In         |

See `../../supabase` for the database schema, RLS policies, edge functions,
and seed data.
