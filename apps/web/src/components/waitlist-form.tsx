"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { isValidEmail } from "@/lib/waitlist";

type Status = "idle" | "submitting" | "done" | "error";

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
        className={`mx-auto flex max-w-md items-center justify-center gap-2.5 rounded-full border border-gold/40 bg-gold/10 px-6 py-3.5 text-center ${className}`}
        role="status"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-cream">
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
          className="min-w-0 flex-1 rounded-full border border-cream/20 bg-ink/60 px-5 py-3 text-sm text-cream placeholder:text-cream-muted/70 transition-colors focus:border-gold focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-70"
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
        className={`mt-2.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] ${
          status === "error" ? "text-flag" : "text-cream-muted"
        }`}
        role={status === "error" ? "alert" : undefined}
      >
        {status === "error" ? error : "No spam · One email when it's ready · Unsubscribe anytime"}
      </p>
    </form>
  );
}
