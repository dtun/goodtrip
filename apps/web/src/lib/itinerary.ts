import type { Activity, Day } from "@goodtrip/shared";

export type DayWithActivities = {
  day: Day;
  activities: Activity[];
};

/** Sorts after every clock time, so untimed / "anytime" stops trail the day. */
const NO_TIME = Number.MAX_SAFE_INTEGER;

/** Representative minute-of-day for the loose time-of-day words the data uses. */
const NAMED_TIMES: Record<string, number> = {
  midnight: 0,
  morning: 8 * 60,
  midday: 12 * 60,
  noon: 12 * 60,
  afternoon: 13 * 60,
  evening: 18 * 60,
  night: 21 * 60,
};

/**
 * Turn a free-form `time_label` into a minute-of-day so activities can be
 * ordered chronologically. Handles clock times ("9:00 AM", "1:30 PM", "12 PM")
 * and the loose words the itinerary uses ("Morning", "Evening"). Anything we
 * can't read — null, "Anytime", stray text — sorts to the end via `NO_TIME`,
 * where `position` then keeps a stable order.
 */
export function timeLabelToMinutes(label: string | null): number {
  if (!label) return NO_TIME;
  let text = label.trim().toLowerCase();

  let clock = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (clock) {
    let hour = Number(clock[1]);
    let minute = clock[2] ? Number(clock[2]) : 0;
    let meridiem = clock[3];
    if (hour > 23 || minute > 59) return NO_TIME;
    if (meridiem === "pm" && hour < 12) hour += 12;
    else if (meridiem === "am" && hour === 12) hour = 0;
    return hour * 60 + minute;
  }

  return NAMED_TIMES[text] ?? NO_TIME;
}

/** Order days by day_number and attach each day's activities in time order. */
export function groupActivitiesByDay(days: Day[], activities: Activity[]): DayWithActivities[] {
  let byDay = new Map<string, Activity[]>();
  for (let activity of activities) {
    let list = byDay.get(activity.day_id);
    if (!list) {
      list = [];
      byDay.set(activity.day_id, list);
    }
    list.push(activity);
  }

  return [...days]
    .sort((a, b) => a.day_number - b.day_number)
    .map((day) => ({
      day,
      // Chronological by time_label, with position (then title) as the stable
      // tiebreaker so same-time and untimed stops keep a predictable order.
      activities: (byDay.get(day.id) ?? [])
        .slice()
        .sort(
          (a, b) =>
            timeLabelToMinutes(a.time_label) - timeLabelToMinutes(b.time_label) ||
            a.position - b.position ||
            a.title.localeCompare(b.title),
        ),
    }));
}
