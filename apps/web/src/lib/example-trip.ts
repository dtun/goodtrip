/* The example trip shown on the marketing site.
 *
 * Everything here is invented sample data. Nothing in this file describes a
 * real traveler, booking, or reservation: the landing page is public, so it
 * gets a trip that *looks* like a real one without being anyone's. The shape
 * is drawn from a genuine family trip — a few museum days, a protected rest
 * day, a couple of things actually booked — but the specifics are made up.
 *
 * Guards in example-trip.privacy.test.ts fail the build if a record locator,
 * street address, flight number, or contact detail lands here, and
 * example-trip.test.ts keeps the itinerary internally consistent.
 *
 * The live app reads the real trip from Supabase — see lib/goodtrip.ts.
 */

export type Activity = {
  time?: string;
  title: string;
  location?: string;
  cost?: string;
  confirmed?: boolean;
  confirmedNote?: string;
  booking?: boolean;
  url?: string; // booking / info link
  code?: string; // discount code — never set on the example trip, see the guard
  cta?: string; // link label, e.g. "Tickets", "Reserve"
  tags?: string[];
};

export type DayPlan = {
  n: number;
  dow: string;
  date: string;
  iso: string; // ISO date (YYYY-MM-DD) — the weather-lookup key
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

/** A complete example trip: its billing, its party, and its days. */
export type ExampleTrip = {
  id: string;
  /** Pill label in the example picker, e.g. "A weekend in Lisbon". */
  pill: string;
  name: string;
  destination: string;
  dates: string; // short form for the colophon, e.g. "Apr 9\u201313, 2027"
  datesLong: string; // masthead form, e.g. "April 9\u201313, 2027"
  countdown: string;
  hotel: string;
  lodging: string; // colophon short form
  transit: string;
  /** Where to ask for the forecast \u2014 the destination, not a fixed city. */
  coords: { latitude: number; longitude: number };
  members: Member[];
  days: DayPlan[];
};

const DC_MEMBERS: Member[] = [
  { name: "Alex", initials: "A", color: "#3C3B6E", online: true },
  { name: "Jordan", initials: "J", color: "#B22234" },
  { name: "Priya", initials: "P", color: "#2D6A4F", online: true },
  { name: "Milo", initials: "M", color: "#C9A84C", online: true },
  { name: "Nana", initials: "N", color: "#6E3C5A" },
];

const DC_DAYS: DayPlan[] = [
  {
    n: 1,
    dow: "Fri",
    date: "Apr 9",
    iso: "2027-04-09",
    title: "Arrival & the Mall at dusk",
    cost: "Free",
    progress: 60,
    activities: [
      {
        time: "2:00 PM",
        title: "Land and collect the bags",
        location: "Straight downtown from the airport",
      },
      {
        time: "4:30 PM",
        title: "Check in and drop everything",
        location: "Downtown hotel · two blocks from the Metro",
      },
      {
        time: "6:00 PM",
        title: "First look at the Mall",
        location: "Washington Monument · a ten-minute walk",
        cost: "Free",
      },
      {
        time: "8:00 PM",
        title: "Monuments after dark",
        location: "Lincoln Memorial → WWII → Reflecting Pool",
        cost: "Free",
        url: "https://www.nps.gov/nama/planyourvisit/index.htm",
        cta: "NPS info",
      },
    ],
  },
  {
    n: 2,
    dow: "Sat",
    date: "Apr 10",
    iso: "2027-04-10",
    title: "Air & Space",
    cost: "Free",
    progress: 45,
    activities: [
      {
        time: "9:30 AM",
        title: "National Air and Space Museum",
        location: "Free timed passes · book them the week before",
        cost: "Free",
        confirmed: true,
        confirmedNote: "Passes reserved",
        url: "https://airandspace.si.edu/visit",
        cta: "Passes",
        tags: ["museum", "kids"],
      },
      {
        time: "12:30 PM",
        title: "Lunch on the Mall",
        location: "Food hall across the street",
        cost: "$",
      },
      {
        time: "2:30 PM",
        title: "Quiet hour back at the hotel",
        location: "Naps, cards, recharge",
      },
      {
        time: "5:00 PM",
        title: "Ice cream run",
        location: "Two blocks over",
        cost: "$",
        tags: ["kids"],
      },
    ],
  },
  {
    n: 3,
    dow: "Sun",
    date: "Apr 11",
    iso: "2027-04-11",
    title: "Rest day + blossoms",
    cost: "$$",
    progress: 25,
    activities: [
      {
        time: "Morning",
        title: "Rest day — protect this",
        location: "Unscheduled · sleep in",
        cost: "Free",
      },
      {
        time: "1:00 PM",
        title: "Museum of American History",
        location: "Star-Spangled Banner on the second floor",
        cost: "Free",
        url: "https://americanhistory.si.edu/visit",
        cta: "Plan visit",
        tags: ["museum"],
      },
      {
        time: "4:00 PM",
        title: "Tidal Basin walk",
        location: "Cherry blossoms, if the timing holds",
        cost: "Free",
        tags: ["kids"],
      },
      {
        time: "6:30 PM",
        title: "Family dinner out",
        location: "Big table, early seating",
        cost: "$$",
        booking: true,
      },
    ],
  },
  {
    n: 4,
    dow: "Mon",
    date: "Apr 12",
    iso: "2027-04-12",
    title: "History day",
    cost: "$$",
    progress: 15,
    activities: [
      {
        time: "10:00 AM",
        title: "The National Archives",
        location: "Declaration · Constitution · Bill of Rights",
        cost: "$",
        confirmed: true,
        confirmedNote: "Timed entry booked",
        url: "https://www.archives.gov/dc/visit",
        cta: "Timed entry",
        tags: ["history"],
      },
      {
        time: "12:30 PM",
        title: "Lunch near the Navy Memorial",
        location: "Whatever has the shortest line",
        cost: "$$",
      },
      {
        time: "2:30 PM",
        title: "National Portrait Gallery",
        location: "Open late — the rainy-day backup",
        cost: "Free",
        url: "https://npg.si.edu/visit",
        cta: "Hours",
        tags: ["museum"],
      },
      {
        time: "Evening",
        title: "Walk the waterfront",
        location: "Boardwalk, boats, and a bench",
        cost: "Free",
      },
    ],
  },
  {
    n: 5,
    dow: "Tue",
    date: "Apr 13",
    iso: "2027-04-13",
    title: "Departure day",
    cost: "Free",
    progress: 0,
    activities: [
      {
        time: "Morning",
        title: "Last breakfast and checkout",
        location: "Pack the night before",
      },
      {
        time: "11:00 AM",
        title: "One more monument",
        location: "Whichever one the kids pick",
        cost: "Free",
        tags: ["kids"],
      },
      {
        time: "2:30 PM",
        title: "Head to the airport",
        location: "Metro to the terminal · about forty minutes",
      },
    ],
  },
];

const DC_TRIP: ExampleTrip = {
  id: "dc",
  pill: "Five days in Washington, D.C.",
  name: "Cherry Blossom Week",
  destination: "Washington, D.C.",
  dates: "Apr 9–13, 2027",
  datesLong: "April 9–13, 2027",
  countdown: "30 days to go",
  hotel: "Downtown hotel · two blocks from the Metro",
  lodging: "Downtown",
  transit: "Metro Center",
  coords: { latitude: 38.8895, longitude: -77.0353 },
  members: DC_MEMBERS,
  days: DC_DAYS,
};

/** The trip the phone mockup demonstrates, and the picker's default. */
export const FEATURED_EXAMPLE_TRIP = DC_TRIP;

/** Every trip the example picker can show. */
export const EXAMPLE_TRIPS: ExampleTrip[] = [FEATURED_EXAMPLE_TRIP];

/* The checklists, assistant transcript, and activity feed below belong to the
   featured trip — they are what the phone mockup demonstrates. The picker only
   swaps the printed itinerary, which needs days and a party, not these. */

export const EXAMPLE_DAY_CHECKLIST: { text: string; done?: boolean; by?: string }[] = [
  { text: "Sunscreen on everyone", done: true, by: "Priya" },
  { text: "Water bottles filled", done: true, by: "Milo" },
  { text: "Timed-entry passes on someone's phone", done: true, by: "Alex" },
  { text: "Layers — the museums run cold" },
  { text: "Count heads before leaving the hotel" },
];

export const EXAMPLE_GLOBAL_CHECKLIST: ChecklistGroup[] = [
  {
    category: "Clothing",
    items: [
      { text: "Comfortable walking shoes", done: true, by: "Jordan" },
      { text: "Layers — the museums run cold", done: true, by: "Nana" },
      { text: "Rain jackets for everyone", done: true, by: "Alex" },
      { text: "One nice outfit for the family dinner" },
      { text: "Something warm for the evening walks" },
    ],
  },
  {
    category: "Essentials",
    items: [
      { text: "Sunscreen SPF 50+", done: true, by: "Priya" },
      { text: "Refillable water bottles", done: true, by: "Milo" },
      { text: "Snacks for the museum lines", done: true },
      { text: "Small backpack — the Archives has bag rules" },
      { text: "First aid kit and medications" },
    ],
  },
  {
    category: "Documents",
    items: [
      { text: "ID for the adults", done: true, by: "Jordan" },
      { text: "Airline check-in the day before each flight" },
      { text: "Timed-entry passes saved offline", done: true, by: "Alex" },
      { text: "Contactless cards for the Metro" },
      { text: "Emergency cash" },
    ],
  },
];

export type ChatMsg = { role: "user" | "assistant"; content: string };

export const EXAMPLE_AI_CONVO: ChatMsg[] = [
  { role: "user", content: "What’s on the agenda tomorrow?" },
  {
    role: "assistant",
    content:
      "Tomorrow is Day 2 — Air & Space. The free timed passes go quickly, so aim for the 9:30 entry and take the Metro rather than driving. Start upstairs while everyone is fresh, break for lunch on the Mall around 12:30, then head back for the quiet hour at 2:30. Rain moves in late afternoon, which is a good excuse to stay in the museum a while longer.",
  },
];

export const EXAMPLE_AI_ACTION = {
  prompt: "Add this to Day 3?",
  title: "Tidal Basin walk",
  detail: "4:00 PM · cherry blossoms, if the timing holds",
};

export const EXAMPLE_AI_SUGGESTIONS = [
  "What do we still need to pack?",
  "Give me a recap of today",
  "Dinner near the National Mall",
];

export const EXAMPLE_FEED = [
  { who: "Priya", action: "checked off", target: "Sunscreen on everyone", when: "2m" },
  { who: "Nana", action: "confirmed", target: "National Archives timed entry", when: "18m" },
  { who: "Jordan", action: "added", target: "Tidal Basin walk to Day 3", when: "1h" },
  {
    who: "GOODTrip",
    action: "suggestion accepted",
    target: "Air & Space timed passes",
    when: "2h",
  },
];
