"use client";

import { useState, type MouseEvent } from "react";
import { Check, Pencil } from "lucide-react";
import type { ChecklistItem, Profile, UUID } from "@goodtrip/shared";
import { doneCount, type ChecklistWithItems } from "@/lib/checklists";
import { Avatar } from "@/components/trip/avatar";
import { ChecklistEditorSheet } from "@/components/trip/checklist-editor-sheet";

/* The controls a checklist exposes to a human editing it directly. Every one of
   these is also reachable through Ask (#40/#41) — the panel confirms an AI
   proposal, this UI is the hands-on equivalent. All are optional so a caller can
   render a read-only list by omitting them; when present, an Edit button opens
   the editor sheet where the changes actually happen. */
export type ChecklistControls = {
  onAddItem?: (checklist: ChecklistWithItems, label: string) => void;
  onEditItem?: (item: ChecklistItem, label: string) => void;
  onRemoveItem?: (item: ChecklistItem) => void;
};

/* A read-only row: tap to toggle done. Editing lives in the sheet now, so the
   row stays calm — no hover-reveal buttons flickering in and out. */
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

/* Parked in the card's top-right corner (absolute) rather than inline in the
   title/summary row, so it never crowds the heading — and it's a tap target, not
   a hover-reveal, since this is a phone-first app. */
function EditButton({
  onClick,
  className,
}: {
  onClick: (event: MouseEvent) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Edit checklist"
      className={`absolute z-10 flex h-8 w-8 items-center justify-center rounded-full border border-cream/15 text-cream-muted transition-colors hover:border-gold/50 hover:text-cream active:bg-cream/10 ${className}`}
    >
      <Pencil className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

export function ChecklistSection({
  entry,
  profilesById,
  onToggle,
  heading = "h3",
  controls,
}: {
  entry: ChecklistWithItems;
  profilesById: Map<UUID, Profile>;
  onToggle: (item: ChecklistItem) => void;
  heading?: "h3" | "summary";
  controls?: ChecklistControls;
}) {
  let [editing, setEditing] = useState(false);
  let { done, total } = doneCount(entry);

  // Count sits right after the title so the top-right corner stays clear for the
  // Edit button.
  let count = (
    <span className="font-mono text-[11px] text-cream-muted">
      {done}/{total}
    </span>
  );
  let openEditor = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setEditing(true);
  };

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

  let sheet =
    editing && controls ? (
      <ChecklistEditorSheet
        entry={entry}
        onToggle={onToggle}
        controls={controls}
        onClose={() => setEditing(false)}
      />
    ) : null;

  if (heading === "summary") {
    return (
      <details className="group relative rounded-lg border border-cream/10 px-4 py-2">
        <summary className="flex cursor-pointer list-none items-center gap-3 py-1 pr-9 [&::-webkit-details-marker]:hidden">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70 transition-transform group-open:rotate-90">
            ›
          </span>
          <span className="text-sm font-medium">{entry.checklist.title}</span>
          {count}
          {/* Inside <summary> so it stays visible when the accordion is collapsed
              (a closed <details> hides its other children); absolutely placed so
              it sits in the corner, and it swallows the click so the tap opens the
              editor instead of toggling the accordion. */}
          {controls && <EditButton onClick={openEditor} className="right-2.5 top-2" />}
        </summary>
        {items}
        {sheet}
      </details>
    );
  }

  return (
    <section className="relative rounded-xl border border-cream/10 bg-ink-800/40 px-5 py-4">
      <h3 className="flex items-center gap-2.5 border-b border-gold/15 pb-2 pr-9">
        <span className="text-sm font-medium">{entry.checklist.title}</span>
        {count}
      </h3>
      {controls && <EditButton onClick={openEditor} className="right-3.5 top-3.5" />}
      {items}
      {sheet}
    </section>
  );
}
