import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShareBar } from "./share-bar";

/* The bar is deliberately two actions — the OS share sheet and a copied link.
   These pin that down from both sides: nothing routes to a channel we no
   longer target, and the share tile appears only where navigator.share exists,
   so desktop is never shown two buttons that do the same thing. */

let writeText = vi.fn(() => Promise.resolve());

function stubNavigator(key: "clipboard" | "share", value: unknown) {
  Object.defineProperty(navigator, key, { value, configurable: true });
}

beforeEach(() => {
  writeText = vi.fn(() => Promise.resolve());
  stubNavigator("clipboard", { writeText });
});

afterEach(() => {
  // jsdom ships neither of these, so "restore" means removing them again.
  stubNavigator("clipboard", undefined);
  stubNavigator("share", undefined);
});

describe("ShareBar", () => {
  it("offers no group-chat or email route", () => {
    let { container } = render(<ShareBar />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/sms:|mailto:/);
  });

  it("copies the page url and says so", async () => {
    render(<ShareBar />);
    await userEvent.click(screen.getByRole("button", { name: "Copy link" }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(screen.getByRole("button", { name: "Link copied" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy link" })).not.toBeInTheDocument();
  });

  it("hides the share tile on a browser without a share sheet", () => {
    render(<ShareBar />);
    expect(screen.queryByRole("button", { name: "Share…" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();
  });

  it("hands the page to the share sheet when the browser has one", async () => {
    let share = vi.fn(() => Promise.resolve());
    stubNavigator("share", share);

    render(<ShareBar />);
    await userEvent.click(screen.getByRole("button", { name: "Share…" }));

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ title: "GOODTrip", url: window.location.href }),
    );
  });

  it("shrugs off a dismissed share sheet", async () => {
    stubNavigator(
      "share",
      vi.fn(() => Promise.reject(new Error("AbortError"))),
    );

    render(<ShareBar />);
    await userEvent.click(screen.getByRole("button", { name: "Share…" }));

    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();
  });
});
