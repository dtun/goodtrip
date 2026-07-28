import { createClient } from "@supabase/supabase-js";
import type { Database } from "@goodtrip/shared";
import { isValidEmail, normalizeEmail } from "@/lib/waitlist";

// Sign-ups are dynamic writes; never cache or statically prerender this route.
export const dynamic = "force-dynamic";

type Body = { email?: unknown; source?: unknown };

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

  // ignoreDuplicates → INSERT ... ON CONFLICT (email) DO NOTHING, so a repeat
  // sign-up is a no-op success rather than a unique-violation error. Works with
  // an INSERT-only RLS policy (no read-back needed).
  const { error } = await supabase
    .from("waitlist")
    .upsert({ email, source }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    console.error("[waitlist] insert failed:", error.message);
    return Response.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, stored: true });
}
