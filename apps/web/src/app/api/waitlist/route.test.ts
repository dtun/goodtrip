import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

// The `waitlist` table is write-only: an INSERT policy and no SELECT policy.
// These tests pin the route to the shape that survives it — a plain insert
// whose unique violation counts as success — because the upsert it replaced
// was rejected by RLS on every single sign-up, new address or repeat.
const insert = vi.fn();
const upsert = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ from: () => ({ insert, upsert }) }),
}));

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  insert.mockReset().mockResolvedValue({ error: null });
  upsert.mockReset().mockResolvedValue({ error: null });
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/waitlist", () => {
  it("stores a sign-up with the email normalized", async () => {
    const res = await post({ email: "  Danny@Example.COM ", source: "landing-hero" });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, stored: true });
    expect(insert).toHaveBeenCalledWith({ email: "danny@example.com", source: "landing-hero" });
  });

  it("never sends an upsert — on_conflict needs a SELECT policy this table lacks", async () => {
    await post({ email: "danny@example.com" });

    expect(upsert).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("treats an already-listed email as success, not an error", async () => {
    insert.mockResolvedValue({ error: { code: "23505", message: "duplicate key value" } });

    const res = await post({ email: "danny@example.com" });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, stored: true });
  });

  it("reports a genuine database failure as a 500", async () => {
    insert.mockResolvedValue({ error: { code: "42501", message: "rls" } });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await post({ email: "danny@example.com" });

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toMatchObject({ ok: false });
  });

  it("rejects an invalid address before touching the database", async () => {
    const res = await post({ email: "danny@localhost" });

    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it("accepts but does not claim to store when Supabase is unconfigured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const res = await post({ email: "danny@example.com" });

    await expect(res.json()).resolves.toEqual({ ok: true, stored: false });
    expect(insert).not.toHaveBeenCalled();
  });

  it("defaults the source when the client omits it", async () => {
    await post({ email: "danny@example.com" });

    expect(insert).toHaveBeenCalledWith({ email: "danny@example.com", source: "landing" });
  });
});
