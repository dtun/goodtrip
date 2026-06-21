"use client";

import { useState } from "react";
import {
  CalendarDays,
  SquareCheckBig,
  Sparkles,
  Plane,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Check,
  Clock,
  Send,
  Mic,
  Plus,
  Wifi,
  BatteryFull,
  SignalHigh,
} from "lucide-react";
import { CompassRose } from "@/components/compass-rose";
import {
  TRIP,
  DAYS,
  MEMBERS,
  DAY_CHECKLIST,
  GLOBAL_CHECKLIST,
  AI_CONVO,
  AI_ACTION,
  AI_SUGGESTIONS,
  FEED,
  type Activity,
  type DayPlan,
} from "@/lib/trip";

type Tab = "itinerary" | "checklists" | "ask" | "trip";

const PRIMARY = "#3C3B6E";
const onlineMembers = MEMBERS.filter((m) => m.online);

/* ── small parts ──────────────────────────────────────────────── */

function Avatar({
  initials,
  color,
  online,
  size = 28,
}: {
  initials: string;
  color: string;
  online?: boolean;
  size?: number;
}) {
  return (
    <span className="relative inline-flex">
      <span
        className="inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-white"
        style={{
          backgroundColor: color,
          width: size,
          height: size,
          fontSize: size * 0.4,
        }}
      >
        {initials}
      </span>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#2D6A4F] ring-2 ring-white" />
      )}
    </span>
  );
}

function ProgressRing({ pct, size = 34 }: { pct: number; size?: number }) {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E0E0E0" strokeWidth="3" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={PRIMARY}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
      />
    </svg>
  );
}

