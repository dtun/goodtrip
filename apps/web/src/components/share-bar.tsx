"use client";

import { useEffect, useState } from "react";
import { Share2, MessageSquare, Mail, Link2, Check } from "lucide-react";

const SITE = "https://goodtrip.info";
const MESSAGE = "GOODTrip — the group trip planner that plans with you. Have a GOOD trip:";
const EMAIL_SUBJECT = "GOODTrip — have a GOOD trip";

const tile =
  "flex h-11 w-11 items-center justify-center rounded-full border border-sand-300 bg-sand-100 text-espresso-muted transition-colors hover:border-coral/50 hover:text-coral-700 focus-visible:text-coral-700";

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
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-espresso-muted">
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
          <Check className="h-[18px] w-[18px] text-teal-700" aria-hidden="true" />
        ) : (
          <Link2 className="h-[18px] w-[18px]" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
