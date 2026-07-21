// ai-chat — Ask GOODTrip edge function (spec section 8, issues #24/#25).
//
// Verifies the caller's JWT, reads the trip through the caller's own
// RLS-gated client (non-members get nothing), injects the trip as context,
// and asks Claude. Itinerary changes come back as tool_use proposals that
// the client renders as confirmation cards — this function never writes.
//
// Secrets: ANTHROPIC_API_KEY (supabase secrets set).

import Anthropic from "npm:@anthropic-ai/sdk@0.57.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.0";

let MODEL = "claude-sonnet-4-6"; // per spec (README stack)

let corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

let tools: Anthropic.Tool[] = [
  {
    name: "add_activity",
    description:
      "Propose adding a new activity to a day of the itinerary. Use when the user wants something new on the plan. The user confirms before anything is saved.",
    input_schema: {
      type: "object",
      properties: {
        day_number: { type: "integer", description: "Which day (1-9) to add it to" },
        title: { type: "string", description: "Short activity title" },
        time_label: {
          type: "string",
          description: "Freeform time, e.g. '1:00 PM', 'Morning', 'Evening'",
        },
        location: { type: "string", description: "Where, incl. helpful notes" },
        cost: { type: "string", description: "'Free', '$', '$$', or '$$$'" },
      },
      required: ["day_number", "title"],
    },
  },
  {
    name: "update_activity",
    description:
      "Propose editing an existing activity (retitle, retime, relocate, set cost, or mark confirmed). Reference the activity by its id from the itinerary context.",
    input_schema: {
      type: "object",
      properties: {
        activity_id: { type: "string", description: "The activity's id from context" },
        changes: {
          type: "object",
          properties: {
            title: { type: "string" },
            time_label: { type: "string" },
            location: { type: "string" },
            cost: { type: "string" },
            confirmed: { type: "boolean" },
            confirmed_note: { type: "string" },
          },
        },
      },
      required: ["activity_id", "changes"],
    },
  },
  {
    name: "check_item",
    description:
      "Propose checking or unchecking a checklist item. Reference the item by its id from the checklist context.",
    input_schema: {
      type: "object",
      properties: {
        item_id: { type: "string", description: "The checklist item's id from context" },
        done: { type: "boolean" },
      },
      required: ["item_id", "done"],
    },
  },
  {
    name: "add_item",
    description:
      "Propose adding a new item to an existing checklist. Use when the user wants something added to a packing or to-do list. Reference the checklist by its id from the checklist context.",
    input_schema: {
      type: "object",
      properties: {
        checklist_id: { type: "string", description: "The target checklist's id from context" },
        label: { type: "string", description: "The item text, e.g. 'Passport'" },
      },
      required: ["checklist_id", "label"],
    },
  },
  {
    name: "edit_item",
    description:
      "Propose renaming an existing checklist item. Reference the item by its id from the checklist context.",
    input_schema: {
      type: "object",
      properties: {
        item_id: { type: "string", description: "The checklist item's id from context" },
        label: { type: "string", description: "The new item text" },
      },
      required: ["item_id", "label"],
    },
  },
  {
    name: "remove_item",
    description:
      "Propose removing an existing checklist item. Reference the item by its id from the checklist context.",
    input_schema: {
      type: "object",
      properties: {
        item_id: { type: "string", description: "The checklist item's id from context" },
      },
      required: ["item_id"],
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    let apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return json({ error: "ANTHROPIC_API_KEY is not configured" }, 500);

    // A user-scoped client: every read below happens under the caller's RLS.
    let supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });
    let {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    let { tripId, messages, today, timeZone } = await req.json();
    if (!tripId || !Array.isArray(messages) || messages.length === 0) {
      return json({ error: "tripId and messages are required" }, 400);
    }

    // "Today" comes from the caller's local clock (the server runs in UTC, which
    // reads as tomorrow for users west of it). Validate before it reaches the
    // prompt; fall back to the server date if it's missing or malformed.
    let todayLabel =
      typeof today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(today)
        ? today
        : new Date().toISOString().slice(0, 10);
    let zoneLabel =
      typeof timeZone === "string" && /^[A-Za-z0-9_+\-/]{1,64}$/.test(timeZone) ? timeZone : "";

    let [trip, days, activities, checklists, items, profiles] = await Promise.all([
      supabase.from("trips").select("*").eq("id", tripId).maybeSingle(),
      supabase.from("days").select("*").eq("trip_id", tripId).order("day_number"),
      supabase.from("activities").select("*").eq("trip_id", tripId).order("position"),
      supabase.from("checklists").select("*").eq("trip_id", tripId),
      supabase.from("checklist_items").select("*").eq("trip_id", tripId),
      supabase.from("profiles").select("id, display_name"),
    ]);
    if (trip.error) throw trip.error;
    if (!trip.data) return json({ error: "Not a member of this trip" }, 403);

    let names = new Map((profiles.data ?? []).map((p) => [p.id, p.display_name]));
    let me = names.get(user.id) ?? "a trip member";

    let itinerary = (days.data ?? [])
      .map((day) => {
        let lines = (activities.data ?? [])
          .filter((a) => a.day_id === day.id)
          .map(
            (a) =>
              `  - [id ${a.id}] ${a.time_label ?? "anytime"} · ${a.title}` +
              (a.location ? ` @ ${a.location}` : "") +
              (a.cost ? ` (${a.cost})` : "") +
              (a.confirmed ? ` [confirmed${a.confirmed_note ? ": " + a.confirmed_note : ""}]` : ""),
          );
        return `Day ${day.day_number} (${day.date}) — ${day.title}\n${lines.join("\n")}`;
      })
      .join("\n");

    let lists = (checklists.data ?? [])
      .map((list) => {
        let day = (days.data ?? []).find((d) => d.id === list.day_id);
        let name = day ? `Day ${day.day_number} ${list.title}` : list.title;
        let scope = `${name} [id ${list.id}]`;
        let lines = (items.data ?? [])
          .filter((i) => i.checklist_id === list.id)
          .map(
            (i) =>
              `  - [id ${i.id}] ${i.done ? "[x]" : "[ ]"} ${i.label}` +
              (i.done && i.done_by ? ` (by ${names.get(i.done_by) ?? "someone"})` : ""),
          );
        return `${scope}\n${lines.join("\n")}`;
      })
      .join("\n");

    let system = `You are GOODTrip, the family trip assistant for "${trip.data.name}" — ${trip.data.destination}, ${trip.data.start_date} to ${trip.data.end_date}. Lodging: ${trip.data.lodging ?? "n/a"}. Today's date is ${todayLabel}${zoneLabel ? ` (${zoneLabel})` : ""}. You are talking to ${me}.

You know the whole trip. Answer questions concretely from the itinerary and checklists below. When the user wants to change the plan — add or edit an activity, check something off, or add, rename, or remove a checklist item — propose it with the matching tool; the user confirms before anything is saved, so propose confidently and keep your text brief. Each checklist and item carries an [id ...] in the context below; reference real days, ids, and names from context only.

Your replies render as plain text in a small chat bubble — no markdown of any kind. Never use asterisks, pound signs, pipes/tables, or backticks. Write short conversational lines; for lists, put one item per line starting with "- ". Times and names go inline, e.g. "10:00 AM - Washington's Mansion Tour (Mount Vernon, VA)".

ITINERARY
${itinerary}

CHECKLISTS
${lists}`;

    let anthropic = new Anthropic({ apiKey });
    let response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system,
      messages,
      tools,
      thinking: { type: "adaptive" },
    });

    let reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();
    let actions = response.content
      .filter((block) => block.type === "tool_use")
      .map((block) => ({ id: block.id, action: { type: block.name, ...block.input } }));

    return json({ reply, actions });
  } catch (error) {
    console.error("ai-chat failed:", error);
    let message = error instanceof Error ? error.message : String(error);
    return json({ error: message }, 500);
  }
});
