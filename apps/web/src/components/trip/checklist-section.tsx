"use client";

import { Check } from "lucide-react";
import type { ChecklistItem, Profile, UUID } from "@goodtrip/shared";
import { doneCount, type ChecklistWithItems } from "@/lib/checklists";
import { Avatar } from "@/components/trip/avatar";

function ItemRow({
  item,
  doneBy,
  onToggle,
}: {
  item: ChecklistItem;
  doneBy: Profile | undefined;
  onToggle: (item: ChecklistItem) => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={item.done}
        onClick={() => onToggle(item)}
        className="flex w-full items-start gap-3 py-2.5 text-left"
      >
        <span
          aria-hidden
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            item.done ? "border-gold bg-gold text-ink" : "border-cream/30"
          }`}
        >
          {item.done && <Check className="h-3.5 w-3.5" />}
        </span>
        <span
          className={`min-w-0 flex-1 text-sm leading-snug ${
            item.done ? "text-cream-muted line-through decoration-cream/30" : ""
          }`}
        >
          {item.label}
        </span>
        {item.done && doneBy && (
          <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <Avatar profile={doneBy} size="h-4 w-4 text-[8px]" />
            <span className="font-mono text-[10px] uppercase tracking-wide text-cream-muted">
              {doneBy.display_name}
            </span>
          </span>
        )}
      </button>
    </li>
  );
}

export function ChecklistSection({
  entry,
  profilesById,
  onToggle,
  heading = "h3",
}: {
  entry: ChecklistWithItems;
  profilesById: Map<UUID, Profile>;
  onToggle: (item: ChecklistItem) => void;
  heading?: "h3" | "summary";
}) {
  let { done, total } = doneCount(entry);
  let title = (
    <>
      <span className="text-sm font-medium">{entry.checklist.title}</span>
      <span className="ml-auto font-mono text-[11px] text-cream-muted">
        {done}/{total}
      </span>
    </>
  );

  let items = (
    <ul className="divide-y divide-cream/[0.06]">
      {entry.items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          doneBy={item.done_by ? profilesById.get(item.done_by) : undefined}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );

  if (heading === "summary") {
    return (
      <details className="group rounded-lg border border-cream/10 px-4 py-2">
        <summary className="flex cursor-pointer list-none items-baseline gap-3 py-1 [&::-webkit-details-marker]:hidden">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70 transition-transform group-open:rotate-90">
            ›
          </span>
          {title}
        </summary>
        {items}
      </details>
    );
  }

  return (
    <section className="rounded-xl border border-cream/10 bg-ink-800/40 px-5 py-4">
      <h3 className="flex items-baseline gap-3 border-b border-gold/15 pb-2">{title}</h3>
      {items}
    </section>
  );
}
