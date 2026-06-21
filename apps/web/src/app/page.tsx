import {
  CalendarDays,
  ListChecks,
  Sparkles,
  Plane,
  MapPin,
  ArrowRight,
} from "lucide-react";

/* ── Decorative compass rose ──────────────────────────────────── */
function CompassRose({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="96" stroke="#C9A84C" strokeOpacity="0.25" />
      <circle cx="100" cy="100" r="74" stroke="#C9A84C" strokeOpacity="0.18" />
      <circle
        cx="100"
        cy="100"
        r="86"
        stroke="#C9A84C"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeDasharray="1 7"
      />
      <circle cx="100" cy="100" r="40" stroke="#C9A84C" strokeOpacity="0.2" />
      {/* diagonal (short) points */}
      <path
        d="M100 38 L112 100 L100 162 L88 100 Z"
        fill="#C9A84C"
        fillOpacity="0.25"
        transform="rotate(45 100 100)"
      />
      <path
        d="M38 100 L100 112 L162 100 L100 88 Z"
        fill="#C9A84C"
        fillOpacity="0.25"
        transform="rotate(45 100 100)"
      />
      {/* cardinal (long) points */}
      <path d="M100 20 L110 100 L100 100 L90 100 Z" fill="#E6CB78" />
      <path d="M100 180 L110 100 L100 100 L90 100 Z" fill="#C9A84C" />
      <path d="M20 100 L100 110 L100 100 L100 90 Z" fill="#C9A84C" />
      <path d="M180 100 L100 110 L100 100 L100 90 Z" fill="#C9A84C" />
      <circle cx="100" cy="100" r="5" fill="#E6CB78" />
    </svg>
  );
}

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

/* The real DC itinerary — America's 250th Birthday family trip, Jul 21–29 2026 */
type Row = {
  time: string;
  title: string;
  place: string;
  badge?: string;
  confirmed?: boolean;
};
type Day = {
  n: string;
  dow: string;
  date: string;
  title: string;
  cost: string;
  rows: Row[];
};

const days: Day[] = [
  {
    n: "01",
    dow: "Tue",
    date: "Jul 21",
    title: "Arrival & Settle In",
    cost: "Free",
    rows: [
      {
        time: "PM",
        title: "Check in & stock the kitchen",
        place: "Residence Inn · CVS / Wawa across the street",
      },
      {
        time: "Eve",
        title: "White House lit at night",
        place: "12-min walk south — no tickets, no lines",
      },
      {
        time: "Din",
        title: "Founding Farmers",
        place: "1924 Pennsylvania Ave NW · farm-to-table",
        badge: "~$240",
      },
    ],
  },
  {
    n: "02",
    dow: "Wed",
    date: "Jul 22",
    title: "Capitol Tour + Ford’s Theatre",
    cost: "Free",
    rows: [
      {
        time: "10:30",
        title: "U.S. Capitol Building Tour",
        place: "via Sen. Mark Kelly’s office · arrive 10:00 AM, REAL ID",
        confirmed: true,
      },
      {
        time: "1:00",
        title: "Ford’s Theatre",
        place: "511 10th St NW · where Lincoln was shot",
        badge: "$3",
      },
      {
        time: "3:00",
        title: "Return to hotel — rest",
        place: "Mandatory afternoon reset",
      },
    ],
  },
  {
    n: "03",
    dow: "Thu",
    date: "Jul 23",
    title: "Mount Vernon",
    cost: "~$184",
    rows: [
      {
        time: "9:00",
        title: "Washington’s Mansion tour",
        place: "Both floors restored for the 250th · arrive at opening",
      },
      {
        time: "—",
        title: "4D Revolutionary War Theater",
        place: "Snow falls, cannons fire — all ages love it",
      },
      {
        time: "Lun",
        title: "Mount Vernon Inn Restaurant",
        place: "Depart 2:30–3:00 PM · code SPRING2026",
        badge: "−20%",
      },
    ],
  },
  {
    n: "04",
    dow: "Fri",
    date: "Jul 24",
    title: "Museum of the Bible",
    cost: "~$320",
    rows: [
      {
        time: "10:00",
        title: "Dead Sea Scrolls",
        place: "Floor 5 · timed entry · 24 scroll fragments",
      },
      {
        time: "—",
        title: "Megiddo Mosaic",
        place: "Free lobby · oldest known Christian worship site",
        badge: "Free",
      },
      {
        time: "Eve",
        title: "The Wharf waterfront dinner",
        place: "code CIC25 saves 25% on GA",
      },
    ],
  },
  {
    n: "05",
    dow: "Sat",
    date: "Jul 25",
    title: "Rest Day + Monument Walk",
    cost: "Free",
    rows: [
      {
        time: "AM",
        title: "Unscheduled — protect this day",
        place: "Sleep in · laundry · catch up on photos",
      },
      {
        time: "7:00",
        title: "Evening Monument Walk",
        place: "WWII Memorial → Lincoln Memorial · sunset ~8:25 PM",
      },
      {
        time: "New",
        title: "Lincoln Memorial Undercroft",
        place: "$69M museum opening July 2026",
      },
    ],
  },
  {
    n: "06",
    dow: "Sun",
    date: "Jul 26",
    title: "Worship + Holocaust Museum",
    cost: "Free",
    rows: [
      {
        time: "10:30",
        title: "Capitol Hill Baptist Church",
        place: "525 A St NE · Eastern Market Metro",
      },
      {
        time: "1:30",
        title: "Holocaust Memorial Museum",
        place: "‘Daniel’s Story’ (ages 8+) · timed passes",
        badge: "$1",
      },
    ],
  },
  {
    n: "07",
    dow: "Mon",
    date: "Jul 27",
    title: "Museum of American History",
    cost: "Free",
    rows: [
      {
        time: "10:00",
        title: "Star-Spangled Banner",
        place: "The actual 1814 flag · America 250 mega-exhibit",
      },
      {
        time: "Lun",
        title: "Mitsitam Native Foods Café",
        place: "Museum of the American Indian · voted best on the Mall",
        badge: "$$",
      },
      {
        time: "Eve",
        title: "National Portrait Gallery",
        place: "Free · open until 7 PM",
      },
    ],
  },
  {
    n: "08",
    dow: "Tue",
    date: "Jul 28",
    title: "National Archives + Dinner",
    cost: "Free + dinner",
    rows: [
      {
        time: "10:00",
        title: "The Rotunda",
        place: "Declaration · Constitution · 1297 Magna Carta",
        badge: "$1",
      },
      {
        time: "5:30",
        title: "Old Ebbitt Grill",
        place: "675 15th St NW · est. 1856 · party of 8",
        badge: "~$330–420",
      },
    ],
  },
  {
    n: "09",
    dow: "Wed",
    date: "Jul 29",
    title: "Departure Day",
    cost: "Free",
    rows: [
      {
        time: "AM",
        title: "Final breakfast & checkout",
        place: "Pack · store luggage if needed",
      },
      {
        time: "Opt",
        title: "National Portrait Gallery",
        place: "Opens 11:30 AM · one hour max",
      },
      {
        time: "✈",
        title: "Reagan National (DCA)",
        place: "Metro Blue/Yellow from McPherson Sq · ~25 min",
      },
    ],
  },
];

