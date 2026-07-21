import { ExternalLink, Check } from "lucide-react";
import { DAYS, TRIP, type Activity, type DayPlan } from "@/lib/trip";
import { CompassRose } from "@/components/compass-rose";
import { PrintButton } from "@/components/print-button";
import { CopyCode } from "@/components/copy-code";
import { WeatherIcon, weatherLabel } from "@/components/weather-badge";

const MEMBERS_LINE = "Danny · Ellen · Jack · Eva · Elizabeth · Elisha · GG · Papa";

const COLOPHON: [string, string][] = [
  ["Dates", "Jul 21–29 ’26"],
  ["Party", "Family of 8"],
  ["Lodging", "Residence Inn"],
  ["Transit", "McPherson Sq"],
];

function prettyUrl(u: string) {
  return u
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function costTone(cost?: string) {
  if (!cost || cost === "—") return null;
  return cost === "Free" ? "text-cream-muted" : "text-gold/90";
}

/* ── The on-screen editorial programme ───────────────────────── */

function ActivityRow({ a }: { a: Activity }) {
  const tone = costTone(a.cost);
  return (
    <li className="flex gap-4 py-4 first:pt-3">
      <span className="w-12 shrink-0 pt-1 font-mono text-[11px] uppercase leading-tight tracking-tight text-gold/70">
        {a.time}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[15px] font-medium leading-snug text-cream">{a.title}</p>
          {tone && (
            <span className={`shrink-0 font-mono text-[11px] tracking-wide ${tone}`}>{a.cost}</span>
          )}
        </div>
        {a.location && <p className="mt-1 text-xs leading-snug text-cream-muted">{a.location}</p>}
        {(a.url || a.code || a.confirmed) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {a.url && (
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${a.cta ?? "Book"}: ${a.title} (opens in a new tab)`}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gold underline decoration-gold/30 underline-offset-[5px] transition-colors hover:text-gold-bright hover:decoration-gold"
              >
                {a.cta ?? "Book"}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
            {a.code && <CopyCode code={a.code} />}
            {a.confirmed && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
                <Check className="h-3 w-3" aria-hidden="true" />
                {a.confirmedNote ?? "Confirmed"}
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function DaySection({ d }: { d: DayPlan }) {
  const tone = costTone(d.cost);
  const num = String(d.n).padStart(2, "0");
  return (
    <section className="sm:flex sm:gap-8">
      {/* desktop numeral rail */}
      <div className="hidden sm:block sm:w-16 sm:shrink-0 sm:pt-1 sm:text-right">
        <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-gold/50">
          Day
        </span>
        <span className="block font-display text-[3.25rem] leading-[0.8] text-gold">{num}</span>
      </div>

      <div className="min-w-0 flex-1">
        {/* day header — numeral sits inline on mobile */}
        <div className="flex items-end gap-3 border-b border-gold/15 pb-3">
          <span className="font-display text-[2.6rem] leading-[0.8] text-gold sm:hidden">
            {num}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted">
              <span>
                {d.dow} · {d.date}
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-gold/80"
                title={weatherLabel(d.weather)}
              >
                <WeatherIcon sky={d.weather.sky} className="h-3.5 w-3.5" />
                <span className="tracking-[0.1em]">
                  {d.weather.hi}° / {d.weather.lo}° · {d.weather.summary}
                </span>
              </span>
            </p>
            <h3 className="mt-1.5 font-display text-xl leading-tight text-cream sm:text-2xl">
              {d.title}
            </h3>
          </div>
          {tone && (
            <span
              className={`shrink-0 self-end pb-0.5 font-mono text-xs uppercase tracking-[0.15em] ${tone}`}
            >
              {d.cost}
            </span>
          )}
        </div>
        <ul className="divide-y divide-cream/[0.08]">
          {d.activities.map((a, i) => (
            <ActivityRow key={i} a={a} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ItineraryTicket() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-[1.75rem] border border-gold/20 bg-ink-800/60 px-5 py-10 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)] backdrop-blur sm:px-14 sm:py-14">
        {/* masthead */}
        <header className="text-center">
          <CompassRose className="mx-auto h-10 w-10 text-gold" />
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.5em] text-gold/70">
            The Itinerary
          </p>
          <h2 className="mt-4 font-display text-4xl leading-none text-cream sm:text-5xl">
            {TRIP.destination}
          </h2>
          <p className="mt-3 font-display text-lg italic text-cream/80">
            {TRIP.name} · July 21–29, 2026
          </p>
        </header>

        {/* colophon */}
        <dl className="mt-9 grid grid-cols-2 gap-y-5 border-y border-gold/15 py-5 text-center sm:grid-cols-4 sm:divide-x sm:divide-gold/15">
          {COLOPHON.map(([k, v]) => (
            <div key={k} className="px-2">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/60">{k}</dt>
              <dd className="mt-1.5 text-sm text-cream">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex justify-center">
          <PrintButton />
        </div>

        {/* ornamental divider */}
        <div className="my-10 flex items-center justify-center gap-4 text-gold/50 sm:my-12">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40" />
          <CompassRose className="h-4 w-4 text-gold/60" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* programme */}
        <div className="space-y-12">
          {DAYS.map((d) => (
            <DaySection key={d.n} d={d} />
          ))}
        </div>

        {/* dateline / livery cheatline */}
        <div className="mt-14 flex items-center gap-3">
          <span className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#3C3B6E] via-flag to-gold" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream-muted">
            Have a GOOD trip
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Plain black-and-white printable sheet ───────────────────── */

export function PrintableItinerary() {
  return (
    <div className="hidden bg-white px-10 py-8 text-black print:block">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">Washington, D.C.</h1>
        <p className="text-sm">America’s 250th Birthday Family Trip · July 21–29, 2026</p>
        <p className="mt-1 text-xs">{TRIP.hotel.replace(/ · /g, " — ")}</p>
        <p className="text-xs">{MEMBERS_LINE.replace(/ · /g, ", ")}</p>
      </header>

      <div className="mt-4 space-y-4">
        {DAYS.map((d) => (
          <section key={d.n} className="break-inside-avoid">
            <h2 className="text-sm font-bold">
              Day {d.n} · {d.dow} {d.date} — {d.title}
              <span className="font-normal"> ({d.cost})</span>
            </h2>
            <p className="text-[11px] text-gray-600">Forecast: {weatherLabel(d.weather)}</p>
            <ul className="mt-1 border-l-2 border-gray-300 pl-3">
              {d.activities.map((a, i) => (
                <li key={i} className="py-0.5 text-[13px] leading-snug">
                  <span className="inline-block w-20 font-semibold">{a.time}</span>
                  {a.title}
                  {a.location ? `, ${a.location}` : ""}
                  {a.cost && a.cost !== "—" ? ` (${a.cost})` : ""}
                  {a.confirmed && a.confirmedNote ? ` — ${a.confirmedNote}` : ""}
                  {a.url ? (
                    <span className="text-gray-600">
                      {" "}
                      — {a.cta ?? "Book"}: {prettyUrl(a.url)}
                      {a.code ? ` (code ${a.code})` : ""}
                    </span>
                  ) : (
                    ""
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="mt-6 border-t border-black pt-2 text-[11px]">
        GOODTrip · Have a GOOD trip. · goodtrip (DC 2026 Beta)
      </footer>
    </div>
  );
}
