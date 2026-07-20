# goodtrip-web

The GOODTrip web app. Ships in two parts today:

- `/` — the static landing page summarizing the GOODTrip plan and the DC 2026
  itinerary (printable).
- `/trip` — the Phase 1 walking skeleton: anonymous sign-in → self-join the
  seeded beta trip → RLS-gated read of days + activities via
  [`@goodtrip/shared`](../../packages/shared) types → read-only render. The
  Phase 2 screens grow from here.

Built with Next.js 14, Tailwind CSS, lucide-react, and supabase-js. The
product was originally spec'd as an iOS app ([`apps/mobile`](../mobile));
web ships first, mobile follows with the same Supabase backend.

## Develop

From the repo root:

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # fill in Supabase URL + anon key
pnpm dev:web        # http://localhost:3000
```

`/trip` needs a running Supabase backend — see
[`supabase/README.md`](../../supabase/README.md). The landing page works
without one.

Or from this directory: `pnpm dev`, `pnpm build`, `pnpm test`.
