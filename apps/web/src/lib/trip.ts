/* The real DC trip — America's 250th Birthday family trip, Jul 21–29 2026.
   Shared, hard-coded data that feeds the interactive app mockup. */

export type Activity = {
  time?: string;
  title: string;
  location?: string;
  cost?: string;
  confirmed?: boolean;
  confirmedNote?: string;
  booking?: boolean;
  tags?: string[];
};

export type DayPlan = {
  n: number;
  dow: string;
  date: string;
  title: string;
  cost: string;
  progress: number; // checklist completion %
  activities: Activity[];
};

export type Member = {
  name: string;
  initials: string;
  color: string;
  online?: boolean;
};

export type ChecklistGroup = {
  category: string;
  items: { text: string; done?: boolean; by?: string }[];
};

export const TRIP = {
  name: "America's 250th Birthday",
  destination: "Washington, D.C.",
  dates: "Jul 21–29, 2026",
  countdown: "30 days to go",
  hotel: "Residence Inn · 1199 Vermont Ave NW · McPherson Square",
};

export const MEMBERS: Member[] = [
  { name: "Danny", initials: "D", color: "#3C3B6E", online: true },
  { name: "Ellen", initials: "E", color: "#B22234" },
  { name: "Jack", initials: "J", color: "#2D6A4F", online: true },
  { name: "Eva", initials: "V", color: "#C9A84C", online: true },
  { name: "Elizabeth", initials: "Z", color: "#4C5BC9" },
  { name: "Elisha", initials: "S", color: "#B7791F" },
  { name: "GG", initials: "GG", color: "#6E3C5A" },
  { name: "Papa", initials: "P", color: "#3C6E5A", online: true },
];

export const DAYS: DayPlan[] = [
  {
    n: 1,
    dow: "Tue",
    date: "Jul 21",
    title: "Arrival & Settle In",
    cost: "Free",
    progress: 40,
    activities: [
      {
        time: "Afternoon",
        title: "Check in & stock the kitchen",
        location: "Residence Inn · CVS / Wawa",
        cost: "—",
      },
      {
        time: "Evening",
        title: "White House at night",
        location: "12-min walk south",
        cost: "FREE",
      },
      {
        time: "Dinner",
        title: "Founding Farmers",
        location: "1924 Pennsylvania Ave NW",
        cost: "~$240",
        booking: true,
      },
    ],
  },
  {
    n: 2,
    dow: "Wed",
    date: "Jul 22",
    title: "Capitol Tour + Ford’s Theatre",
    cost: "Free",
    progress: 75,
    activities: [
      {
        time: "10:30 AM",
        title: "U.S. Capitol Building Tour",
        location: "Capitol Visitor Center · First St SE",
        cost: "FREE",
        confirmed: true,
        confirmedNote: "Confirmed via Sen. Mark Kelly",
        tags: ["history"],
      },
      {
        time: "1:00 PM",
        title: "Ford’s Theatre",
        location: "511 10th St NW",
        cost: "$3",
        booking: true,
        tags: ["history"],
      },
      {
        time: "3:00 PM",
        title: "Return to hotel — rest",
        location: "Residence Inn",
        cost: "—",
      },
    ],
  },
  {
    n: 3,
    dow: "Thu",
    date: "Jul 23",
    title: "Mount Vernon",
    cost: "~$184",
    progress: 20,
    activities: [
      {
        time: "9:00 AM",
        title: "Washington’s Mansion Tour",
        location: "Mount Vernon, VA",
        cost: "~$184",
        tags: ["history"],
      },
      {
        time: "11:00 AM",
        title: "4D Revolutionary War Theater",
        location: "On the estate",
        cost: "incl.",
        tags: ["kids"],
      },
      {
        time: "1:00 PM",
        title: "Mount Vernon Inn Restaurant",
        location: "Colonial-inspired · code SPRING2026",
        cost: "$$",
        booking: true,
      },
    ],
  },
  {
    n: 4,
    dow: "Fri",
    date: "Jul 24",
    title: "Museum of the Bible",
    cost: "~$320",
    progress: 15,
    activities: [
      {
        time: "10:00 AM",
        title: "Dead Sea Scrolls",
        location: "Floor 5 · timed entry",
        cost: "~$320",
        tags: ["museum"],
      },
      {
        time: "12:00 PM",
        title: "Megiddo Mosaic",
        location: "Floor 1 lobby · oldest Christian site",
        cost: "FREE",
      },
      {
        time: "Evening",
        title: "The Wharf dinner",
        location: "Waterfront · code CIC25",
        cost: "$$",
        booking: true,
      },
    ],
  },
  {
    n: 5,
    dow: "Sat",
    date: "Jul 25",
    title: "Rest Day + Monument Walk",
    cost: "Free",
    progress: 10,
    activities: [
      {
        time: "All day",
        title: "Rest day — protect this",
        location: "Unscheduled · sleep in",
        cost: "FREE",
      },
      {
        time: "7:00 PM",
        title: "Evening Monument Walk",
        location: "WWII → Lincoln Memorial",
        cost: "FREE",
      },
      {
        time: "8:25 PM",
        title: "Sunset at the Reflecting Pool",
        location: "National Mall",
        cost: "FREE",
      },
    ],
  },
  {
    n: 6,
    dow: "Sun",
    date: "Jul 26",
    title: "Worship + Holocaust Museum",
    cost: "Free",
    progress: 5,
    activities: [
      {
        time: "10:30 AM",
        title: "Capitol Hill Baptist Church",
        location: "525 A St NE",
        cost: "FREE",
      },
      {
        time: "1:30 PM",
        title: "Holocaust Memorial Museum",
        location: "100 Raoul Wallenberg Pl SW",
        cost: "$1",
        booking: true,
        tags: ["museum"],
      },
    ],
  },
  {
    n: 7,
    dow: "Mon",
    date: "Jul 27",
    title: "Museum of American History",
    cost: "Free",
    progress: 5,
    activities: [
      {
        time: "10:00 AM",
        title: "Star-Spangled Banner",
        location: "Nat. Museum of American History",
        cost: "FREE",
        tags: ["museum"],
      },
      {
        time: "12:00 PM",
        title: "Mitsitam Native Foods Café",
        location: "Museum of the American Indian",
        cost: "$$",
      },
      {
        time: "5:00 PM",
        title: "National Portrait Gallery",
        location: "Open until 7 PM",
        cost: "FREE",
      },
    ],
  },
  {
    n: 8,
    dow: "Tue",
    date: "Jul 28",
    title: "National Archives + Dinner",
    cost: "Free + dinner",
    progress: 0,
    activities: [
      {
        time: "10:00 AM",
        title: "The Rotunda",
        location: "Declaration · Constitution · Magna Carta",
        cost: "$1",
        booking: true,
        tags: ["history"],
      },
      {
        time: "5:30 PM",
        title: "Old Ebbitt Grill",
        location: "675 15th St NW · est. 1856",
        cost: "~$330–420",
        confirmed: true,
        confirmedNote: "Reserved · party of 8",
        booking: true,
      },
    ],
  },
  {
    n: 9,
    dow: "Wed",
    date: "Jul 29",
    title: "Departure Day",
    cost: "Free",
    progress: 0,
    activities: [
      {
        time: "Morning",
        title: "Final breakfast & checkout",
        location: "Residence Inn",
        cost: "—",
      },
      {
        time: "11:30 AM",
        title: "National Portrait Gallery",
        location: "Optional · one hour max",
        cost: "FREE",
      },
      {
        time: "Afternoon",
        title: "Reagan National (DCA)",
        location: "Metro Blue/Yellow · ~25 min",
        cost: "—",
      },
    ],
  },
];

