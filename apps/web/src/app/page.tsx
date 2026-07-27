import Link from "next/link";
import {
  CalendarDays,
  ListChecks,
  Sparkles,
  Plane,
  MapPin,
  ArrowRight,
  Github,
} from "lucide-react";
import { CompassRose } from "@/components/compass-rose";
import { AppMockup } from "@/components/app-mockup";
import { ItineraryTicket, PrintableItinerary } from "@/components/itinerary";
import { ShareBar } from "@/components/share-bar";
import { WaitlistForm } from "@/components/waitlist-form";
import { DAYS } from "@/lib/trip";
import { fetchTripWeather } from "@/lib/weather";

// Refresh the live forecast hourly so real weather appears even if the page
// was first built without network access.
export const revalidate = 3600;

const areas = [
  {
    icon: CalendarDays,
    code: "01",
    title: "Itinerary",
    body: "Every day of the trip, its activities in order, full details you can edit. One living plan the whole group manages together.",
  },
  {
    icon: ListChecks,
    code: "02",
    title: "Checklists",
    body: "Trip-level packing and per-day routines. Any member checks or unchecks any item — one tap, synced to everyone instantly.",
  },
  {
    icon: Sparkles,
    code: "03",
    title: "Ask GOODTrip",
    body: "An AI guide with the whole trip in context. Recaps a day, suggests dinner nearby, reworks a rained-out afternoon — on your okay.",
  },
  {
    icon: Plane,
    code: "04",
    title: "Trip",
    body: "Destination, dates, the roster with who's online right now, and a live feed of what the rest of the group is doing.",
  },
];

// The example trip's destinations are DC, but GOODTrip is for any small-group
// trip — these hint at the range without pretending to be real bookings.
const tripKinds = [
  "A weekend in Lisbon",
  "A bachelor party in Nashville",
  "A family reunion in the Smokies",
  "Nine days in Washington, D.C.",
];

const phases = [
  {
    n: "I",
    title: "Foundation",
    body: "Supabase schema, RLS & Realtime, auth, and a seeded example trip to build against.",
  },
  {
    n: "II",
    title: "Core Itinerary",
    body: "Home, day list, day & activity detail — wired to live activity updates.",
  },
  {
    n: "III",
    title: "Checklists + Multiplayer",
    body: "Global & per-day checklists, optimistic toggles, presence, activity feed.",
  },
  {
    n: "IV",
    title: "AI",
    body: "ai-chat edge function, chat UI, trip-context injection, one-tap actions.",
  },
  {
    n: "V",
    title: "Launch",
    body: "Web polish, iOS via TestFlight, onboarding — then the waitlist gets in.",
  },
];

const stack = [
  "Next.js",
  "React Native · Expo",
  "Supabase",
  "Realtime + RLS",
  "TanStack Query",
  "Claude · sonnet-4-6",
];

function Cheatline({ className = "" }: { className?: string }) {
  return <div className={`h-1 rounded-full bg-gradient-to-r from-flag to-gold ${className}`} />;
}

function ActHeader({
  index,
  kicker,
  title,
  intro,
}: {
  index: string;
  kicker: string;
  title: React.ReactNode;
  intro: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-[0.4em]">
        <span className="text-gold">{index}</span>
        <span className="h-3 w-px bg-flag" />
        <span className="text-gold/70">{kicker}</span>
      </div>
      <h2 className="mt-6 font-display font-semibold leading-[0.95] tracking-tight text-cream [font-size:clamp(2.5rem,7vw,4.5rem)]">
        {title}
      </h2>
      <Cheatline className="mx-auto mt-7 w-24" />
      <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-cream-muted sm:text-lg">
        {intro}
      </p>
    </div>
  );
}

