import Link from "next/link";
import { Compass } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b border-[#E0E0E0] bg-white/80 px-6 backdrop-blur">
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-[#3C3B6E]"
      >
        <Compass className="h-5 w-5" />
        GOODTrip
      </Link>
      <a
        href="https://github.com/dtun/goodtrip"
        target="_blank"
        rel="noreferrer noopener"
        className="text-sm font-medium text-[#666666] transition-colors hover:text-[#3C3B6E]"
      >
        GitHub
      </a>
    </header>
  );
}
