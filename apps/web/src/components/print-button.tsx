"use client";

import { Printer } from "lucide-react";

export function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`inline-flex items-center gap-2 rounded-full bg-flag px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#8E1B29] ${className}`}
    >
      <Printer className="h-3.5 w-3.5" aria-hidden="true" />
      Print
    </button>
  );
}
