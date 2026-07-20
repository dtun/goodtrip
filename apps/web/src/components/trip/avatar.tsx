import type { Profile } from "@goodtrip/shared";

export function Avatar({
  profile,
  size = "h-8 w-8",
}: {
  profile: Pick<Profile, "display_name" | "avatar_color">;
  size?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold text-cream`}
      style={{ backgroundColor: profile.avatar_color }}
    >
      {profile.display_name.charAt(0).toUpperCase()}
    </span>
  );
}
