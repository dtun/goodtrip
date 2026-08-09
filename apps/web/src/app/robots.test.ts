import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";

// /robots.txt returned a 404 in production before this file existed. These
// tests pin the two things that make it worth serving: crawlers are let in,
// and the sitemap is announced at an absolute URL.

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("robots", () => {
  it("invites every crawler to the whole site", () => {
    expect(robots().rules).toMatchObject({ userAgent: "*", allow: "/" });
  });

  it("keeps crawlers out of the JSON API", () => {
    expect(robots().rules).toMatchObject({ disallow: "/api/" });
  });

  it("announces the sitemap at an absolute URL", () => {
    expect(robots().sitemap).toBe("http://localhost:3000/sitemap.xml");
  });

  it("builds the sitemap URL from the configured site origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://goodtrip.info");
    vi.resetModules();

    let { default: configured } = await import("./robots");

    expect(configured().sitemap).toBe("https://goodtrip.info/sitemap.xml");
  });
});
