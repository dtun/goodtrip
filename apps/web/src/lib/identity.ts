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

export async function fetchRoster(supabase: GoodtripClient): Promise<Profile[]> {
  let { data, error } = await supabase.from("profiles").select("*");
  if (error) throw error;
  return familyRoster(data ?? []);
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
