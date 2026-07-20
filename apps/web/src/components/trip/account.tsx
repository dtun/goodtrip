"use client";

/* Email identity (spec section 4, adapted for web): WelcomeScreen lets a
   fresh browser request a sign-in link before we mint a throwaway anonymous
   profile; SaveSpotBanner lets a live session attach an email so the
   identity survives cleared storage and other devices. */

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { isEmailTakenError, isUnknownEmailError, type LinkedEmail } from "@/lib/identity";
import { errorMessage } from "@/lib/utils";

let inputClass =
  "w-full min-w-0 rounded-xl border border-cream/15 bg-ink-800/60 px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-cream-muted/60 focus:border-gold/50";

let goldButtonClass =
  "shrink-0 rounded-xl bg-gold px-4 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-ink transition-opacity disabled:opacity-50";

export function WelcomeScreen({
  onSendLink,
  onContinueAsNew,
}: {
  onSendLink: (email: string) => Promise<void>;
  onContinueAsNew: () => void;
}) {
  let [email, setEmail] = useState("");
  let [sending, setSending] = useState(false);
  let [sentTo, setSentTo] = useState<string | null>(null);
  let [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      await onSendLink(email);
      setSentTo(email);
    } catch (err) {
      setError(
        isUnknownEmailError(err)
          ? "No traveler has that email yet — come on in as new below."
          : errorMessage(err),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md pt-6 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-gold/70">GOODTrip</p>
      <h1 className="mt-3 font-display text-4xl leading-tight">Welcome, traveler</h1>

      {sentTo ? (
        <p className="mt-6 rounded-xl border border-gold/25 bg-gold/10 px-4 py-4 text-sm text-cream-muted">
          Sign-in link sent to <span className="text-cream">{sentTo}</span>. Open it on this
          device and you&rsquo;ll land back here as yourself.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-cream-muted">
            Been here before? We&rsquo;ll email you a link back to your name and your checkmarks.
          </p>

          <form onSubmit={submit} className="mt-6 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-label="Email"
              className={inputClass}
            />
            <button type="submit" disabled={sending} className={goldButtonClass}>
              {sending ? "Sending…" : "Send link"}
            </button>
          </form>
          {error && (
            <p role="alert" className="mt-3 text-xs text-flag">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-cream/10" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/30">
              or
            </span>
            <span className="h-px flex-1 bg-cream/10" />
          </div>

          <button
            type="button"
            onClick={onContinueAsNew}
            className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted underline decoration-cream/30 underline-offset-4 transition-colors hover:text-cream"
          >
            First time here? Come on in
          </button>
        </>
      )}
    </div>
  );
}

export function SaveSpotBanner({
  linked,
  onLink,
  onSendSignInLink,
}: {
  linked: LinkedEmail;
  onLink: (email: string) => Promise<void>;
  onSendSignInLink: (email: string) => Promise<void>;
}) {
  let [open, setOpen] = useState(false);
  let [email, setEmail] = useState("");
  let [sending, setSending] = useState(false);
  let [error, setError] = useState<string | null>(null);
  let [taken, setTaken] = useState(false);
  let [signInSentTo, setSignInSentTo] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    setTaken(false);
    try {
      await onLink(email); // parent flips linked to pending, which replaces this form
    } catch (err) {
      if (isEmailTakenError(err)) {
        setTaken(true);
        setError("That email already belongs to a traveler on this trip.");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setSending(false);
    }
  }

  async function sendSignInInstead() {
    setSending(true);
    setError(null);
    try {
      await onSendSignInLink(email);
      setSignInSentTo(email);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (linked.status === "confirmed") return null;

  if (linked.status === "pending") {
    return (
      <p className="mt-4 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3 text-xs text-cream-muted">
        Confirmation sent to <span className="text-cream">{linked.email}</span> — tap the link in
        your inbox to finish saving your spot.
      </p>
    );
  }

  if (signInSentTo) {
    return (
      <p className="mt-4 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3 text-xs text-cream-muted">
        Sign-in link sent to <span className="text-cream">{signInSentTo}</span> — opening it
        switches this browser to that traveler.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center gap-2.5 rounded-xl border border-dashed border-gold/30 bg-gold/5 px-4 py-3 text-left transition-colors hover:border-gold/50"
      >
        <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden />
        <span className="shrink-0 text-sm font-medium">Save your spot</span>
        <span className="min-w-0 truncate text-xs text-cream-muted">
          add your email to sign in from any device
        </span>
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3">
      <label htmlFor="save-spot-email" className="flex items-center gap-2 text-sm font-medium">
        <Mail className="h-4 w-4 text-gold" aria-hidden />
        Save your spot
      </label>
      <p className="mt-1 text-xs text-cream-muted">
        We&rsquo;ll email a confirmation link; once tapped, your name and checkmarks follow you to
        any device.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          id="save-spot-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
        <button type="submit" disabled={sending} className={goldButtonClass}>
          {sending ? "Linking…" : "Link email"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-flag">
          {error}
        </p>
      )}
      {taken && (
        <button
          type="button"
          onClick={sendSignInInstead}
          disabled={sending}
          className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted underline decoration-cream/30 underline-offset-4 transition-colors hover:text-cream disabled:opacity-50"
        >
          Email me a sign-in link instead
        </button>
      )}
    </form>
  );
}
