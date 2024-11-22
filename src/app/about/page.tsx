// import Chat from "@/components/chat";
"use client";

import GenUICard from "@/components/cards/genuicard";
export const maxDuration = 30;

export default function GenUI() {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden pb-10 flex-col p-2">
      <div className="group w-full overflow-auto">
        <div className="max-w-xl mx-auto mt-10 mb-24">
          <GenUICard />
        </div>
      </div>
    </div>
  );
}
