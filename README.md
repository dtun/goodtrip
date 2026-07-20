# GOODTrip

> _Have a GOOD trip._

GOODTrip is a collaborative, AI-assisted travel itinerary app for small groups.
It turns a structured trip plan into a shared, living experience — so every
member of the party always knows what's happening, what's checked off, and
what's next.

The product spec is tracked through the repo's GitHub issues and Phase 1–5
milestones. Originally spec'd as an iOS app, GOODTrip ships **web-first**: the
same Supabase backend serves both, and the mobile app follows.

## Monorepo layout

This is a [pnpm workspace](https://pnpm.io/workspaces).

```
goodtrip/
  apps/
    mobile/      # GOODTrip iOS app — React Native (Expo) + Supabase  [follows web]
    web/         # GOODTrip web app — Next.js + Supabase  [ships first]
  packages/
    shared/      # Shared TypeScript types + AI action contracts
  supabase/      # Postgres schema, RLS, Realtime, edge functions, seed data
```

## Getting started

```bash
pnpm install
```

| Command                               | What it does                      |
| ------------------------------------- | --------------------------------- |
| `pnpm dev:web`                        | Run the web app (landing + /trip) |
| `pnpm build:web`                      | Build the web app                 |
| `pnpm test`                           | Run tests across all workspaces   |
| `pnpm --filter goodtrip-web <script>` | Run a script in a workspace       |

The `/trip` route needs a Supabase backend — see
[`supabase/README.md`](./supabase/README.md) for local setup. The build order
follows the GitHub issues / Phase 1–5 milestones, adapted web-first.

## Stack

**Web (ships first):** Next.js 14 · Tailwind CSS · supabase-js ·
Supabase (Postgres + Realtime + Auth + Edge Functions) · Anthropic Claude
(`claude-sonnet-4-6`) via edge function (Phase 4).

**Mobile (follows):** React Native 0.76+ (New Architecture) · Expo + EAS
Build · React Navigation v7 · NativeWind v4 · Jotai · TanStack Query v5 ·
Apple Sign In — on the same Supabase backend and `@goodtrip/shared` types.
