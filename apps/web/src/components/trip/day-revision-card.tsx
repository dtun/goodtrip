/* The body of a whole-day revision confirmation card (#40 companion): when Ask
   proposes a revise_day action, the plan gets reworked as one unit — re-title,
   re-date, and a batch of activity add/edit/remove ops — so it renders as a
   structured before→after summary instead of a single terse line. */

import { ArrowRight, CalendarClock, Minus, Pencil, Plus } from "lucide-react";
import type { DayRevisionView } from "@/lib/ai";

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function DayRevisionSummary({ view }: { view: DayRevisionView }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
        <CalendarClock className="h-3 w-3" aria-hidden />
        Whole-day revision · Day {view.dayNumber}
      </p>

      {view.summary && <p className="mt-1.5 text-sm">{view.summary}</p>}

      {(view.titleChange || view.dateChange) && (
        <div className="mt-2.5 space-y-1">
          {view.titleChange && (
            <p className="flex flex-wrap items-center gap-1.5 text-xs text-cream-muted">
              <span className="font-mono uppercase tracking-wide text-cream-muted/70">Title</span>
              <span className="line-through opacity-60">{view.titleChange.from || "—"}</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-gold/70" aria-hidden />
              <span className="text-cream">{view.titleChange.to}</span>
            </p>
          )}
          {view.dateChange && (
            <p className="flex flex-wrap items-center gap-1.5 text-xs text-cream-muted">
              <span className="font-mono uppercase tracking-wide text-cream-muted/70">Date</span>
              <span className="line-through opacity-60">{formatDate(view.dateChange.from)}</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-gold/70" aria-hidden />
              <span className="text-cream">{formatDate(view.dateChange.to)}</span>
            </p>
          )}
        </div>
      )}

      {view.ops.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {view.ops.map((op, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              {op.kind === "add" && (
                <>
                  <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-label="Add" />
                  <span>
                    {op.title}
                    {op.meta && <span className="text-cream-muted"> · {op.meta}</span>}
                  </span>
                </>
              )}
              {op.kind === "update" && (
                <>
                  <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/80" aria-label="Edit" />
                  <span>
                    {op.name}
                    {op.changes.length > 0 && (
                      <span className="text-cream-muted"> · {op.changes.join(", ")}</span>
                    )}
                  </span>
                </>
              )}
              {op.kind === "remove" && (
                <>
                  <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-flag" aria-label="Remove" />
                  <span className="text-cream-muted">
                    <span className="line-through">{op.name}</span>
                    {op.meta && ` · ${op.meta}`}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
