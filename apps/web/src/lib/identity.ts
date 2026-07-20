import type { User } from "@supabase/supabase-js";
import type { Profile } from "@goodtrip/shared";
import { isFamilyProfile } from "@goodtrip/shared";
import type { GoodtripClient } from "@/lib/supabase";

/** Display name given to fresh anonymous sign-ins until they claim a name. */
export let UNCLAIMED_NAME = "Traveler";

export function hasClaimedName(profile: Pick<Profile, "display_name">): boolean {
  return profile.display_name !== UNCLAIMED_NAME;
}

/** The claimable family members, in seed order (Danny first, Papa last). */
export function familyRoster(profiles: Profile[]): Profile[] {
  return profiles.filter(isFamilyProfile).sort((a, b) => a.id.localeCompare(b.id));
}

export async function fetchOwnProfile(supabase: GoodtripClient): Promise<Profile> {
  let {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No signed-in user");

  let { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw error;
  if (!data) throw new Error("Own profile not found");
  return data;
}

/** All readable profiles — the family roster plus any guests (attribution). */
export async function fetchProfiles(supabase: GoodtripClient): Promise<Profile[]> {
  let { data, error } = await supabase.from("profiles").select("*");
  if (error) throw error;
  return data ?? [];
}

/**
 * Where the signed-in user's email identity stands (spec section 4, web
 * slice). Anonymous accounts are "none" until they link an email; a linked
 * email is "pending" until its confirmation link is clicked.
 */
export type LinkedEmail =
  | { status: "none" }
  | { status: "pending"; email: string }
  | { status: "confirmed"; email: string };

export function linkedEmailFromUser(
  user: Pick<User, "email" | "new_email" | "email_confirmed_at">,
): LinkedEmail {
  if (user.new_email) return { status: "pending", email: user.new_email };
  if (user.email) {
    return user.email_confirmed_at
      ? { status: "confirmed", email: user.email }
      : { status: "pending", email: user.email };
  }
  return { status: "none" };
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** True when linking failed because another traveler already owns the email. */
export function isEmailTakenError(error: unknown): boolean {
  let { code, message } = (error ?? {}) as { code?: string; message?: string };
  return code === "email_exists" || /already been registered/i.test(message ?? "");
}

/** True when a sign-in link was refused because no account has that email. */
export function isUnknownEmailError(error: unknown): boolean {
  let { code, message } = (error ?? {}) as { code?: string; message?: string };
  return code === "otp_disabled" || /signups not allowed/i.test(message ?? "");
}

export async function fetchLinkedEmail(supabase: GoodtripClient): Promise<LinkedEmail> {
  let {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No signed-in user");
  return linkedEmailFromUser(user);
}

/**
 * Attach an email to the current anonymous account so the identity survives
 * cleared storage and other devices. Supabase emails a confirmation link to
 * the address; the account keeps its id (and profile) throughout.
 */
export async function linkEmail(
  supabase: GoodtripClient,
  rawEmail: string,
  redirectTo: string,
): Promise<LinkedEmail> {
  let email = normalizeEmail(rawEmail);
  let { data, error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: redirectTo },
  );
  if (error) throw error;
  // With email confirmations off the project auto-confirms instantly (no
  // email is sent); with them on, the address sits in new_email as pending.
  return data.user ? linkedEmailFromUser(data.user) : { status: "pending", email };
}

/**
 * Email a magic sign-in link to an already-linked address (returning device).
 * Refuses to mint a new account for unknown emails — the caller should offer
 * the anonymous claim flow instead.
 */
export async function sendSignInLink(
  supabase: GoodtripClient,
  rawEmail: string,
  redirectTo: string,
): Promise<void> {
  let { error } = await supabase.auth.signInWithOtp({
    email: normalizeEmail(rawEmail),
    options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

/** Claim a family identity (or any name) for the signed-in anonymous user. */
export async function claimIdentity(
  supabase: GoodtripClient,
  identity: Pick<Profile, "display_name" | "avatar_color">,
): Promise<Profile> {
  let {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No signed-in user");

  let { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: identity.display_name,
      avatar_color: identity.avatar_color,
    })
    .eq("id", user.id)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Own profile not found");
  return data;
}
