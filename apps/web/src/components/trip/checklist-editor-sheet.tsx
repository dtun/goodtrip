"use client";

/* The checklist editor: a bottom sheet that slides up from an "Edit" button and
   holds every structural change in one place — toggle, rename (always-editable),
   remove, add. It replaces the old per-row hover buttons, which flickered in and
   out and never worked on touch. `entry` is the live list from page state, so
   optimistic edits (and realtime echoes) re-render the rows in place. */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Plus, Trash2 } from "lucide-react";
import type { ChecklistItem } from "@goodtrip/shared";
import { doneCount, type ChecklistWithItems } from "@/lib/checklists";
import type { ChecklistControls } from "@/components/trip/checklist-section";

function EditorItemRow({
  item,
  onToggle,
  onEditItem,
  onRemoveItem,
}: {
  item: ChecklistItem;
  onToggle: (item: ChecklistItem) => void;
} & Pick<ChecklistControls, "onEditItem" | "onRemoveItem">) {
  let inputRef = useRef<HTMLInputElement>(null);

  // Uncontrolled + commit-on-blur: Enter and Escape both blur the field, so
  // exactly one commit path runs — no controlled re-render clobbering keystrokes,
  // no double-write latch. Empty edits snap back to the current label.
  function commit() {
    let el = inputRef.current;
    if (!el) return;
    let next = el.value.trim();
    if (!next) {
      el.value = item.label;
      return;
    }
    if (next !== item.label) onEditItem?.(item, next);
  }

  return (
    <li className="flex items-center gap-2 py-1.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.done}
        aria-label={`${item.done ? "Uncheck" : "Check"} “${item.label}”`}
        onClick={() => onToggle(item)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          item.done ? "border-gold bg-gold text-ink" : "border-cream/30"
        }`}
      >
        {item.done && <Check className="h-3.5 w-3.5" aria-hidden />}
      </button>

      {onEditItem ? (
        <input
          // Remount when the committed label changes elsewhere (realtime, Ask)
          // so the field reflects it; a keystroke never changes this key.
          key={item.label}
          ref={inputRef}
          defaultValue={item.label}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            } else if (event.key === "Escape") {
              event.currentTarget.value = item.label;
              event.currentTarget.blur();
            }
          }}
          aria-label={`Rename “${item.label}”`}
          className={`min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none transition-colors hover:border-cream/10 focus:border-gold/50 focus:bg-ink/40 ${
            item.done ? "text-cream-muted line-through decoration-cream/30" : ""
          }`}
        />
      ) : (
        <span
          className={`min-w-0 flex-1 px-2 text-sm ${item.done ? "text-cream-muted line-through" : ""}`}
        >
          {item.label}
        </span>
      )}

      {onRemoveItem && (
        <button
          type="button"
          onClick={() => onRemoveItem(item)}
          aria-label={`Remove “${item.label}”`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-cream-muted transition-colors hover:bg-flag/15 hover:text-flag"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      )}
    </li>
  );
}

function AddItemField({
  entry,
  onAddItem,
}: {
  entry: ChecklistWithItems;
  onAddItem: NonNullable<ChecklistControls["onAddItem"]>;
}) {
  let [label, setLabel] = useState("");
  let inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    let next = label.trim();
    if (!next) return;
    setLabel("");
    onAddItem(entry, next);
    inputRef.current?.focus(); // stay put so a few items go in a row
  }

  return (
    <form
      className="mt-1 flex items-center gap-2 border-t border-cream/[0.08] pt-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-cream/25 text-cream-muted"
      >
        <Plus className="h-3 w-3" />
      </span>
      <input
        ref={inputRef}
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Add an item…"
        aria-label={`Add an item to ${entry.checklist.title}`}
        className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-cream-muted/50"
      />
      <button
        type="submit"
        disabled={!label.trim()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden /> Add
      </button>
    </form>
  );
}

export function ChecklistEditorSheet({
  entry,
  onToggle,
  controls,
  onClose,
}: {
  entry: ChecklistWithItems;
  onToggle: (item: ChecklistItem) => void;
  controls: ChecklistControls;
  onClose: () => void;
}) {
  // Two-flag animation: `entered` drives the slide-in on the first frame,
  // `leaving` drives the slide-out; onClose fires once the exit transition ends.
  let [entered, setEntered] = useState(false);
  let [leaving, setLeaving] = useState(false);
  let sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Double rAF so the browser paints the off-screen start state before we flip
    // to the resting state — otherwise the transition can be skipped.
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setEntered(true));
    });
    let previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function requestClose() {
    setLeaving(true);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setLeaving(true);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  let open = entered && !leaving;
  let { done, total } = doneCount(entry);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${entry.checklist.title}`}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Close editor"
        tabIndex={-1}
        onClick={requestClose}
        className={`absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={sheetRef}
        tabIndex={-1}
        onTransitionEnd={(event) => {
          if (leaving && event.target === event.currentTarget) onClose();
        }}
        className={`relative flex max-h-[85dvh] w-full max-w-2xl flex-col rounded-t-2xl border border-b-0 border-gold/25 bg-ink-800 shadow-[0_-12px_48px_rgba(0,0,0,0.55)] outline-none transition-transform duration-300 ease-out sm:rounded-2xl sm:border-b ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pt-3 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-cream/20" />
        </div>

        <header className="flex items-center gap-3 px-5 pb-3 pt-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
              Edit checklist
            </p>
            <h2 className="truncate text-lg font-medium">{entry.checklist.title}</h2>
          </div>
          <span className="ml-auto font-mono text-[11px] text-cream-muted">
            {done}/{total}
          </span>
          <button
            type="button"
            onClick={requestClose}
            className="shrink-0 rounded-full bg-gold px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright"
          >
            Done
          </button>
        </header>

        <div className="flex-1 overflow-y-auto border-t border-cream/10 px-4 py-3">
          {entry.items.length === 0 && (
            <p className="px-2 py-3 text-sm text-cream-muted">
              Nothing here yet — add the first item below.
            </p>
          )}
          <ul className="divide-y divide-cream/[0.06]">
            {entry.items.map((item) => (
              <EditorItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                onEditItem={controls.onEditItem}
                onRemoveItem={controls.onRemoveItem}
              />
            ))}
          </ul>
          {controls.onAddItem && <AddItemField entry={entry} onAddItem={controls.onAddItem} />}
        </div>
      </div>
    </div>,
    document.body,
  );
}
