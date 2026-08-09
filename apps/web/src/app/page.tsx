import { Lightbulb, Shuffle, Sparkles, Users, ArrowRight, Github } from "lucide-react";
import { CompassRose } from "@/components/compass-rose";
import { AppMockup } from "@/components/app-mockup";
import {
  ExamplePicker,
  ExampleTripProvider,
  SelectedPrintableItinerary,
} from "@/components/example-showcase";
import { ShareBar } from "@/components/share-bar";
import { WaitlistForm } from "@/components/waitlist-form";
import { EXAMPLE_TRIPS, FEATURED_EXAMPLE_TRIP } from "@/lib/example-trip";
import { fetchTripWeather } from "@/lib/weather";

// Refresh the live forecast hourly so real weather appears even if the page
// was first built without network access.
export const revalidate = 3600;

const areas = [
  {
    icon: Sparkles,
    title: "Chat with your itinerary",
    body: "Ask what's on tomorrow, what's still unbooked, or where to eat near the museum. GOODTrip has read the whole plan, so you never explain it twice.",
  },
  {
    icon: Lightbulb,
    title: "Suggestions, not surprises",
    body: "It proposes a stop, a dinner, a rainy-day swap. Every idea stays marked as a suggestion until somebody accepts it.",
  },
  {
    icon: Shuffle,
    title: "Change it as you go",
    body: "Move an afternoon, swap a dinner, drop the stop that isn't working. The day reshapes around it and the packing list keeps up.",
  },
  {
    icon: Users,
    title: "Multiplayer from the first tap",
    body: "No owner, no read-only guests. Everyone plans, checks things off, and edits the same live itinerary — no more group-chat archaeology.",
  },
];

const stack = ["Next.js", "React Native · Expo", "Supabase", "Realtime", "Claude"];

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral-700">{children}</p>
  );
}

function SectionHead({
  kicker,
  title,
  intro,
}: {
  kicker: string;
  title: React.ReactNode;
  intro: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Kicker>{kicker}</Kicker>
      <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-espresso sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-espresso-muted sm:text-lg">
        {intro}
      </p>
    </div>
  );
}

