"use client";

import { useEffect, useState } from "react";
import { Share2, Link2, Check } from "lucide-react";

const SITE = "https://goodtrip.info";
const MESSAGE = "GOODTrip — the group trip planner that plans with you:";

const tile =
  "flex h-11 w-11 items-center justify-center rounded-full border border-sand-300 bg-sand-100 text-espresso-muted transition-colors hover:border-coral/50 hover:text-coral-700 focus-visible:text-coral-700";

/**
 * Two ways to pass the page on: the OS share sheet, and a copied link.
 *
 * There are no per-network tiles because the share sheet already lists every
 * app the visitor has installed — X, Bluesky, Threads and the rest — so one
 * button covers all of them on the devices where resharing actually happens.
 */
export function ShareBar() {
  const [url, setUrl] = useState(SITE);
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  /* Both of these read the browser, which the server render doesn't have, so
     they're resolved after mount rather than inline. Desktop browsers have no
     navigator.share at all: checking during render would either mismatch
     hydration or — worse — leave desktop with a "Share…" button that silently
     did the same thing as the copy button next to it. Starting false means the
     server and the first client render agree, and the tile appears only on the
     browsers that can honour it. */
  useEffect(() => {
    setUrl(window.location.href);
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function nativeShare() {
    try {
      await navigator.share({ title: "GOODTrip", text: MESSAGE, url });
    } catch {
      /* user dismissed — no-op */
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

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-espresso-muted">
        Share
      </span>

      {canShare && (
        <button type="button" onClick={nativeShare} className={tile} aria-label="Share…">
          <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      )}

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
