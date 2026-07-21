"use client";

/* Ask GOODTrip (#39/#40/#41): chat with the trip assistant; itinerary ops
   come back as confirmation cards and only write once confirmed. Applied
   cards can be undone; failed sends can be retried. */

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, RotateCcw, Sparkles, Undo2, X } from "lucide-react";
import type { ChatTurn, Profile, ProposedAction, UUID } from "@goodtrip/shared";
import { getSupabase } from "@/lib/supabase";
import {
  applyAction,
  describeAction,
  sendChat,
  summarizeDayRevision,
  undoChange,
  type AppliedChange,
} from "@/lib/ai";
import type { TripItinerary } from "@/lib/goodtrip";
import type { GroupedChecklists } from "@/lib/checklists";
import { localToday } from "@/lib/utils";
import { DayRevisionSummary } from "@/components/trip/day-revision-card";

type CardStatus = "pending" | "applying" | "applied" | "undoing" | "dismissed" | "failed";

type Card = {
  proposal: ProposedAction;
  status: CardStatus;
  error?: string;
  applied?: AppliedChange;
};

type PanelMessage = {
  role: "user" | "assistant";
  content: string;
  cards?: Card[];
  /** An assistant bubble that reports a failed turn, offering a Retry. */
  error?: boolean;
};

/* Suggestions adapt to the actual trip: point at the next day, surface unpacked
   items and unconfirmed plans, so the empty state feels like it already knows
   the trip rather than showing two canned prompts. */
function buildSuggestions(itinerary: TripItinerary, checklists: GroupedChecklists): string[] {
  let out: string[] = [];

  let today = localToday();
  let nextDay = itinerary.days.find(({ day }) => day.date >= today)?.day ?? itinerary.days[0]?.day;
  if (nextDay) out.push(`What’s the plan for Day ${nextDay.day_number}?`);

  let items = [...checklists.global];
  checklists.byDay.forEach((lists) => items.push(...lists));
  let openItems = items.reduce((n, entry) => n + entry.items.filter((i) => !i.done).length, 0);
  if (openItems > 0) out.push("What do we still need to pack?");

  let unconfirmed = itinerary.days.some(({ activities }) => activities.some((a) => !a.confirmed));
  if (unconfirmed) out.push("Which plans still need booking?");

  if (out.length < 3) out.push("Anything fun we haven’t planned yet?");
  return out.slice(0, 3);
}