export default async function Home() {
  const weather = await fetchTripWeather(DAYS.map((d) => d.iso));
  return (
    <>
      <div className="nightsky relative min-h-screen overflow-hidden font-sans print:hidden">
        {/* faint giant compass behind hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-0 h-[820px] w-[820px] -translate-x-1/2 opacity-[0.5]"
        >
          <CompassRose className="spin-slow h-full w-full text-gold" />
        </div>

        {/* ── Top bar ───────────────────────────────────────── */}
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <CompassRose className="h-6 w-6 text-gold" />
            <span className="font-mono text-sm font-semibold uppercase tracking-[0.25em] text-cream">
              GOODTrip
            </span>
          </div>
          <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-[0.2em] text-cream-muted">
            <a href="#app" className="hidden transition-colors hover:text-gold sm:inline">
              How it works
            </a>
            <a href="#example" className="hidden transition-colors hover:text-gold sm:inline">
              Example
            </a>
            <Link href="/trip" className="transition-colors hover:text-gold">
              Preview
            </Link>
            <a href="#waitlist" className="text-gold transition-colors hover:text-gold-bright">
              Join
            </a>
          </nav>
        </header>

        <main id="content">
          {/* ── Hero ──────────────────────────────────────────── */}
          <section className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-16 text-center sm:pt-24">
            <p className="reveal font-mono text-[11px] uppercase tracking-[0.5em] text-gold sm:text-xs">
              Coming soon · Est. MMXXVI
            </p>

            <h1
              className="reveal text-shadow-gold mt-7 font-display font-semibold leading-[0.86] tracking-tight text-cream"
              style={{ fontSize: "clamp(4rem, 15vw, 11rem)", animationDelay: "0.08s" }}
            >
              GOOD
              <span className="text-gold">Trip</span>
            </h1>

            <p
              className="reveal mt-4 font-display text-2xl italic text-cream/90 sm:text-3xl"
              style={{ animationDelay: "0.16s" }}
            >
              Have a GOOD trip.
            </p>

            <Cheatline className="reveal mx-auto mt-7 w-28" />

            <p
              className="reveal mx-auto mt-8 max-w-xl text-[15px] leading-relaxed text-cream-muted sm:text-base"
              style={{ animationDelay: "0.24s" }}
            >
              A collaborative, AI-assisted travel itinerary for small groups — a road trip, a
              reunion, a bachelor party, a family holiday. GOODTrip turns a structured plan into a
              shared, living experience, so everyone always knows what&apos;s happening, what&apos;s
              checked off, and what&apos;s next.
            </p>

            {/* waitlist capture — the primary action */}
            <div className="reveal mt-10" style={{ animationDelay: "0.28s" }}>
              <WaitlistForm source="landing-hero" />
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-cream-muted">
                Or{" "}
                <Link
                  href="/trip"
                  className="text-gold underline decoration-gold/30 underline-offset-[5px] transition-colors hover:text-gold-bright hover:decoration-gold"
                >
                  explore a live example trip
                </Link>{" "}
                — no sign-up
              </p>
            </div>

            {/* boarding-pass meta strip */}
            <dl
              className="reveal mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-gold/25 bg-gold/[0.04] text-left sm:grid-cols-4"
              style={{ animationDelay: "0.32s" }}
            >
              {[
                ["Status", "Private beta"],
                ["Platform", "Web now · iOS next"],
                ["Built for", "Small groups"],
                ["Price", "Free while in beta"],
              ].map(([k, v]) => (
                <div key={k} className="bg-ink/40 px-4 py-3">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
                    {k}
                  </dt>
                  <dd className="mt-1 text-sm text-cream">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ════════ ACT I · HOW IT WORKS ════════ */}
          <section id="app" className="relative z-10 scroll-mt-20 px-6 py-24 sm:py-32">
            <ActHeader
              index="01"
              kicker="How it works"
              title={
                <>
                  The itinerary,
                  <br />
                  <span className="text-gold">alive.</span>
                </>
              }
              intro="Build the plan once, together. Then it travels with you — live in every pocket. Everyone sees it update in real time, checks off what's packed, and asks an AI guide that already knows the whole trip. Here's an early look — tap through it."
            />

            <div className="mt-16">
              <AppMockup weather={weather} />
            </div>

            {/* hierarchy */}
            <div className="mx-auto mt-24 max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-gold/70">
                Opinionated structure
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 font-display text-2xl text-cream sm:text-3xl">
                <span>Trip</span>
                <ArrowRight className="h-5 w-5 text-gold/70" aria-hidden="true" />
                <span>Days</span>
                <ArrowRight className="h-5 w-5 text-gold/70" aria-hidden="true" />
                <span>Activities</span>
              </div>
              <p className="mx-auto mt-5 max-w-md text-sm text-cream-muted">
                A simple hierarchy, always. Real-time multiplayer, offline-first, AI woven through —
                not bolted on.
              </p>
            </div>

            {/* four areas */}
            <div className="mx-auto mt-16 max-w-5xl">
              <div className="grid gap-px overflow-hidden rounded-xl border border-cream/10 bg-cream/10 sm:grid-cols-2">
                {areas.map(({ icon: Icon, code, title, body }) => (
                  <div
                    key={title}
                    className="group bg-ink-800 p-7 transition-colors hover:bg-ink-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-ink">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs text-cream-muted">{code}</span>
                    </div>
                    <h3 className="mt-5 font-display text-xl text-cream">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-cream-muted">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════ ACT II · AN EXAMPLE TRIP ════════ */}
          <section id="example" className="relative z-10 scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
            <ActHeader
              index="02"
              kicker="An example trip"
              title={
                <>
                  What a GOODTrip
                  <br />
                  <span className="text-gold">looks like.</span>
                </>
              }
              intro="Here's a real one to make it concrete — nine days in Washington, D.C. for a family of eight, over America's 250th birthday. Yours could be any of these. Same structure, any destination, any group. Hit print for a plain copy to carry."
            />

            {/* range of trips this could be */}
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
              {tripKinds.map((kind, i) => (
                <span
                  key={kind}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] ${
                    i === tripKinds.length - 1
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-cream/15 text-cream/70"
                  }`}
                >
                  {kind}
                </span>
              ))}
            </div>

            <div className="mt-14">
              <ItineraryTicket weather={weather} />
            </div>
          </section>

          {/* ════════ ACT III · BUILT IN THE OPEN ════════ */}
          <section id="tech" className="relative z-10 scroll-mt-20 px-6 py-24 sm:py-32">
            <ActHeader
              index="03"
              kicker="Built in the open"
              title={
                <>
                  On the way
                  <br />
                  to <span className="text-gold">launch.</span>
                </>
              }
              intro="A web app on Supabase with Claude woven in, and a React Native app close behind. One pnpm monorepo, five phases, real-time and offline-first from the start — shipped issue by issue, in public."
            />

            {/* route to v1.0 */}
            <div className="mx-auto mt-16 max-w-3xl">
              <ol className="relative space-y-8 border-l border-gold/25 pl-8">
                {phases.map(({ n, title, body }) => (
                  <li key={n} className="relative">
                    <span className="absolute -left-[42px] flex h-7 w-7 items-center justify-center rounded-full border border-flag/50 bg-ink font-mono text-[11px] font-semibold text-gold">
                      {n}
                    </span>
                    <h3 className="font-display text-lg text-cream">
                      Phase {n} · {title}
                    </h3>
                    <p className="mt-1 text-sm text-cream-muted">{body}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* stack */}
            <div className="mx-auto mt-16 max-w-3xl">
              <p className="text-center font-mono text-[11px] uppercase tracking-[0.4em] text-gold/70">
                Built with
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-cream/15 px-3.5 py-1.5 font-mono text-xs text-cream/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* github callout */}
            <div className="mx-auto mt-14 max-w-xl">
              <a
                href="https://github.com/dtun/goodtrip"
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-cream/12 bg-ink-800/60 px-6 py-5 transition-colors hover:border-gold/40"
              >
                <span className="flex items-center gap-3">
                  <Github className="h-5 w-5 text-cream" />
                  <span>
                    <span className="block text-sm font-semibold text-cream">dtun/goodtrip</span>
                    <span className="block text-xs text-cream-muted">
                      Follow the build, issue by issue.
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </section>

          {/* ════════ WAITLIST CTA ════════ */}
          <section
            id="waitlist"
            className="relative z-10 scroll-mt-20 px-6 pb-8 pt-4 text-center sm:pb-16"
          >
            <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-gold/25 bg-ink-800/60 px-6 py-14 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)] backdrop-blur sm:px-14">
              <CompassRose className="mx-auto h-10 w-10 text-gold" />
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.5em] text-gold/70">
                Now boarding
              </p>
              <h2 className="mt-4 font-display font-semibold leading-[0.95] tracking-tight text-cream [font-size:clamp(2rem,6vw,3.25rem)]">
                Be first through the gate.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-cream-muted sm:text-base">
                Drop your email and we&apos;ll let you know the moment GOODTrip opens — starting
                with the web app, iOS right behind it.
              </p>
              <div className="mt-9">
                <WaitlistForm source="landing-cta" />
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer className="relative z-10 border-t border-cream/10">
          <Cheatline className="mx-auto w-full max-w-none rounded-none" />
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-14 text-center">
            <CompassRose className="h-8 w-8 text-gold" />
            <p className="font-display text-xl italic text-cream">Have a GOOD trip.</p>

            <ShareBar />

            <p className="mt-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted">
              <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              GOODTrip · Coming soon · Collaborative AI itineraries
            </p>
          </div>
        </footer>
      </div>

      {/* Plain B/W sheet — only rendered when printing */}
      <PrintableItinerary weather={weather} />
    </>
  );
}