function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "green" | "blue" | "gold";
}) {
  const tones: Record<string, string> = {
    muted: "bg-[#F0F0F0] text-[#666]",
    green: "bg-[#2D6A4F]/12 text-[#2D6A4F]",
    blue: "bg-[#3C3B6E]/10 text-[#3C3B6E]",
    gold: "bg-[#C9A84C]/15 text-[#9A7B1F]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function ActivityCard({ a }: { a: Activity }) {
  return (
    <div className="rounded-2xl border border-[#E0E0E0] bg-white p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {a.time && (
            <p className="flex items-center gap-1 font-mono text-[11px] font-medium text-[#3C3B6E]">
              <Clock className="h-3 w-3" />
              {a.time}
            </p>
          )}
          <p className="mt-1 text-[15px] font-semibold leading-tight text-[#111]">
            {a.title}
          </p>
          {a.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[#666]">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{a.location}</span>
            </p>
          )}
        </div>
        {a.cost && (
          <span className="shrink-0 rounded-full border border-[#E0E0E0] bg-[#F8F8F8] px-2 py-0.5 text-[11px] font-medium text-[#666]">
            {a.cost}
          </span>
        )}
      </div>
      {(a.confirmed || a.booking || a.tags) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {a.confirmed && (
            <Badge tone="green">
              <Check className="h-3 w-3" />
              {a.confirmedNote ?? "Confirmed"}
            </Badge>
          )}
          {a.booking && <Badge tone="blue">Booking</Badge>}
          {a.tags?.map((t) => (
            <Badge key={t} tone="muted">
              {t}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── screens ──────────────────────────────────────────────────── */

function DayList({ onOpen }: { onOpen: (n: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-[#3C3B6E] p-4 text-white">
        <p className="text-[11px] uppercase tracking-wide text-white/60">
          {TRIP.name}
        </p>
        <p className="mt-0.5 font-display text-2xl leading-tight">
          {TRIP.destination}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-white/80">{TRIP.dates}</span>
          <span className="rounded-full bg-[#C9A84C] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#3C3B6E]">
            {TRIP.countdown}
          </span>
        </div>
      </div>

      {DAYS.map((d) => {
        const confirmed = d.activities.filter((a) => a.confirmed).length;
        return (
          <button
            key={d.n}
            onClick={() => onOpen(d.n)}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#E0E0E0] bg-white p-3 text-left transition-transform active:scale-[0.99]"
          >
            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F8F8F8] leading-none">
              <span className="font-mono text-[9px] text-[#666]">DAY</span>
              <span className="font-display text-lg text-[#3C3B6E]">{d.n}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-[#111]">
                {d.title}
              </p>
              <p className="mt-0.5 text-xs text-[#666]">
                {d.dow} {d.date} · {d.activities.length} activities
                {confirmed > 0 ? ` · ${confirmed} confirmed` : ""}
              </p>
            </div>
            <div className="relative shrink-0">
              <ProgressRing pct={d.progress} />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-semibold text-[#3C3B6E]">
                {d.progress}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#9AA0AA]" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function DayDetail({ day }: { day: DayPlan }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-[#666]">
          Day {day.n} · {day.dow} {day.date}
        </p>
        <h3 className="mt-0.5 font-display text-2xl text-[#111]">{day.title}</h3>
      </div>

      <div className="space-y-2.5">
        {day.activities.map((a, i) => (
          <ActivityCard key={i} a={a} />
        ))}
      </div>

      <button className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#C9A84C] bg-[#C9A84C]/5 py-3 text-sm font-semibold text-[#9A7B1F]">
        <Plus className="h-4 w-4" />
        Add activity
      </button>

      <div className="rounded-2xl border border-[#E0E0E0] bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#666]">
          Day checklist
        </p>
        <div className="mt-3 space-y-2.5">
          {DAY_CHECKLIST.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  item.done
                    ? "border-[#2D6A4F] bg-[#2D6A4F]"
                    : "border-[#C8C8C8] bg-white"
                }`}
              >
                {item.done && <Check className="h-3.5 w-3.5 text-white" />}
              </span>
              <span
                className={`flex-1 text-sm ${
                  item.done ? "text-[#6E6E6E] line-through" : "text-[#111]"
                }`}
              >
                {item.text}
              </span>
              {item.by && (
                <span className="text-[10px] text-[#6E6E6E]">{item.by}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Checklists() {
  const all = GLOBAL_CHECKLIST.flatMap((g) => g.items);
  const done = all.filter((i) => i.done).length;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E0E0E0] bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#111]">Packing & Prep</span>
          <span className="font-mono text-xs text-[#666]">
            {done} of {all.length}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEE]">
          <div
            className="h-full rounded-full bg-[#2D6A4F]"
            style={{ width: `${(done / all.length) * 100}%` }}
          />
        </div>
      </div>

      {GLOBAL_CHECKLIST.map((g) => (
        <div key={g.category}>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[#666]">
            {g.category}
          </p>
          <div className="overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white">
            {g.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 border-b border-[#F0F0F0] px-3.5 py-3 last:border-0"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    item.done
                      ? "border-[#2D6A4F] bg-[#2D6A4F]"
                      : "border-[#C8C8C8] bg-white"
                  }`}
                >
                  {item.done && <Check className="h-3.5 w-3.5 text-white" />}
                </span>
                <span
                  className={`flex-1 text-sm ${
                    item.done ? "text-[#6E6E6E] line-through" : "text-[#111]"
                  }`}
                >
                  {item.text}
                </span>
                {item.by && (
                  <span className="text-[10px] text-[#6E6E6E]">{item.by}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Ask() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3">
        {AI_CONVO.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] rounded-2xl rounded-br-md bg-[#3C3B6E] px-3.5 py-2.5 text-sm text-white">
                {m.content}
              </p>
            </div>
          ) : (
            <div key={i} className="flex gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3C3B6E] text-[#C9A84C]">
                <CompassRose className="h-5 w-5" />
              </span>
              <p className="max-w-[82%] rounded-2xl rounded-tl-md border border-[#E0E0E0] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#222]">
                {m.content}
              </p>
            </div>
          )
        )}

        {/* AI action card */}
        <div className="ml-9 max-w-[82%] overflow-hidden rounded-2xl border border-[#C9A84C]/50 bg-[#C9A84C]/[0.07]">
          <div className="px-3.5 pt-3">
            <p className="text-xs font-semibold text-[#9A7B1F]">{AI_ACTION.prompt}</p>
            <p className="mt-1.5 text-sm font-semibold text-[#111]">
              {AI_ACTION.title}
            </p>
            <p className="text-xs text-[#666]">{AI_ACTION.detail}</p>
          </div>
          <div className="mt-3 flex border-t border-[#C9A84C]/30">
            <button className="flex-1 border-r border-[#C9A84C]/30 py-2.5 text-sm font-semibold text-[#2D6A4F]">
              Accept
            </button>
            <button className="flex-1 py-2.5 text-sm font-medium text-[#666]">
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {AI_SUGGESTIONS.map((s) => (
            <span
              key={s}
              className="rounded-full border border-[#E0E0E0] bg-white px-2.5 py-1 text-[11px] text-[#3C3B6E]"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#E0E0E0] bg-white py-1.5 pl-4 pr-1.5">
          <span className="flex-1 text-sm text-[#6E6E6E]">Ask GOODTrip…</span>
          <Mic className="h-4 w-4 text-[#6E6E6E]" />
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3C3B6E] text-white">
            <Send className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

function TripOverview() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white">
        <div className="relative h-24 bg-gradient-to-br from-[#3C3B6E] to-[#161A3C]">
          <CompassRose className="absolute -right-4 -top-3 h-24 w-24 text-[#C9A84C] opacity-30" />
          <div className="absolute bottom-3 left-4 text-white">
            <p className="font-display text-lg leading-tight">{TRIP.name}</p>
            <p className="text-xs text-white/70">
              {TRIP.destination} · {TRIP.dates}
            </p>
          </div>
        </div>
        <p className="px-4 py-3 text-xs text-[#666]">{TRIP.hotel}</p>
      </div>

      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[#666]">
          Travelers · {MEMBERS.length}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {MEMBERS.map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-2.5 rounded-xl border border-[#E0E0E0] bg-white px-3 py-2.5"
            >
              <Avatar initials={m.initials} color={m.color} online={m.online} size={30} />
              <span className="text-sm font-medium text-[#111]">{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[#666]">
          Recent activity
        </p>
        <div className="overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white">
          {FEED.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 border-b border-[#F0F0F0] px-3.5 py-2.5 text-sm last:border-0"
            >
              <span className="font-semibold text-[#3C3B6E]">{f.who}</span>
              <span className="text-[#666]">{f.action}</span>
              <span className="min-w-0 flex-1 truncate text-[#111]">{f.target}</span>
              <span className="shrink-0 text-[11px] text-[#6E6E6E]">{f.when}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── shell ────────────────────────────────────────────────────── */

const TABS: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
  { id: "itinerary", label: "Itinerary", icon: CalendarDays },
  { id: "checklists", label: "Checklists", icon: SquareCheckBig },
  { id: "ask", label: "Ask", icon: Sparkles },
  { id: "trip", label: "Trip", icon: Plane },
];

export function AppMockup() {
  const [tab, setTab] = useState<Tab>("itinerary");
  const [openDay, setOpenDay] = useState<number | null>(null);

  const day = DAYS.find((d) => d.n === openDay) ?? null;
  const inDetail = tab === "itinerary" && day;

  const title = inDetail
    ? `Day ${day.n}`
    : tab === "itinerary"
      ? "Itinerary"
      : tab === "checklists"
        ? "Checklists"
        : tab === "ask"
          ? "Ask GOODTrip"
          : "Trip";

  const screenKey = `${tab}-${openDay ?? "list"}`;

  return (
    <div className="mx-auto w-[330px] max-w-full">
      <div className="rounded-[3rem] border border-white/10 bg-black p-2.5 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.85)]">
        <div className="relative flex h-[660px] flex-col overflow-hidden rounded-[2.4rem] bg-[#F4F4F6]">
          {/* dynamic island */}
          <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

          {/* status bar */}
          <div className="flex items-center justify-between px-7 pb-1 pt-3 text-[#111]">
            <span className="font-mono text-xs font-semibold">9:41</span>
            <span className="flex items-center gap-1" aria-hidden="true">
              <SignalHigh className="h-3.5 w-3.5" />
              <Wifi className="h-3.5 w-3.5" />
              <BatteryFull className="h-4 w-4" />
            </span>
          </div>

          {/* app header */}
          <div className="flex items-center justify-between border-b border-[#E6E6E8] bg-white/70 px-4 py-2.5 backdrop-blur">
            <div className="flex items-center gap-2">
              {inDetail && (
                <button
                  onClick={() => setOpenDay(null)}
                  className="-ml-1 flex h-7 w-7 items-center justify-center rounded-full text-[#3C3B6E] active:bg-[#3C3B6E]/10"
                  aria-label="Back to itinerary"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
              <span className="font-display text-lg text-[#111]">{title}</span>
            </div>
            <div className="flex -space-x-2">
              {onlineMembers.slice(0, 3).map((m) => (
                <Avatar key={m.name} initials={m.initials} color={m.color} online size={24} />
              ))}
            </div>
          </div>

          {/* screen body */}
          <div
            key={screenKey}
            className="screen-in flex-1 overflow-y-auto px-4 py-4"
          >
            {tab === "itinerary" &&
              (day ? (
                <DayDetail day={day} />
              ) : (
                <DayList onOpen={setOpenDay} />
              ))}
            {tab === "checklists" && <Checklists />}
            {tab === "ask" && <Ask />}
            {tab === "trip" && <TripOverview />}
          </div>

          {/* bottom tab bar */}
          <div className="grid grid-cols-4 border-t border-[#E6E6E8] bg-white/90 pb-1.5 pt-1.5 backdrop-blur">
            {TABS.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setOpenDay(null);
                  }}
                  aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center gap-1 py-1"
                >
                  <Icon
                    className="h-[22px] w-[22px]"
                    style={{ color: active ? PRIMARY : "#6B7280" }}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}
                    style={{ color: active ? PRIMARY : "#6B7280" }}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted">
        An early look — tap the tabs ↑
      </p>
    </div>
  );
}