function ActivityRow({ time, title, place, badge, confirmed }: Row) {
  return (
    <div className="group flex gap-4 py-2.5 transition-colors hover:bg-gold/[0.04]">
      <span className="w-10 shrink-0 pt-0.5 font-mono text-[11px] uppercase tracking-tight text-gold/80">
        {time}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-snug text-cream">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-cream-muted">{place}</p>
      </div>
      {confirmed ? (
        <span className="shrink-0 -rotate-6 select-none self-start whitespace-nowrap rounded-sm border border-flag/70 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-flag">
          Confirmed
        </span>
      ) : badge ? (
        <span className="shrink-0 self-start whitespace-nowrap rounded-sm border border-cream/15 px-1.5 py-0.5 font-mono text-[10px] text-cream-muted">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

export default function Home() {
  return (
    <div className="nightsky relative min-h-screen overflow-hidden font-sans">
      {/* faint giant compass behind hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-0 h-[820px] w-[820px] -translate-x-1/2 opacity-[0.5]"
      >
        <CompassRose className="spin-slow h-full w-full" />
      </div>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <CompassRose className="h-6 w-6" />
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

      {/* ── Itinerary artifact ──────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl leading-tight text-cream sm:text-4xl">
            One trip. Every day.
            <br />
            <span className="text-gold">Shared in real time.</span>
          </h2>
          <span className="hidden font-mono text-xs uppercase tracking-[0.2em] text-cream-muted sm:block">
            9 days · family of 8
          </span>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-gold/25 bg-ink-800/80 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] backdrop-blur">
            {/* ticket header */}
            <div className="flex items-start justify-between gap-4 border-b border-gold/20 px-6 py-5">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
                  Itinerary · Jul 21–29 ’26
                </p>
                <p className="mt-1 font-display text-xl text-cream">
                  America&apos;s 250th Birthday
                </p>
                <p className="mt-1.5 text-xs text-cream-muted">
                  Residence Inn · 1199 Vermont Ave NW · McPherson Square Metro
                </p>
                <p className="mt-0.5 text-[11px] text-cream-muted">
                  Danny · Ellen · Jack · Eva · Elizabeth · Elisha · GG · Papa
                </p>
              </div>
              <CompassRose className="h-10 w-10 shrink-0" />
            </div>

            {/* perforation */}
            <div className="dotrule h-0.5 text-gold/40" />

            <div className="px-6 py-4">
              {days.map((d) => (
                <div key={d.n} className="pt-3 first:pt-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono text-xs font-semibold tracking-[0.15em] text-gold">
                      DAY {d.n}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-cream-muted">
                      {d.dow} {d.date}
                    </span>
                    <span className="font-display text-[15px] text-cream">
                      {d.title}
                    </span>
                    <span className="ml-auto whitespace-nowrap rounded-sm border border-gold/25 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-gold/80">
                      {d.cost}
                    </span>
                  </div>
                  <div className="mb-1 mt-2 h-px bg-gold/12" />
                  <div className="divide-y divide-cream/5">
                    {d.rows.map((r, i) => (
                      <ActivityRow key={i} {...r} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ticket footer */}
            <div className="flex items-center justify-between border-t border-gold/20 px-6 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-muted">
                Eva checked off “Sunscreen” · 2m ago
              </span>
              <span className="flex -space-x-1.5">
                {["#B22234", "#C9A84C", "#3C6E5A", "#4C5BC9"].map((c, i) => (
                  <span
                    key={i}
                    className="h-5 w-5 rounded-full border border-ink-800"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>
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
          A simple hierarchy, always. Real-time multiplayer, offline-first,
          AI woven through — not bolted on.
        </p>
      </section>

      {/* ── Four areas ──────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 h-px hairline" />
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
          <CompassRose className="h-8 w-8" />
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
