"use client";

import { useEffect, useState } from "react";
import { Share2, MessageSquare, Mail, Link2, Check } from "lucide-react";

const SITE = "https://goodtrip.info";
const MESSAGE = "Our DC trip itinerary on GOODTrip — have a GOOD trip:";
const EMAIL_SUBJECT = "GOODTrip — our DC trip itinerary";

const tile =
  "flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-ink-800/50 text-cream-muted transition-colors hover:border-gold/50 hover:text-gold focus-visible:text-gold";

export function ShareBar() {
  const [url, setUrl] = useState(SITE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setUrl(window.location.href);
  }, []);

  async function nativeShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "GOODTrip", text: MESSAGE, url });
      } catch {
        /* user dismissed — no-op */
      }
    } else {
      copyLink();
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  const body = `${MESSAGE}\n\n${url}`;

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted">
        Share
      </span>

      <button type="button" onClick={nativeShare} className={tile} aria-label="Share…">
        <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      <a
        href={`sms:?&body=${encodeURIComponent(body)}`}
        className={tile}
        aria-label="Share via Messages"
      >
        <MessageSquare className="h-[18px] w-[18px]" aria-hidden="true" />
      </a>

      <a
        href={`mailto:?subject=${encodeURIComponent(
          EMAIL_SUBJECT,
        )}&body=${encodeURIComponent(body)}`}
        className={tile}
        aria-label="Share by email"
      >
        <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
      </a>

      <button
        type="button"
        onClick={copyLink}
        className={tile}
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        {copied ? (
          <Check className="h-[18px] w-[18px] text-gold" aria-hidden="true" />
        ) : (
          <Link2 className="h-[18px] w-[18px]" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