export default async function Home() {
  // One forecast per example trip — the picker can show any of them, and each
  // sits in a different place.
  const forecasts = await Promise.all(
    EXAMPLE_TRIPS.map((trip) =>
      fetchTripWeather(
        trip.days.map((d) => d.iso),
        trip.coords,
      ),
    ),
  );
  const weather = Object.fromEntries(EXAMPLE_TRIPS.map((trip, i) => [trip.id, forecasts[i]]));
  return (
    <ExampleTripProvider>
      <div className="sunwash relative min-h-screen font-sans text-espresso print:hidden">
        {/* ── Top bar ───────────────────────────────────────── */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <CompassRose className="h-6 w-6 text-coral" />
            <span className="font-display text-lg font-extrabold tracking-tight text-espresso">
              GOODTrip
            </span>
          </div>
          <nav className="flex items-center gap-2 text-sm font-medium text-espresso-muted sm:gap-6">
            <a href="#how" className="hidden transition-colors hover:text-espresso sm:inline">
              How it works
            </a>
            <a href="#example" className="hidden transition-colors hover:text-espresso sm:inline">
              Example
            </a>
            <a
              href="#waitlist"
              className="rounded-full bg-coral-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral-800"
            >
              Join the waitlist
            </a>
          </nav>
        </header>

        <main id="content">
          {/* ── Hero ──────────────────────────────────────────── */}
          <section className="mx-auto max-w-3xl px-6 pb-16 pt-12 text-center sm:pt-20">
            <span className="reveal inline-flex items-center gap-2 rounded-full border border-coral/25 bg-coral-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-coral-700">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              Coming soon
            </span>

            <h1
              className="reveal mt-7 font-display text-[clamp(3.5rem,13vw,8rem)] font-extrabold leading-[0.9] tracking-tight text-espresso"
              style={{ animationDelay: "0.06s" }}
            >
              GOOD<span className="text-coral-700">Trip</span>
            </h1>

            <p
              className="reveal mx-auto mt-7 max-w-xl text-base leading-relaxed text-espresso-muted sm:text-lg"
              style={{ animationDelay: "0.18s" }}
            >
              The group trip planner that plans <em className="not-italic text-espresso">with</em>{" "}
              you. Chat with your itinerary, take the suggestions worth taking, change whatever
              isn&rsquo;t working — and everyone sees it the moment you do.
            </p>

            {/* waitlist capture — the primary action */}
            <div className="reveal mt-9" style={{ animationDelay: "0.24s" }}>
              <WaitlistForm source="landing-hero" />
              <p className="mt-4 text-sm text-espresso-muted">
                Or{" "}
                <a
                  href="#example"
                  className="font-medium text-coral-700 underline decoration-coral/30 underline-offset-4 transition-colors hover:decoration-coral"
                >
                  explore an example trip
                </a>{" "}
                — no sign-up.
              </p>
            </div>

            {/* quick facts */}
            <dl
              className="reveal mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-3 text-left sm:grid-cols-4"
              style={{ animationDelay: "0.3s" }}
            >
              {[
                ["Status", "Private beta"],
                ["Platform", "Web now · iOS next"],
                ["Built for", "Families"],
                ["Price", "Free in beta"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3 shadow-[0_1px_0_rgba(46,38,32,0.02)]"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-espresso-muted">
                    {k}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-espresso">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ── How it works ──────────────────────────────────── */}
          <section id="how" className="scroll-mt-20 px-6 py-20 sm:py-28">
            <SectionHead
              kicker="How it works"
              title={
                <>
                  The itinerary that <span className="text-coral-700">talks back.</span>
                </>
              }
              intro="Ask it anything about the trip. Take the suggestions that fit, change the ones that don't, and watch everyone else's plan move with yours. Tap through it."
            />

            <div className="mt-14">
              <AppMockup weather={weather[FEATURED_EXAMPLE_TRIP.id]} />
            </div>

            {/* four areas */}
            <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2">
              {areas.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="group rounded-3xl border border-sand-300 bg-sand-100 p-6 transition-colors hover:border-coral/40 sm:p-7"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral-soft text-coral-700 transition-colors group-hover:bg-coral-700 group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold text-espresso">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-espresso-muted">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── An example trip ───────────────────────────────── */}
          <section id="example" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
            <SectionHead
              kicker="Example trips"
              title={
                <>
                  What a GOODTrip <span className="text-coral-700">looks like.</span>
                </>
              }
              intro="Three sample trips, built exactly the way a real one is — things booked, things still open, and a few GOODTrip suggested. Pick one and read it end to end."
            />

            <ExamplePicker weather={weather} />
          </section>

          {/* ── Built in the open (compact) ───────────────────── */}
          <section className="px-6 pb-4 pt-8">
            <div className="mx-auto max-w-3xl">
              <a
                href="https://github.com/dtun/goodtrip"
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center justify-between gap-4 rounded-3xl border border-sand-300 bg-sand-100 px-6 py-5 transition-colors hover:border-espresso/25"
              >
                <span className="flex items-center gap-3">
                  <Github className="h-5 w-5 text-espresso" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-bold text-espresso">Built in the open</span>
                    <span className="block text-sm text-espresso-muted">
                      Follow the build at dtun/goodtrip, issue by issue.
                    </span>
                  </span>
                </span>
                <ArrowRight
                  className="h-5 w-5 shrink-0 text-coral transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-sand-300 px-3 py-1 text-xs font-medium text-espresso-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── Waitlist CTA ──────────────────────────────────── */}
          <section id="waitlist" className="scroll-mt-20 px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-coral/20 bg-gradient-to-b from-coral-soft to-sand-100 px-6 py-14 text-center sm:px-14">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-coral-700">
                <CompassRose className="h-5 w-5 text-coral" />
                Now boarding
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-espresso sm:text-4xl">
                Be first in line.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-espresso-muted">
                Drop your email — we&apos;ll tell you the moment GOODTrip opens.
              </p>
              <div className="mt-8">
                <WaitlistForm source="landing-cta" />
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer className="border-t border-sand-300">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-12 text-center">
            <div className="flex items-center gap-2.5">
              <CompassRose className="h-6 w-6 text-coral" />
            </div>

            <ShareBar />

            <p className="mt-2 text-xs text-espresso-muted">
              Coming soon · Collaborative AI itineraries for families
            </p>
          </div>
        </footer>
      </div>

      {/* Plain B/W sheet — only rendered when printing */}
      <SelectedPrintableItinerary weather={weather} />
    </ExampleTripProvider>
  );
}
