"use client";

import { Printer } from "lucide-react";

export function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`inline-flex items-center gap-2 rounded-full border border-sand-300 bg-sand-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-espresso transition-colors hover:border-coral/40 hover:text-coral-700 ${className}`}
    >
      <Printer className="h-3.5 w-3.5" aria-hidden="true" />
      Print
    </button>
  );
}
