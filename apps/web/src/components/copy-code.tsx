"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `Copied code ${code}` : `Copy code ${code}`}
      className="group inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cream-muted transition-colors hover:border-gold/60 hover:text-cream focus-visible:text-cream"
    >
      Code <span className="font-semibold text-gold">{code}</span>
      {copied ? (
        <Check className="h-3 w-3 text-gold" aria-hidden="true" />
      ) : (
        <Copy className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      )}
    </button>
  );
}