export function AskPanel({
  tripId,
  profile,
  itinerary,
  checklists,
  onApplied,
}: {
  tripId: UUID;
  profile: Profile;
  itinerary: TripItinerary;
  checklists: GroupedChecklists;
  onApplied: () => Promise<void>;
}) {
  let [messages, setMessages] = useState<PanelMessage[]>([]);
  let [input, setInput] = useState("");
  let [busy, setBusy] = useState(false);
  let listRef = useRef<HTMLDivElement>(null);

  let suggestions = buildSuggestions(itinerary, checklists);

  /* Run one assistant turn over the given history (error bubbles excluded from
     what the model sees), appending its reply — or an error bubble to retry. */
  async function runTurn(history: PanelMessage[]) {
    setBusy(true);
    try {
      let turns: ChatTurn[] = history
        .filter((m) => !m.error)
        .map(({ role, content }) => ({ role, content }))
        .filter((turn) => turn.content.length > 0);

      let response = await sendChat(getSupabase(), tripId, turns);
      setMessages([
        ...history,
        {
          role: "assistant",
          content: response.reply,
          cards: response.actions.map((proposal) => ({
            proposal,
            status: "pending" as const,
          })),
        },
      ]);
    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      setMessages([
        ...history,
        { role: "assistant", content: `Something went wrong: ${message}`, error: true },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function send(text: string) {
    let question = text.trim();
    if (!question || busy) return;
    setInput("");
    let history = [...messages, { role: "user" as const, content: question }];
    setMessages(history);
    void runTurn(history);
  }

  /* Retry drops any error bubbles and re-runs from the last real turn — the
     failed question is still the trailing user message, so it re-sends as-is. */
  function retry() {
    if (busy) return;
    let history = messages.filter((m) => !m.error);
    setMessages(history);
    void runTurn(history);
  }

  useEffect(scrollToBottom, [messages, busy]);

  function scrollToBottom() {
    // Double rAF: give React a frame to commit the new message to the DOM
    // before measuring scrollHeight, so long replies aren't left clipped
    // at the bottom of the scroll container.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });
    });
  }

  function setCard(messageIndex: number, cardId: string, patch: Partial<Card>) {
    setMessages((prev) =>
      prev.map((message, i) =>
        i === messageIndex && message.cards
          ? {
              ...message,
              cards: message.cards.map((card) =>
                card.proposal.id === cardId ? { ...card, ...patch } : card,
              ),
            }
          : message,
      ),
    );
  }

  async function confirm(messageIndex: number, card: Card) {
    setCard(messageIndex, card.proposal.id, { status: "applying" });
    try {
      let applied = await applyAction(
        getSupabase(),
        tripId,
        profile,
        card.proposal.action,
        itinerary,
        checklists,
      );
      setCard(messageIndex, card.proposal.id, { status: "applied", applied, error: undefined });
      await onApplied();
    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      setCard(messageIndex, card.proposal.id, { status: "failed", error: message });
    }
  }

  async function undo(messageIndex: number, card: Card) {
    if (!card.applied) return;
    setCard(messageIndex, card.proposal.id, { status: "undoing" });
    try {
      await undoChange(getSupabase(), tripId, profile, card.applied);
      // Back to pending: the change is reversed and can be confirmed again.
      setCard(messageIndex, card.proposal.id, { status: "pending", applied: undefined });
      await onApplied();
    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      setCard(messageIndex, card.proposal.id, { status: "failed", error: message });
    }
  }

  return (
    <div className="mt-8 flex flex-col">
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-busy={busy}
        className="max-h-[55dvh] space-y-4 overflow-y-auto pb-2"
      >
        {messages.length === 0 && (
          <div className="rounded-xl border border-cream/10 bg-ink-800/40 px-5 py-6 text-center">
            <Sparkles className="mx-auto h-5 w-5 text-gold" aria-hidden />
            <p className="mt-3 text-sm text-cream-muted">
              Ask about the plan — or ask for a change and confirm it before it lands on the
              itinerary.
            </p>
          </div>
        )}

        {messages.map((message, messageIndex) => (
          <div key={messageIndex}>
            <div
              className={
                message.role === "user"
                  ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-gold/15 px-4 py-2.5 text-sm"
                  : message.error
                    ? "w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-flag/40 bg-flag/[0.08] px-4 py-2.5 text-sm"
                    : "w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-cream/10 bg-ink-800/60 px-4 py-2.5 text-sm"
              }
            >
              {message.content || "…"}
            </div>

            {message.error && (
              <button
                type="button"
                onClick={retry}
                disabled={busy}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-cream-muted transition-colors hover:border-gold/50 hover:text-cream disabled:opacity-40"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Retry
              </button>
            )}

            {message.cards?.map((card) => (
              <div
                key={card.proposal.id}
                className="mt-2 w-fit max-w-[85%] rounded-xl border border-gold/30 bg-gold/[0.06] px-4 py-3"
              >
                {card.proposal.action.type === "revise_day" ? (
                  <DayRevisionSummary
                    view={summarizeDayRevision(card.proposal.action, itinerary)}
                  />
                ) : (
                  <>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
                      Proposed change
                    </p>
                    <p className="mt-1.5 text-sm">
                      {describeAction(card.proposal.action, itinerary, checklists)}
                    </p>
                  </>
                )}
                <div className="mt-2.5 flex items-center gap-3">
                  {card.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => confirm(messageIndex, card)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden /> Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCard(messageIndex, card.proposal.id, {
                            status: "dismissed",
                          })
                        }
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-cream-muted transition-colors hover:text-cream"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden /> Dismiss
                      </button>
                    </>
                  )}
                  {card.status === "applying" && (
                    <span className="font-mono text-[11px] uppercase tracking-wide text-cream-muted">
                      Applying…
                    </span>
                  )}
                  {card.status === "applied" && (
                    <>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-gold">
                        <Check className="h-3.5 w-3.5" aria-hidden /> Applied
                      </span>
                      <button
                        type="button"
                        onClick={() => undo(messageIndex, card)}
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-cream-muted transition-colors hover:text-cream"
                      >
                        <Undo2 className="h-3.5 w-3.5" aria-hidden /> Undo
                      </button>
                    </>
                  )}
                  {card.status === "undoing" && (
                    <span className="font-mono text-[11px] uppercase tracking-wide text-cream-muted">
                      Undoing…
                    </span>
                  )}
                  {card.status === "dismissed" && (
                    <span className="font-mono text-[11px] uppercase tracking-wide text-cream-muted">
                      Dismissed
                    </span>
                  )}
                  {card.status === "failed" && (
                    <span className="font-mono text-[11px] uppercase tracking-wide text-flag">
                      Failed: {card.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {busy && (
          <div
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted"
            aria-label="GOODTrip is thinking"
          >
            <span className="flex gap-1" aria-hidden>
              <Dot delay="0ms" />
              <Dot delay="150ms" />
              <Dot delay="300ms" />
            </span>
            GOODTrip is thinking
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              disabled={busy}
              className="rounded-full border border-cream/15 px-3.5 py-1.5 text-xs text-cream-muted transition-colors hover:border-gold/50 hover:text-cream disabled:opacity-40"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-3 flex items-center gap-2 rounded-full border border-cream/15 bg-ink-800/60 py-1.5 pl-5 pr-1.5 focus-within:border-gold/50"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask GOODTrip…"
          disabled={busy}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-cream-muted/60 sm:text-sm"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-ink transition-colors hover:bg-gold-bright disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}

/** One bouncing dot in the thinking indicator, staggered by `delay`. */
function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold/70"
      style={{ animationDelay: delay }}
    />
  );
}
