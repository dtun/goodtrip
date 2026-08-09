import { describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import manifest from "./manifest";

// layout.tsx calls next/font/google loaders at module scope. Those are compiled
// away by the Next bundler and are plain undefined under vitest, so importing
// the module for its `metadata` export needs them stubbed first. vi.mock is
// hoisted above the import below.
vi.mock("next/font/google", () => {
  const loader = () => ({ variable: "", className: "", style: {} });
  return {
    Plus_Jakarta_Sans: loader,
    Hanken_Grotesk: loader,
    JetBrains_Mono: loader,
  };
});

const { metadata } = await import("./layout");

const appDir = __dirname;
const publicDir = join(appDir, "..", "..", "public");

describe("the web app manifest", () => {
  it("names the app so a saved home-screen shortcut is not left guessing", () => {
    const { name, short_name } = manifest();
    expect(name).toBe("GOODTrip");
    expect(short_name).toBe("GOODTrip");
  });

  it("starts at the landing page", () => {
    expect(manifest().start_url).toBe("/");
  });

  it("keeps its theme colour in step with the viewport's", () => {
    // layout.tsx sets viewport.themeColor to the same sand; if one moves and
    // the other doesn't, the launch splash flashes a different colour than the
    // page paints.
    expect(manifest().theme_color).toBe("#FBF6EF");
    expect(manifest().background_color).toBe("#FBF6EF");
  });

  it("points every icon at a file that actually exists", () => {
    const icons = manifest().icons ?? [];
    expect(icons.length).toBeGreaterThan(0);

    for (const icon of icons) {
      expect(existsSync(join(publicDir, icon.src!))).toBe(true);
    }
  });
});

describe("the icon pipeline", () => {
  // Production once shipped a single <link rel="icon"> and no apple-touch icon
  // at all, because app/favicon.ico existed and file-based metadata silently
  // overrides the `icons` config object. Nothing failed — the icons just
  // vanished. These assertions are the alarm that was missing.
  it("declares its icons as convention files, not as metadata config", () => {
    expect(metadata.icons).toBeUndefined();
  });

  it.each(["favicon.ico", "apple-icon.png"])("ships app/%s so Next emits a link for it", (file) => {
    expect(existsSync(join(appDir, file))).toBe(true);
  });
});

describe("the icons are ours", () => {
  /* The previous pass fixed the plumbing and got the cargo wrong. Two
     favicon.ico files existed — one the create-next-app scaffold left behind,
     one generated from the 🧭 emoji by emojico — and they were told apart by
     byte size and embedded resolutions rather than by looking at them. The
     bigger file won, so the site shipped Vercel's triangle in every browser
     tab, and the real icon was deleted as a duplicate.

     Asserting a file merely *exists* cannot catch that. These check identity. */

  // create-next-app's default favicon.ico, pinned so it can never come back.
  const NEXT_DEFAULT_FAVICON_SHA256 =
    "2b8ad2d33455a8f736fc3a8ebf8f0bdea8848ad4c0db48a2833bd0f9cd775932";

  const sha256 = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

  it("does not ship the scaffold's favicon", () => {
    expect(sha256(join(appDir, "favicon.ico"))).not.toBe(NEXT_DEFAULT_FAVICON_SHA256);
  });

  it("serves the same artwork to iOS as the emojico set in public/", () => {
    // app/apple-icon.png is a copy of the 180 emojico generated. If they ever
    // drift, one of the two was replaced without the other, and the site is
    // wearing two different faces.
    expect(sha256(join(appDir, "apple-icon.png"))).toBe(
      sha256(join(publicDir, "apple-touch-icon", "apple-touch-icon-180x180.png")),
    );
  });
});
