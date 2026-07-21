// @goodtrip/shared — shared types and constants.
// Data-model types (spec section 3) and AI action contracts (spec section 8),
// shared by the web app and the ai-chat edge function.

/** UUID string, e.g. "11111111-1111-4111-8111-111111111111". */
export type UUID = string;
/** ISO 8601 calendar date, e.g. "2026-07-21". */
export type ISODate = string;
/** ISO 8601 UTC timestamp, e.g. "2026-07-21T17:00:00Z". */
export type ISODateTime = string;

export type TripMemberRole = "owner" | "member";

export type Profile = {
  id: UUID;
  display_name: string;
  avatar_color: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type Trip = {
  id: UUID;
  name: string;
  destination: string;
  start_date: ISODate;
  end_date: ISODate;
  lodging: string | null;
  created_by: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type TripMember = {
  id: UUID;
  trip_id: UUID;
  user_id: UUID;
  role: TripMemberRole;
  joined_at: ISODateTime;
};

export type Day = {
  id: UUID;
  trip_id: UUID;
  day_number: number;
  date: ISODate;
  title: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type Activity = {
  id: UUID;
  trip_id: UUID;
  day_id: UUID;
  position: number;
  time_label: string | null;
  title: string;
  location: string | null;
  cost: string | null;
  confirmed: boolean;
  confirmed_note: string | null;
  booking_url: string | null;
  booking_code: string | null;
  booking_cta: string | null;
  tags: string[];
  created_by: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

/** A checklist; global to the trip when `day_id` is null, per-day otherwise. */
export type Checklist = {
  id: UUID;
  trip_id: UUID;
  day_id: UUID | null;
  title: string;
  position: number;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type ChecklistItem = {
  id: UUID;
  trip_id: UUID;
  checklist_id: UUID;
  label: string;
  position: number;
  done: boolean;
  done_by: UUID | null;
  done_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type ActivityFeedEntry = {
  id: UUID;
  trip_id: UUID;
  actor_id: UUID | null;
  verb: string;
  target: string;
  created_at: ISODateTime;
};

/**
 * The eight seeded family profiles (supabase/seed.sql) share this id prefix —
 * the DC 2026 beta's claimable roster. Devices sign in anonymously with fresh
 * UUIDs, so the prefix cleanly separates family identities from guests.
 */
export let SEED_FAMILY_PROFILE_ID_PREFIX = "00000000-0000-4000-8000-0000000000";

export function isFamilyProfile(profile: Pick<Profile, "id">): boolean {
  return profile.id.startsWith(SEED_FAMILY_PROFILE_ID_PREFIX);
}

// ── AI action contracts (spec section 8) ────────────────────────────────────
// Ask GOODTrip proposes changes as structured actions; nothing is written
// until the user confirms a card (#40/#41).

export type AddActivityAction = {
  type: "add_activity";
  day_number: number;
  title: string;
  time_label?: string | null;
  location?: string | null;
  cost?: string | null;
};

export type UpdateActivityAction = {
  type: "update_activity";
  activity_id: UUID;
  changes: {
    title?: string;
    time_label?: string | null;
    location?: string | null;
    cost?: string | null;
    confirmed?: boolean;
    confirmed_note?: string | null;
  };
};

export type CheckItemAction = {
  type: "check_item";
  item_id: UUID;
  done: boolean;
};

/** Add a new item to an existing checklist. */
export type AddItemAction = {
  type: "add_item";
  checklist_id: UUID;
  label: string;
};

/** Rename an existing checklist item. */
export type EditItemAction = {
  type: "edit_item";
  item_id: UUID;
  label: string;
};

/** Remove an existing checklist item. */
export type RemoveItemAction = {
  type: "remove_item";
  item_id: UUID;
};

export type AIAction =
  | AddActivityAction
  | UpdateActivityAction
  | CheckItemAction
  | AddItemAction
  | EditItemAction
  | RemoveItemAction;

/** An action awaiting confirmation; id is the model's tool_use id. */
export type ProposedAction = { id: string; action: AIAction };

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AIChatRequest = {
  tripId: UUID;
  messages: ChatTurn[];
  /** The caller's local date (YYYY-MM-DD) and IANA timezone, so the assistant
      reasons about "today" from the user's clock rather than the server's UTC. */
  today?: ISODate;
  timeZone?: string;
};

export type AIChatResponse = { reply: string; actions: ProposedAction[] };

/** Insert shape for a row type: database-generated columns become optional. */
type Insert<Row, Generated extends keyof Row> = Omit<Row, Generated> &
  Partial<Pick<Row, Generated>>;

export type ProfileInsert = Insert<Profile, "created_at" | "updated_at">;
export type TripInsert = Insert<
  Trip,
  "id" | "created_at" | "updated_at" | "lodging" | "created_by"
>;
export type TripMemberInsert = Insert<TripMember, "id" | "joined_at" | "role">;
export type DayInsert = Insert<Day, "id" | "created_at" | "updated_at">;
export type ActivityInsert = Insert<
  Activity,
  | "id"
  | "created_at"
  | "updated_at"
  | "position"
  | "time_label"
  | "location"
  | "cost"
  | "confirmed"
  | "confirmed_note"
  | "booking_url"
  | "booking_code"
  | "booking_cta"
  | "tags"
  | "created_by"
>;
export type ChecklistInsert = Insert<
  Checklist,
  "id" | "created_at" | "updated_at" | "day_id" | "position"
>;
export type ChecklistItemInsert = Insert<
  ChecklistItem,
  "id" | "created_at" | "updated_at" | "position" | "done" | "done_by" | "done_at"
>;
export type ActivityFeedEntryInsert = Insert<ActivityFeedEntry, "id" | "created_at" | "actor_id">;

/**
 * Database definition for `createClient<Database>()` from @supabase/supabase-js.
 * Covers the tables used through Phase 3; `ai_conversations` lands in Phase 4.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<Profile>;
        Relationships: [];
      };
      trips: {
        Row: Trip;
        Insert: TripInsert;
        Update: Partial<Trip>;
        Relationships: [];
      };
      trip_members: {
        Row: TripMember;
        Insert: TripMemberInsert;
        Update: Partial<TripMember>;
        Relationships: [];
      };
      days: {
        Row: Day;
        Insert: DayInsert;
        Update: Partial<Day>;
        Relationships: [];
      };
      activities: {
        Row: Activity;
        Insert: ActivityInsert;
        Update: Partial<Activity>;
        Relationships: [];
      };
      checklists: {
        Row: Checklist;
        Insert: ChecklistInsert;
        Update: Partial<Checklist>;
        Relationships: [];
      };
      checklist_items: {
        Row: ChecklistItem;
        Insert: ChecklistItemInsert;
        Update: Partial<ChecklistItem>;
        Relationships: [];
      };
      activity_feed: {
        Row: ActivityFeedEntry;
        Insert: ActivityFeedEntryInsert;
        Update: Partial<ActivityFeedEntry>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_trip_member: { Args: { p_trip_id: UUID }; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
