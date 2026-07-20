// @goodtrip/shared — shared types and constants.
// Data-model types for the tables used through Phase 3 (spec section 3).
// AI action contracts and `ai_conversations` types (spec section 8) are
// deferred to Phase 4.

/** UUID string, e.g. "11111111-1111-4111-8111-111111111111". */
export type UUID = string;
/** ISO 8601 calendar date, e.g. "2026-07-21". */
export type ISODate = string;
/** ISO 8601 UTC timestamp, e.g. "2026-07-21T17:00:00Z". */
export type ISODateTime = string;

export type TripMemberRole = "owner" | "member";

export interface Profile {
  id: UUID;
  display_name: string;
  avatar_color: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Trip {
  id: UUID;
  name: string;
  destination: string;
  start_date: ISODate;
  end_date: ISODate;
  lodging: string | null;
  created_by: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface TripMember {
  id: UUID;
  trip_id: UUID;
  user_id: UUID;
  role: TripMemberRole;
  joined_at: ISODateTime;
}

export interface Day {
  id: UUID;
  trip_id: UUID;
  day_number: number;
  date: ISODate;
  title: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Activity {
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
}

/** A checklist; global to the trip when `day_id` is null, per-day otherwise. */
export interface Checklist {
  id: UUID;
  trip_id: UUID;
  day_id: UUID | null;
  title: string;
  position: number;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface ChecklistItem {
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
}

export interface ActivityFeedEntry {
  id: UUID;
  trip_id: UUID;
  actor_id: UUID | null;
  verb: string;
  target: string;
  created_at: ISODateTime;
}

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
export interface Database {
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
}
