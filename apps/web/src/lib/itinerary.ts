import type { Activity, Day } from "@goodtrip/shared";

export type DayWithActivities = {
  day: Day;
  activities: Activity[];
};

/** Order days by day_number and attach each day's activities by position. */
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
      activities: (byDay.get(day.id) ?? [])
        .slice()
        .sort((a, b) => a.position - b.position || a.title.localeCompare(b.title)),
    }));
}
