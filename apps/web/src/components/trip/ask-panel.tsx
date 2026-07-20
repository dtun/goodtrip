"use client";

/* Ask GOODTrip (#39/#40/#41): chat with the trip assistant; itinerary ops
   come back as confirmation cards and only write once confirmed. */

import { useRef, useState } from "react";
import { ArrowUp, Check, Sparkles, X } from "lucide-react";
import type { ChatTurn, Profile, ProposedAction, UUID } from "@goodtrip/shared";
import { getSupabase } from "@/lib/supabase";
import { applyAction, describeAction, sendChat } from "@/lib/ai";
import type { TripItinerary } from "@/lib/goodtrip";
import type { GroupedChecklists } from "@/lib/checklists";

type CardStatus = "pending" | "applying" | "applied" | "dismissed" | "failed";

type Card = { proposal: ProposedAction; status: CardStatus; error?: string };

type PanelMessage = {
  role: "user" | "assistant";
  content: string;
  cards?: Card[];
};

let SUGGESTIONS = ["What’s on the agenda tomorrow?", "What do we still need to pack?"];

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

  async function send(text: string) {
    let question = text.trim();
    if (!question || busy) return;
    setBusy(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);

    try {
      let turns: ChatTurn[] = [
        ...messages.map(({ role, content }) => ({ role, content })),
        { role: "user" as const, content: question },
      ].filter((turn) => turn.content.length > 0);

      let response = await sendChat(getSupabase(), tripId, turns);
      setMessages((prev) => [
        ...prev,
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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Something went wrong: ${message}` },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }));
    }
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
      await applyAction(getSupabase(), tripId, profile, card.proposal.action, itinerary);
      setCard(messageIndex, card.proposal.id, { status: "applied" });
      await onApplied();
    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      setCard(messageIndex, card.proposal.id, { status: "failed", error: message });
    }
  }

  return (
    <div className="mt-8 flex flex-col">
      <div ref={listRef} className="max-h-[55vh] space-y-4 overflow-y-auto pb-2">
        {messages.length === 0 && (
          <div className="rounded-xl border border-cream/10 bg-ink-800/40 px-5 py-6 text-center">
            <Sparkles className="mx-auto h-5 w-5 text-gold" aria-hidden />
            <p className="mt-3 text-sm text-cream-muted">
              Ask about the plan — or ask for a change and confirm it before it lands on the
              itinerary.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-cream/15 px-3.5 py-1.5 text-xs text-cream-muted transition-colors hover:border-gold/50 hover:text-cream"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, messageIndex) => (
          <div key={messageIndex}>
            <div
              className={
                message.role === "user"
                  ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-gold/15 px-4 py-2.5 text-sm"
                  : "w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-cream/10 bg-ink-800/60 px-4 py-2.5 text-sm"
              }
            >
              {message.content || "…"}
            </div>

            {message.cards?.map((card) => (
              <div
                key={card.proposal.id}
                className="mt-2 w-fit max-w-[85%] rounded-xl border border-gold/30 bg-gold/[0.06] px-4 py-3"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
                  Proposed change
                </p>
                <p className="mt-1.5 text-sm">
                  {describeAction(card.proposal.action, itinerary, checklists)}
                </p>
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
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-gold">
                      <Check className="h-3.5 w-3.5" aria-hidden /> Applied
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
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted">
            GOODTrip is thinking…
          </p>
        )}
      </div>

      <form
        className="mt-4 flex items-center gap-2 rounded-full border border-cream/15 bg-ink-800/60 py-1.5 pl-5 pr-1.5 focus-within:border-gold/50"
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
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-cream-muted/60"
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
