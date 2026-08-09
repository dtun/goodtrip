import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "./sitemap";

// /sitemap.xml returned a 404 in production before this file existed. These
// tests pin what it lists (the landing page, at an absolute URL), what it
// deliberately omits (`/trip`, the auth-gated app shell), and that it stays
// byte-identical between builds.

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("sitemap", () => {
  it("lists the landing page at an absolute URL", () => {
    expect(sitemap()).toContainEqual(
      expect.objectContaining({ url: "http://localhost:3000/", priority: 1 }),
    );
  });

  it("omits /trip — the app shell is not marketing", () => {
    expect(sitemap().map((entry) => entry.url)).not.toContain("http://localhost:3000/trip");
  });

  it("builds URLs from the configured site origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://goodtrip.info");
    vi.resetModules();

    let { default: configured } = await import("./sitemap");

    expect(configured().map((entry) => entry.url)).toEqual(["https://goodtrip.info/"]);
  });

  it("is deterministic — no build-time timestamp to churn the file", () => {
    expect(sitemap()).toEqual(sitemap());
    expect(sitemap().every((entry) => entry.lastModified === undefined)).toBe(true);
  });
});
