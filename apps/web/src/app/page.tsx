import {
  CalendarDays,
  ListChecks,
  Sparkles,
  Plane,
  Compass,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const areas = [
  {
    icon: CalendarDays,
    title: "Itinerary",
    body: "Browse every trip day, drill into its activities in order, and view or edit full details — the living plan everyone manages during the trip.",
  },
  {
    icon: ListChecks,
    title: "Checklists",
    body: "Trip-level packing and prep, plus per-day morning and evening routines. Any member can check or uncheck any item in one tap.",
  },
  {
    icon: Sparkles,
    title: "Ask GOODTrip",
    body: "An AI assistant with full awareness of the trip — answer questions, summarize a day, suggest a dinner nearby, or add it to the plan.",
  },
  {
    icon: Plane,
    title: "Trip",
    body: "Dates, destination, the member roster with who's online, and a live feed of what the rest of the group has been doing.",
  },
];

const phases = [
  {
    n: 1,
    title: "Foundation",
    body: "Expo + EAS + TestFlight pipeline, Supabase schema & RLS, Apple Sign In, and the seeded DC trip.",
  },
  {
    n: 2,
    title: "Core Itinerary",
    body: "Home, day list, day detail, and activity detail screens — wired to live activity updates.",
  },
  {
    n: 3,
    title: "Checklists + Multiplayer",
    body: "Global & per-day checklists, optimistic toggles, presence, and the activity feed.",
  },
  {
    n: 4,
    title: "AI",
    body: "The ai-chat edge function, chat UI, trip-context injection, and one-tap AI actions.",
  },
  {
    n: 5,
    title: "Polish",
    body: "App icon & splash, TestFlight submission, and onboarding the rest of the testers.",
  },
];

const stack = [
  "React Native 0.76+",
  "Expo · EAS Build",
  "React Navigation v7",
  "Supabase",
  "NativeWind v4",
  "Jotai",
  "TanStack Query v5",
  "Apple Sign In",
  "Claude (claude-sonnet-4-6)",
];

const principles = [
  ["Shared truth", "Every user sees the same state in real time."],
  ["Low friction", "Checking something off takes exactly one tap."],
  ["AI as guide", "The assistant knows the trip and actually helps."],
  ["Opinionated structure", "Trip → Days → Activities. Always simple."],
];

export default function Home() {
  return (
    <div className="text-[#111111]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#3C3B6E] to-[#2C2B53] px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#C9A84C]">
            <Compass className="h-3.5 w-3.5" />
            Spec v0.1 · DC 2026 Beta
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
            GOODTrip
          </h1>
          <p className="mt-3 text-xl text-[#C9A84C]">Have a GOOD trip.</p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            A collaborative, AI-assisted travel itinerary app for small groups.
            It turns a structured trip plan into a shared, living experience — so
            everyone always knows what&apos;s happening, what&apos;s checked off,
            and what&apos;s next.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#B22234]" />
              Washington DC · July 21–29, 2026
            </span>
            <span>iOS · TestFlight · v1.0</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* Principles */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#666666]">
            Design principles
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(([title, body]) => (
              <div key={title} className="border-l-2 border-[#C9A84C] pl-4">
                <h3 className="font-semibold text-[#3C3B6E]">{title}</h3>
                <p className="mt-1 text-sm text-[#666666]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* App areas */}
        <section className="mt-20">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#666666]">
            Four areas, one bottom nav
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {areas.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="border-[#E0E0E0] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3C3B6E]/10 text-[#3C3B6E]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#666666]">
                  {body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Build roadmap */}
        <section className="mt-20">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#666666]">
            Build order
          </h2>
          <ol className="mt-6 space-y-4">
            {phases.map(({ n, title, body }) => (
              <li
                key={n}
                className="flex gap-4 rounded-lg border border-[#E0E0E0] bg-white p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B22234] font-bold text-white">
                  {n}
                </span>
                <div>
                  <h3 className="font-semibold text-[#3C3B6E]">
                    Phase {n} — {title}
                  </h3>
                  <p className="mt-1 text-sm text-[#666666]">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Stack */}
        <section className="mt-20">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#666666]">
            Stack
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#E0E0E0] bg-white px-3 py-1.5 text-sm text-[#111111]"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-[#E0E0E0] px-6 py-10 text-center text-sm text-[#666666]">
        GOODTrip · Spec v0.1 · Collaborative AI travel itineraries for small
        groups.
      </footer>
    </div>
  );
}
