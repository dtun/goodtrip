import { createClient } from "@supabase/supabase-js";
import type { Database } from "@goodtrip/shared";
import { isValidEmail, normalizeEmail } from "@/lib/waitlist";

// Sign-ups are dynamic writes; never cache or statically prerender this route.
export const dynamic = "force-dynamic";

type Body = { email?: unknown; source?: unknown };

/** Postgres unique_violation — here, an email already on the list. */
const DUPLICATE_EMAIL = "23505";

/**
 * POST /api/waitlist — add an email to the pre-launch waitlist.
 *
 * The `waitlist` table grants anon INSERT (write-only) via RLS, so we use the
 * public anon key server-side. If Supabase isn't configured (local build with
 * no env), we accept the sign-up but report `stored: false` rather than
 * pretending it was persisted — the visitor still sees success, and the server
 * log makes the gap obvious.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const rawEmail = typeof body.email === "string" ? body.email : "";
  if (!isValidEmail(rawEmail)) {
    return Response.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const email = normalizeEmail(rawEmail);
  const source = typeof body.source === "string" ? body.source.slice(0, 120) : "landing";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.warn("[waitlist] Supabase env missing — sign-up accepted but not stored:", email);
    return Response.json({ ok: true, stored: false });
  }

  const supabase = createClient<Database>(url, anonKey, {
    auth: { persistSession: false },
  });

  // Plain INSERT, deliberately not `.upsert()`. Under RLS, Postgres evaluates
  // an ON CONFLICT insert against a SELECT policy — it has to read back the row
  // it just proposed — and that applies to DO NOTHING (what `ignoreDuplicates`
  // asks for) as much as DO UPDATE, whether or not anything actually conflicts.
  // `waitlist` is write-only by design: an INSERT policy and no SELECT policy.
  // So every upsert was rejected with 42501 "new row violates row-level
  // security policy" and not one sign-up was stored. A repeat sign-up instead
  // surfaces as a unique violation on `email` — the success case, since they
  // are already on the list.
  const { error } = await supabase.from("waitlist").insert({ email, source });

  if (error && error.code !== DUPLICATE_EMAIL) {
    console.error("[waitlist] insert failed:", error.message);
    return Response.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, stored: true });
}
