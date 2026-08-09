// Where this deployment lives, as one absolute origin. Metadata that must be
// absolute — sitemap entries, the `Sitemap:` line in robots.txt — builds off
// this rather than guessing at request time.
//
// Resolution order: an explicit NEXT_PUBLIC_SITE_URL wins (set it to the
// canonical apex, https://goodtrip.info, so preview builds can still point at
// production when that's what we want), then Vercel's production hostname,
// then localhost for `next dev` and tests.
//
// NOTE: `layout.tsx` still carries its own inline copy of this expression for
// `metadataBase`. It should adopt this module in a follow-up — the two are
// intentionally identical today.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
