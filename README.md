# GOODTrip

> *Have a GOOD trip.*

GOODTrip is a collaborative, AI-assisted travel itinerary app for small groups.
It turns a structured trip plan into a shared, living experience — so every
member of the party always knows what's happening, what's checked off, and
what's next.

The full product specification lives in [`goodtrip_app_spec.md`](./goodtrip_app_spec.md).

## Monorepo layout

This is a [pnpm workspace](https://pnpm.io/workspaces).

```
goodtrip/
  apps/
    mobile/      # GOODTrip iOS app — React Native (Expo) + Supabase  [v1.0 deliverable]
    web/         # Legacy Next.js AI travel-planner (parked; web companion is v2)
  packages/
    shared/      # Shared TypeScript types + AI action contracts
  supabase/      # Postgres schema, RLS, Realtime, edge functions, seed data
```

## Getting started

```bash
pnpm install
```

| Command            | What it does                          |
| ------------------ | ------------------------------------- |
| `pnpm dev:web`     | Run the legacy Next.js web app        |
| `pnpm build:web`   | Build the web app                     |
| `pnpm test`        | Run tests across all workspaces       |
| `pnpm --filter goodtrip-web <script>` | Run a script in a workspace |

The mobile app and Supabase backend are built out through the GitHub issues /
milestones tracking the spec's Phase 1–5 build order.

## Stack (v1.0 mobile)

React Native 0.76+ (New Architecture) · Expo + EAS Build · React Navigation v7 ·
Supabase (Postgres + Realtime + Auth + Edge Functions) · NativeWind v4 · Jotai ·
TanStack Query v5 · Apple Sign In · Anthropic Claude (`claude-sonnet-4-6`) via
edge function.
