"use client";

import { Printer } from "lucide-react";

export function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`inline-flex items-center gap-2 rounded-full border border-flag/60 bg-flag/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-flag transition-colors hover:bg-flag hover:text-white ${className}`}
    >
      <Printer className="h-3.5 w-3.5" />
      Print
    </button>
  );
}
