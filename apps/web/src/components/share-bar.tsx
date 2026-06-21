"use client";

import { useState } from "react";
import { Share2, Link2, Mail, Check } from "lucide-react";

const SHARE_TEXT = "GOODTrip — our DC trip itinerary. Have a GOOD trip.";

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function btn() {
  return "flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-ink-800/50 text-cream-muted transition-colors hover:border-gold/50 hover:text-gold";
}

export function ShareBar() {
  const [copied, setCopied] = useState(false);

  const url = () =>
    typeof window !== "undefined" ? window.location.href : "https://goodtrip";

  async function nativeShare() {
    const link = url();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "GOODTrip", text: SHARE_TEXT, url: link });
      } catch {
        /* user dismissed — no-op */
      }
    } else {
      copyLink();
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted">
        Share
      </span>

      <button type="button" onClick={nativeShare} className={btn()} aria-label="Share this page">
        <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={copyLink}
        className={btn()}
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        {copied ? (
          <Check className="h-[18px] w-[18px] text-gold" aria-hidden="true" />
        ) : (
          <Link2 className="h-[18px] w-[18px]" aria-hidden="true" />
        )}
      </button>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          SHARE_TEXT
        )}`}
        target="_blank"
        rel="noreferrer noopener"
        className={btn()}
        aria-label="Share on X"
      >
        <XIcon className="h-4 w-4" />
      </a>

      <a
        href={`mailto:?subject=${encodeURIComponent(
          "GOODTrip — our DC trip"
        )}&body=${encodeURIComponent(SHARE_TEXT + "\n\n")}`}
        className={btn()}
        aria-label="Share by email"
      >
        <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
      </a>
    </div>
  );
}