export const DAY_CHECKLIST: { text: string; done?: boolean; by?: string }[] = [
  { text: "Sunscreen on everyone", done: true, by: "Eva" },
  { text: "Water bottles filled", done: true, by: "Jack" },
  { text: "Timed-entry tickets confirmed", done: true, by: "Danny" },
  { text: "Light sweater — museums are cold" },
  { text: "Count heads before leaving hotel" },
];

export const GLOBAL_CHECKLIST: ChecklistGroup[] = [
  {
    category: "Clothing",
    items: [
      { text: "Comfortable walking shoes", done: true, by: "Ellen" },
      { text: "Light sweater — museums are cold", done: true, by: "GG" },
      { text: "Compact rain poncho ×8", done: true, by: "Papa" },
      { text: "Nice outfit for Old Ebbitt" },
      { text: "Sunday church outfit" },
    ],
  },
  {
    category: "Essentials",
    items: [
      { text: "Sunscreen SPF 50+", done: true, by: "Eva" },
      { text: "Refillable water bottles", done: true, by: "Jack" },
      { text: "Electrolyte packets", done: true },
      { text: "Small backpack (no bags at Capitol)", done: true, by: "Danny" },
      { text: "First aid kit + medications" },
    ],
  },
  {
    category: "Documents",
    items: [
      { text: "REAL ID for all adults", done: true, by: "Ellen" },
      { text: "Capitol Tour confirmation (Jul 22)", done: true, by: "Danny" },
      { text: "All ticket confirmations saved" },
      { text: "Contactless cards for Metro" },
      { text: "Emergency cash" },
    ],
  },
];

export type ChatMsg = { role: "user" | "assistant"; content: string };

export const AI_CONVO: ChatMsg[] = [
  { role: "user", content: "What’s on the agenda tomorrow?" },
  {
    role: "assistant",
    content:
      "Tomorrow is Day 3 — Mount Vernon. Aim for the 9:00 AM opening; it’s a scenic 30–40 min drive down the GW Parkway and parking is free. Grab the Mansion tour first, then the 4D Revolutionary War theater the kids will love. Lunch at the Mount Vernon Inn, and head back by 2:30–3:00 PM for the afternoon rest. Tip: code SPRING2026 saves 20% on tickets.",
  },
];

export const AI_ACTION = {
  prompt: "Add this to Day 3?",
  title: "Mount Vernon Inn — lunch reservation",
  detail: "1:00 PM · colonial-inspired American",
};

export const AI_SUGGESTIONS = [
  "What do we still need to pack?",
  "Give me a recap of today",
  "Dinner near the National Mall",
];

export const FEED = [
  { who: "Eva", action: "checked off", target: "Sunscreen on everyone", when: "2m" },
  { who: "Papa", action: "confirmed", target: "Old Ebbitt Grill", when: "18m" },
  { who: "Ellen", action: "added", target: "The Wharf dinner to Day 4", when: "1h" },
  { who: "GOODTrip", action: "suggestion accepted", target: "Mount Vernon Inn lunch", when: "2h" },
];
