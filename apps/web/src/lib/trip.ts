/* The real DC trip — America's 250th Birthday family trip, Jul 21–29 2026.
   Shared, hard-coded data that feeds the interactive app mockup. */

export type Activity = {
  time?: string;
  title: string;
  location?: string;
  place?: string; // maps-searchable name/address, powers the "Map" link
  cost?: string;
  confirmed?: boolean;
  confirmedNote?: string;
  booking?: boolean;
  url?: string; // booking / info link
  code?: string; // discount code
  cta?: string; // link label, e.g. "Tickets", "Reserve"
  tags?: string[];
};

/**
 * A day's real forecast, fetched at runtime from a weather service and keyed
 * by the day's `iso` date. `sky` picks the icon. Never hard-coded — a day with
 * no live data (fetch failed, or the date is beyond the forecast horizon)
 * simply carries no weather rather than an invented one.
 */
export type Weather = {
  sky: "sunny" | "partly" | "cloudy" | "rain" | "storms";
  summary: string; // short label, e.g. "Thunderstorms"
  hi: number; // high, °F
  lo: number; // low, °F
};

/** Live forecast keyed by ISO date (YYYY-MM-DD). */
export type WeatherByDate = Record<string, Weather>;

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
    iso: "2026-07-21",
    title: "Arrival & Settle In",
    cost: "Free",
    progress: 40,
    activities: [
      {
        time: "10:00 AM",
        title: "Southwest #2491 · PHX → BWI",
        location: "Lands 5:25 PM · confs ATXHVU + AU62AD · seats at check-in",
        confirmed: true,
        confirmedNote: "Booked",
        code: "ATXHVU",
        url: "https://www.southwest.com/air/manage-reservation/",
        cta: "Check in",
      },
      {
        time: "5:45 PM",
        title: "BWI → downtown D.C.",
        location: "MARC Penn Line or drive · ~1 hr",
      },
      {
        time: "Evening",
        title: "Check in & stock the kitchen",
        location: "Residence Inn · CVS / Wawa",
        place: "Residence Inn Washington DC Downtown, 1199 Vermont Ave NW, Washington, DC 20005",
      },
      {
        time: "Evening",
        title: "White House at night",
        location: "12-min walk south · White House museum & store",
        cost: "Free",
        place: "The White House, 1600 Pennsylvania Ave NW, Washington, DC 20500",
      },
    ],
  },
  {
    n: 2,
    dow: "Wed",
    date: "Jul 22",
    iso: "2026-07-22",
    title: "Capitol Tour + Ford’s Theatre",
    cost: "Free",
    progress: 75,
    activities: [
      {
        time: "10:30 AM",
        title: "U.S. Capitol Building Tour",
        location: "Meet: Mark Kelly’s office · Ste 516 Hart Senate Bldg",
        place: "Hart Senate Office Building, 120 Constitution Ave NE, Washington, DC 20510",
        cost: "Free",
        confirmed: true,
        confirmedNote: "Via Sen. Mark Kelly · map in email",
        tags: ["history"],
      },
      {
        time: "1:30 PM",
        title: "Ford’s Theatre",
        location: "511 10th St NW",
        place: "Ford’s Theatre, 511 10th St NW, Washington, DC 20004",
        cost: "$",
        booking: true,
        url: "https://fords.org/visit/tickets/",
        cta: "Tickets",
        tags: ["history"],
      },
      {
        time: "3:00 PM",
        title: "Return to hotel — rest",
        location: "Residence Inn",
        place: "Residence Inn Washington DC Downtown, 1199 Vermont Ave NW, Washington, DC 20005",
      },
    ],
  },
  {
    n: 3,
    dow: "Thu",
    date: "Jul 23",
    iso: "2026-07-23",
    title: "Mount Vernon",
    cost: "$$",
    progress: 20,
    activities: [
      {
        time: "10:00 AM",
        title: "Washington’s Mansion Tour",
        location: "Mount Vernon, VA",
        place:
          "George Washington’s Mount Vernon, 3200 Mount Vernon Memorial Hwy, Mount Vernon, VA 22121",
        cost: "$$",
        confirmed: true,
        confirmedNote: "Purchased · conf in email",
        url: "https://www.mountvernon.org/plan-your-visit/buy-tickets/",
        cta: "Tickets",
        tags: ["history"],
      },
      {
        time: "11:00 AM",
        title: "4D Revolutionary War Theater",
        location: "On the estate · included with admission",
        tags: ["kids"],
      },
      {
        time: "11:30 AM",
        title: "Enslaved People Tour",
        location: "Specialty tour · on the estate",
        confirmed: true,
        confirmedNote: "Purchased · conf in email",
        tags: ["history"],
      },
      {
        time: "1:00 PM",
        title: "Through My Eyes Tour",
        location: "Costumed character tour · on the estate",
        confirmed: true,
        confirmedNote: "Purchased · conf in email",
        tags: ["history"],
      },
      {
        time: "Afternoon",
        title: "Mount Vernon Inn Restaurant",
        location: "Colonial-inspired American",
        place:
          "Mount Vernon Inn Restaurant, 3200 Mount Vernon Memorial Hwy, Mount Vernon, VA 22121",
        cost: "$$",
        booking: true,
        url: "https://www.mountvernon.org/the-estate-gardens/location/mount-vernon-inn-restaurant",
        cta: "Reserve",
      },
    ],
  },
  {
    n: 4,
    dow: "Fri",
    date: "Jul 24",
    iso: "2026-07-24",
    title: "Museum of the Bible",
    cost: "$$$",
    progress: 15,
    activities: [
      {
        time: "1:00 PM",
        title: "Dead Sea Scrolls",
        location: "Floor 5 · timed entry",
        place: "Museum of the Bible, 400 4th St SW, Washington, DC 20024",
        cost: "$$$",
        booking: true,
        url: "https://www.museumofthebible.org/tickets",
        code: "CIC25",
        cta: "Tickets",
        tags: ["museum"],
      },
      {
        time: "12:00 PM",
        title: "Megiddo Mosaic",
        location: "Floor 1 lobby · oldest Christian site",
        place: "Museum of the Bible, 400 4th St SW, Washington, DC 20024",
        cost: "Free",
      },
      {
        time: "Anytime",
        title: "All Creation Sings",
        location: "Immersive worship experience · flexible entry",
        place: "Museum of the Bible, 400 4th St SW, Washington, DC 20024",
        tags: ["kids"],
      },
      {
        time: "Evening",
        title: "The Wharf dinner",
        location: "Waterfront",
        place: "The Wharf, 760 Maine Ave SW, Washington, DC 20024",
        cost: "$$",
        booking: true,
        url: "https://www.wharfdc.com/restaurants/",
        cta: "Explore",
      },
    ],
  },
  {
    n: 5,
    dow: "Sat",
    date: "Jul 25",
    iso: "2026-07-25",
    title: "Rest Day + Monument Walk",
    cost: "$$",
    progress: 10,
    activities: [
      {
        time: "Morning",
        title: "Rest day — protect this",
        location: "Unscheduled · sleep in",
        cost: "Free",
      },
      {
        time: "Afternoon",
        title: "Air & Space Museum",
        location: "National Air and Space Museum · free timed passes",
        place: "National Air and Space Museum, 600 Independence Ave SW, Washington, DC 20560",
        cost: "Free",
        url: "https://airandspace.si.edu/visit",
        cta: "Passes",
        tags: ["museum", "kids"],
      },
      {
        time: "6:00 PM",
        title: "Founding Farmers",
        location: "1924 Pennsylvania Ave NW · Foggy Bottom",
        place: "Founding Farmers DC, 1924 Pennsylvania Ave NW, Washington, DC 20006",
        cost: "$$",
        booking: true,
        url: "https://www.foundingfarmers.com/location/founding-farmers-dc",
        cta: "Reserve",
      },
      {
        time: "7:00 PM",
        title: "Evening Monument Walk",
        location: "Washington Monument → WWII → Lincoln Memorial",
        place: "Washington Monument, 2 15th St NW, Washington, DC 20024",
        cost: "Free",
        url: "https://www.nps.gov/linc/planyourvisit/index.htm",
        cta: "NPS info",
      },
      {
        time: "8:25 PM",
        title: "Sunset at the Reflecting Pool",
        location: "National Mall",
        place: "Lincoln Memorial Reflecting Pool, Washington, DC 20565",
        cost: "Free",
      },
    ],
  },
  {
    n: 6,
    dow: "Sun",
    date: "Jul 26",
    iso: "2026-07-26",
    title: "Worship + Holocaust Museum",
    cost: "Free",
    progress: 5,
    activities: [
      {
        time: "10:30 AM",
        title: "Capitol Hill Baptist Church",
        location: "525 A St NE · pre-register children",
        place: "Capitol Hill Baptist Church, 525 A St NE, Washington, DC 20002",
        cost: "Free",
        url: "https://www.capitolhillbaptist.org/",
        cta: "Pre-register",
      },
      {
        time: "1:30 PM",
        title: "Holocaust Memorial Museum",
        location: "100 Raoul Wallenberg Pl SW",
        place:
          "United States Holocaust Memorial Museum, 100 Raoul Wallenberg Pl SW, Washington, DC 20024",
        cost: "$",
        confirmed: true,
        confirmedNote: "Passes · entry 1:30–1:45",
        url: "https://www.ushmm.org/visit/plan-your-visit/timed-entry-passes",
        cta: "Passes",
        tags: ["museum"],
      },
    ],
  },
  {
    n: 7,
    dow: "Mon",
    date: "Jul 27",
    iso: "2026-07-27",
    title: "Museum of American History",
    cost: "Free",
    progress: 5,
    activities: [
      {
        time: "10:00 AM",
        title: "Star-Spangled Banner",
        location: "Nat. Museum of American History",
        place:
          "National Museum of American History, 1300 Constitution Ave NW, Washington, DC 20560",
        cost: "Free",
        confirmed: true,
        confirmedNote: "No reservations needed",
        url: "https://americanhistory.si.edu/visit",
        cta: "Plan visit",
        tags: ["museum"],
      },
      {
        time: "12:00 PM",
        title: "Mitsitam Native Foods Café",
        location: "Museum of the American Indian",
        place:
          "National Museum of the American Indian, 4th St SW & Independence Ave SW, Washington, DC 20560",
        cost: "$$",
      },
      {
        time: "5:00 PM",
        title: "National Portrait Gallery",
        location: "Open until 7 PM",
        place: "National Portrait Gallery, 8th St NW & G St NW, Washington, DC 20001",
        cost: "Free",
        confirmed: true,
        confirmedNote: "No reservations needed",
        url: "https://npg.si.edu/visit",
        cta: "Hours",
      },
    ],
  },
  {
    n: 8,
    dow: "Tue",
    date: "Jul 28",
    iso: "2026-07-28",
    title: "National Archives + Dinner",
    cost: "$$$",
    progress: 0,
    activities: [
      {
        time: "1:00 PM",
        title: "The Rotunda",
        location: "Declaration · Constitution · Magna Carta",
        place: "National Archives Museum, 701 Constitution Ave NW, Washington, DC 20408",
        cost: "$",
        confirmed: true,
        confirmedNote: "Timed entry 1:00–1:15",
        url: "https://www.archives.gov/dc/visit",
        cta: "Timed entry",
        tags: ["history"],
      },
      {
        time: "3:30 PM",
        title: "Old Ebbitt Grill",
        location: "675 15th St NW · est. 1856 · party of 8",
        place: "Old Ebbitt Grill, 675 15th St NW, Washington, DC 20005",
        cost: "$$$",
        confirmed: true,
        confirmedNote: "Reserved",
        url: "https://www.opentable.com/r/old-ebbitt-grill-washington",
        cta: "Reserve",
      },
    ],
  },
  {
    n: 9,
    dow: "Wed",
    date: "Jul 29",
    iso: "2026-07-29",
    title: "Departure Day",
    cost: "Free",
    progress: 0,
    activities: [
      {
        time: "Morning",
        title: "Final breakfast & checkout",
        location: "Residence Inn",
        place: "Residence Inn Washington DC Downtown, 1199 Vermont Ave NW, Washington, DC 20005",
      },
      {
        time: "12:00 PM",
        title: "Head to BWI",
        location: "MARC Penn Line or drive · ~1 hr",
      },
      {
        time: "3:05 PM",
        title: "Southwest #1050 · BWI → PHX",
        location: "Lands PHX 4:55 PM · confs ATXHVU + AU62AD",
        confirmed: true,
        confirmedNote: "Booked",
        code: "ATXHVU",
        url: "https://www.southwest.com/air/manage-reservation/",
        cta: "Check in",
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
      { text: "Southwest check-in — 24 hrs before each flight (ATXHVU + AU62AD)" },
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
