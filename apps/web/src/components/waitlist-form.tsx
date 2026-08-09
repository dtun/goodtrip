"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { isValidEmail } from "@/lib/waitlist";

type Status = "idle" | "submitting" | "done" | "error";

/* What we tell someone before they hand over an address, kept to what this
 * repo can actually do.
 *
 * Nothing here sends mail. The waitlist is a plain Supabase table — no email
 * provider, no confirmation, no list to unsubscribe from — so the old line's
 * "Unsubscribe anytime" offered a mechanism that does not exist. One
 * announcement at launch is the entire plan, so that is what the promise says;
 * "the only one we'll send" is also why an unsubscribe link is moot rather than
 * missing.
 *
 * The privacy line names the two columns the API route writes (`email` and
 * `source`, see app/api/waitlist/route.ts) so nobody has to guess what joining
 * costs them. It is one sentence rather than a paragraph precisely so it can
 * ride along with every copy of the form — the landing page renders two, and a
 * visitor can sign up from either without passing the other.
 */
const PROMISE = "One email when GOODTrip opens — that's the only one we'll send.";
const PRIVACY = "We keep just your address and which form it came from — never sold, never shared.";

/**
 * Email capture for the pre-launch waitlist. Posts to /api/waitlist and swaps
 * to a confirmation state in place. `source` tags where the sign-up came from
 * (e.g. "landing-hero") so we can tell the hero from the closing CTA later.
 */
export function WaitlistForm({
  source = "landing",
  className = "",
}: {
  source?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    if (!isValidEmail(email)) {
      setStatus("error");
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div
        className={`mx-auto flex max-w-md items-center justify-center gap-2.5 rounded-full border border-teal/30 bg-teal-soft px-6 py-3.5 text-center ${className}`}
        role="status"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-espresso">
          You&apos;re on the list — we&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={`mx-auto max-w-md ${className}`}>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor={`waitlist-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`waitlist-${source}`}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          aria-invalid={status === "error"}
          disabled={status === "submitting"}
          className="min-w-0 flex-1 rounded-full border border-sand-300 bg-white px-5 py-3 text-sm text-espresso shadow-sm placeholder:text-espresso-muted transition-colors focus:border-coral focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-coral-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-coral-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Joining
            </>
          ) : (
            <>
              Join the waitlist
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </div>
      <p
        className={`mt-3 text-center text-sm ${
          status === "error" ? "font-medium text-coral-700" : "text-espresso-muted"
        }`}
        role={status === "error" ? "alert" : undefined}
      >
        {status === "error" ? error : PROMISE}
      </p>
      {/* Stays put while the line above swaps to a validation error — the data
          promise is not conditional on the form being happy. */}
      <p className="mt-1.5 text-center text-xs text-espresso-muted/80">{PRIVACY}</p>
    </form>
  );
}
