# goodtrip-web

The GOODTrip web app. Ships in two parts today:

- `/` — the static landing page summarizing the GOODTrip plan and the DC 2026
  itinerary (printable).
- `/trip` — the Phase 1 walking skeleton grown through Phase 2–4: welcome
  screen (returning travelers get a magic sign-in link; new ones enter
  anonymously, spec §4) → claim-a-name → RLS-gated reads via
  [`@goodtrip/shared`](../../packages/shared) types → itinerary, live
  checklists, and AI chat. A signed-in session can link an email ("save your
  spot") so the identity survives cleared storage and other devices; magic
  links redirect back to `/trip`, which must be in the Supabase auth
  allow-list (see `supabase/config.toml`).

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
