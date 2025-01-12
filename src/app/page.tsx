"use client";
import TaglineCard from "@/components/cards/taglinecard";
import Chat from "@/components/chat";

export default function Home() {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden flex-col">
      <TaglineCard />
      <Chat />
    </div>
  );
}
