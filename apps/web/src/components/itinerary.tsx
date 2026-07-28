import { ExternalLink, Check } from "lucide-react";
import {
  DAYS,
  TRIP,
  type Activity,
  type DayPlan,
  type Weather,
  type WeatherByDate,
} from "@/lib/trip";
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
  return cost === "Free" ? "text-espresso-muted" : "text-coral-700";
}

/* ── The on-screen editorial programme ───────────────────────── */

function ActivityRow({ a }: { a: Activity }) {
  const tone = costTone(a.cost);
  return (
    <li className="flex gap-4 py-4 first:pt-3">
      <span className="w-12 shrink-0 pt-1 font-mono text-[11px] uppercase leading-tight tracking-tight text-coral-700">
        {a.time}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[15px] font-semibold leading-snug text-espresso">{a.title}</p>
          {tone && (
            <span className={`shrink-0 font-mono text-[11px] tracking-wide ${tone}`}>{a.cost}</span>
          )}
        </div>
        {a.location && (
          <p className="mt-1 text-xs leading-snug text-espresso-muted">{a.location}</p>
        )}
        {(a.url || a.code || a.confirmed) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {a.url && (
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${a.cta ?? "Book"}: ${a.title} (opens in a new tab)`}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-coral-700 underline decoration-coral/30 underline-offset-[5px] transition-colors hover:decoration-coral"
              >
                {a.cta ?? "Book"}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
            {a.code && <CopyCode code={a.code} />}
            {a.confirmed && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-teal-700">
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

function DaySection({ d, w }: { d: DayPlan; w?: Weather }) {
  const tone = costTone(d.cost);
  const num = String(d.n).padStart(2, "0");
  return (
    <section className="sm:flex sm:gap-8">
      {/* desktop numeral rail */}
      <div className="hidden sm:block sm:w-16 sm:shrink-0 sm:pt-1 sm:text-right">
        <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-espresso-muted/70">
          Day
        </span>
        <span className="block font-display text-[3.25rem] font-extrabold leading-[0.8] text-coral">
          {num}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        {/* day header — numeral sits inline on mobile */}
        <div className="flex items-end gap-3 border-b border-sand-300 pb-3">
          <span className="font-display text-[2.6rem] font-extrabold leading-[0.8] text-coral sm:hidden">
            {num}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-espresso-muted">
              <span>
                {d.dow} · {d.date}
              </span>
              {w && (
                <span
                  className="inline-flex items-center gap-1.5 text-teal-700"
                  title={weatherLabel(w)}
                >
                  <WeatherIcon sky={w.sky} className="h-3.5 w-3.5" />
                  <span className="tracking-[0.1em]">
                    {w.hi}° / {w.lo}° · {w.summary}
                  </span>
                </span>
              )}
            </p>
            <h3 className="mt-1.5 font-display text-xl font-bold leading-tight text-espresso sm:text-2xl">
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
        <ul className="divide-y divide-sand-300">
          {d.activities.map((a, i) => (
            <ActivityRow key={i} a={a} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ItineraryTicket({ weather = {} }: { weather?: WeatherByDate }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-[1.75rem] border border-sand-300 bg-white px-5 py-10 shadow-[0_30px_80px_-40px_rgba(46,38,32,0.3)] sm:px-14 sm:py-14">
        {/* masthead */}
        <header className="text-center">
          <CompassRose className="mx-auto h-10 w-10 text-coral" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-coral-700">
            The Itinerary
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-none tracking-tight text-espresso sm:text-5xl">
            {TRIP.destination}
          </h2>
          <p className="mt-3 text-lg text-espresso-muted">{TRIP.name} · July 21–29, 2026</p>
        </header>

        {/* colophon */}
        <dl className="mt-9 grid grid-cols-2 gap-y-5 border-y border-sand-300 py-5 text-center sm:grid-cols-4 sm:divide-x sm:divide-sand-300">
          {COLOPHON.map(([k, v]) => (
            <div key={k} className="px-2">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-muted/80">
                {k}
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-espresso">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex justify-center">
          <PrintButton />
        </div>

        {/* ornamental divider */}
        <div className="my-10 flex items-center justify-center gap-4 sm:my-12">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-coral/40" />
          <CompassRose className="h-4 w-4 text-coral/60" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-coral/40" />
        </div>

        {/* programme */}
        <div className="space-y-12">
          {DAYS.map((d) => (
            <DaySection key={d.n} d={d} w={weather[d.iso]} />
          ))}
        </div>

        {/* dateline / livery cheatline */}
        <div className="mt-14 flex items-center gap-3">
          <span className="h-1 flex-1 rounded-full bg-gradient-to-r from-teal via-coral to-sun" />
        </div>
      </div>
    </div>
  );
}

/* ── Plain black-and-white printable sheet ───────────────────── */

export function PrintableItinerary({ weather = {} }: { weather?: WeatherByDate }) {
  return (
    <div className="hidden bg-white px-10 py-8 text-black print:block">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">Washington, D.C.</h1>
        <p className="text-sm">America’s 250th Birthday Family Trip · July 21–29, 2026</p>
        <p className="mt-1 text-xs">{TRIP.hotel.replace(/ · /g, " — ")}</p>
        <p className="text-xs">{MEMBERS_LINE.replace(/ · /g, ", ")}</p>
      </header>

      <div className="mt-4 space-y-4">
        {DAYS.map((d) => {
          const w = weather[d.iso];
          return (
            <section key={d.n} className="break-inside-avoid">
              <h2 className="text-sm font-bold">
                Day {d.n} · {d.dow} {d.date} — {d.title}
                <span className="font-normal"> ({d.cost})</span>
              </h2>
              {w && <p className="text-[11px] text-gray-600">Forecast: {weatherLabel(w)}</p>}
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
          );
        })}
      </div>

      <footer className="mt-6 border-t border-black pt-2 text-[11px]">
        goodtrip (DC 2026 Beta)
      </footer>
    </div>
  );
}
