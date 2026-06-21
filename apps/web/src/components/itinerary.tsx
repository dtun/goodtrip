import { ExternalLink } from "lucide-react";
import { DAYS, TRIP, type Activity } from "@/lib/trip";
import { CompassRose } from "@/components/compass-rose";
import { PrintButton } from "@/components/print-button";

const MEMBERS_LINE = "Danny · Ellen · Jack · Eva · Elizabeth · Elisha · GG · Papa";

function prettyUrl(u: string) {
  return u.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

/* ── The on-screen boarding-pass itinerary ───────────────────── */

function TicketRow({ a }: { a: Activity }) {
  return (
    <div className="flex gap-4 py-2.5">
      <span className="w-16 shrink-0 pt-0.5 font-mono text-[11px] uppercase tracking-tight text-gold/80">
        {a.time}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-snug text-cream">{a.title}</p>
        {a.location && (
          <p className="mt-0.5 text-xs leading-snug text-cream-muted">
            {a.location}
          </p>
        )}
        {(a.url || a.code) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {a.url && (
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${a.cta ?? "Book"}: ${a.title} (opens in a new tab)`}
                className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-gold hover:text-ink"
              >
                {a.cta ?? "Book"}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
            {a.code && (
              <span className="font-mono text-[10px] uppercase tracking-wide text-cream-muted">
                code <span className="font-semibold text-gold">{a.code}</span>
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {a.cost && a.cost !== "—" && (
          <span className="whitespace-nowrap rounded-sm border border-cream/15 px-1.5 py-0.5 font-mono text-[10px] text-cream-muted">
            {a.cost}
          </span>
        )}
        {a.confirmed && (
          <span className="-rotate-6 select-none whitespace-nowrap rounded-sm bg-flag px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white">
            Confirmed
          </span>
        )}
      </div>
    </div>
  );
}

export function ItineraryTicket() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-gold/25 bg-ink-800/80 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] backdrop-blur">
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-gold/20 px-6 py-5">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
              Itinerary · Jul 21–29 ’26
            </p>
            <p className="mt-1 font-display text-xl text-cream">{TRIP.name}</p>
            <p className="mt-1.5 text-xs text-cream-muted">{TRIP.hotel}</p>
            <p className="mt-0.5 text-[11px] text-cream-muted">{MEMBERS_LINE}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3">
            <CompassRose className="h-10 w-10 text-gold" />
            <PrintButton />
          </div>
        </div>

        {/* perforation */}
        <div className="dotrule h-0.5 text-gold/40" />

        {/* days */}
        <div className="px-6 py-4">
          {DAYS.map((d) => (
            <div key={d.n} className="pt-3 first:pt-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-xs font-semibold tracking-[0.15em] text-gold">
                  DAY {String(d.n).padStart(2, "0")}
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
                {d.activities.map((a, i) => (
                  <TicketRow key={i} a={a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* footer — livery cheatline */}
        <div className="flex items-center gap-3 border-t border-gold/20 px-6 py-3">
          <span className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#3C3B6E] via-flag to-gold" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-muted">
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
        <p className="mt-1 text-xs">
          {TRIP.hotel.replace(/ · /g, " — ")}
        </p>
        <p className="text-xs">{MEMBERS_LINE.replace(/ · /g, ", ")}</p>
      </header>

      <div className="mt-4 space-y-4">
        {DAYS.map((d) => (
          <section key={d.n} className="break-inside-avoid">
            <h2 className="text-sm font-bold">
              Day {d.n} · {d.dow} {d.date} — {d.title}
              <span className="font-normal"> ({d.cost})</span>
            </h2>
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
