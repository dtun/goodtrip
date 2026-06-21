import {
  CalendarDays,
  ListChecks,
  Sparkles,
  Plane,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { CompassRose } from "@/components/compass-rose";
import { AppMockup } from "@/components/app-mockup";

const areas = [
  {
    icon: CalendarDays,
    code: "01",
    title: "Itinerary",
    body: "Browse every day, drill into its activities in order, and edit full details. The living plan everyone manages on the road.",
  },
  {
    icon: ListChecks,
    code: "02",
    title: "Checklists",
    body: "Trip-level packing and per-day routines. Any member checks or unchecks any item — one tap, synced to everyone.",
  },
  {
    icon: Sparkles,
    code: "03",
    title: "Ask GOODTrip",
    body: "An AI guide with the whole trip in context. Recaps a day, suggests dinner nearby, and adds it to the plan on your okay.",
  },
  {
    icon: Plane,
    code: "04",
    title: "Trip",
    body: "Destination, dates, the roster with who's online right now, and a live feed of what the rest of the group is doing.",
  },
];

const phases = [
  {
    n: "I",
    title: "Foundation",
    body: "Expo + EAS + TestFlight, Supabase schema & RLS, Apple Sign In, seeded DC trip.",
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
    title: "Polish",
    body: "App icon & splash, TestFlight submission, onboarding the crew.",
  },
];

const stack = [
  "React Native 0.76",
  "Expo · EAS",
  "React Navigation v7",
  "Supabase",
  "NativeWind v4",
  "Jotai",
  "TanStack Query v5",
  "Apple Sign In",
  "Claude · sonnet-4-6",
];

export default function Home() {
  return (
    <div className="nightsky relative min-h-screen overflow-hidden font-sans">
      {/* faint giant compass behind hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-0 h-[820px] w-[820px] -translate-x-1/2 opacity-[0.5]"
      >
        <CompassRose className="spin-slow h-full w-full text-gold" />
      </div>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <CompassRose className="h-6 w-6 text-gold" />
          <span className="font-mono text-sm font-semibold uppercase tracking-[0.25em] text-cream">
            GOODTrip
          </span>
        </div>
        <a
          href="https://github.com/dtun/goodtrip"
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-xs uppercase tracking-[0.2em] text-cream-muted transition-colors hover:text-gold"
        >
          GitHub ↗
        </a>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-10 pt-16 text-center sm:pt-24">
        <p className="reveal font-mono text-[11px] uppercase tracking-[0.5em] text-gold sm:text-xs">
          Est. MMXXVI · Washington · D.C.
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

        <p
          className="reveal mx-auto mt-8 max-w-xl text-[15px] leading-relaxed text-cream-muted sm:text-base"
          style={{ animationDelay: "0.24s" }}
        >
          A collaborative, AI-assisted travel itinerary for small groups. It
          turns a structured plan into a shared, living experience — so everyone
          always knows what&apos;s happening, what&apos;s checked off, and
          what&apos;s next.
        </p>

        {/* boarding-pass meta strip */}
        <dl
          className="reveal mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-gold/25 bg-gold/[0.04] text-left sm:grid-cols-4"
          style={{ animationDelay: "0.32s" }}
        >
          {[
            ["Destination", "Washington, D.C."],
            ["Dates", "Jul 21–29 ’26"],
            ["Party", "Family of 8"],
            ["Platform", "iOS · TestFlight"],
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

      {/* ── The app (interactive mockup) ────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <div className="mb-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-gold/70">
            The app
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-tight text-cream sm:text-4xl">
            One trip. Every day.{" "}
            <span className="text-gold">Shared in real time.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-cream-muted">
            An early look at GOODTrip on iOS — the real DC itinerary, checklists,
            and AI guide. Tap through it.
          </p>
        </div>

        <AppMockup />
      </section>

      {/* ── Hierarchy ───────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-gold/70">
          Opinionated structure
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 font-display text-2xl text-cream sm:text-3xl">
          <span>Trip</span>
          <ArrowRight className="h-5 w-5 text-gold/60" />
          <span>Days</span>
          <ArrowRight className="h-5 w-5 text-gold/60" />
          <span>Activities</span>
        </div>
        <p className="mt-5 text-sm text-cream-muted">
          A simple hierarchy, always. Real-time multiplayer, offline-first, AI
          woven through — not bolted on.
        </p>
      </section>

      {/* ── Four areas ──────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 hairline h-px" />
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
              <p className="mt-2 text-sm leading-relaxed text-cream-muted">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The plan (route) ────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-20">
        <h2 className="font-display text-3xl text-cream sm:text-4xl">
          The route to v1.0
        </h2>
        <p className="mt-3 text-sm text-cream-muted">
          Five phases, one destination — TestFlight, July 2026.
        </p>

        <ol className="relative mt-12 space-y-8 border-l border-gold/25 pl-8">
          {phases.map(({ n, title, body }) => (
            <li key={n} className="relative">
              <span className="absolute -left-[42px] flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-ink font-mono text-[11px] font-semibold text-gold">
                {n}
              </span>
              <h3 className="font-display text-lg text-cream">
                Phase {n} · {title}
              </h3>
              <p className="mt-1 text-sm text-cream-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Stack ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-gold/70">
          Built with
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {stack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-cream/15 px-3.5 py-1.5 font-mono text-xs text-cream/80"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-12 text-center">
          <CompassRose className="h-8 w-8 text-gold" />
          <p className="font-display text-xl italic text-cream">
            Have a GOOD trip.
          </p>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted">
            <MapPin className="h-3.5 w-3.5 text-flag" />
            GOODTrip · Spec v0.1 · Collaborative AI itineraries
          </p>
        </div>
      </footer>
    </div>
  );
}
