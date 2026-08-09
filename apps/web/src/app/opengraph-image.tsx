import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const alt = "GOODTrip — ask your itinerary anything";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori ships no bold face, so every fontWeight above regular used to be a
// no-op — the old card asked for 800 and rendered light. These are the real
// brand faces (Plus Jakarta Sans, the same family layout.tsx loads for
// headings), vendored as TTF because Satori reads TTF/OTF/WOFF but not WOFF2.
//
// Read from disk rather than fetched. The documented
// `fetch(new URL("./font.ttf", import.meta.url))` recipe only resolves under
// the Edge runtime; on Node the bundler rewrites it to a root-relative
// /_next/static path, which fetch rejects for having no base URL. This route
// is prerendered as static, so both reads happen at build time and nothing
// touches the filesystem in production.
const fontDir = join(process.cwd(), "src", "app");
const extraBoldData = readFileSync(join(fontDir, "PlusJakartaSans-ExtraBold.ttf"));
const mediumData = readFileSync(join(fontDir, "PlusJakartaSans-Medium.ttf"));

/**
 * The social card, sized for X, Bluesky and Threads.
 *
 * The hierarchy here is deliberate, and was previously inverted: 168px went to
 * the wordmark and 26px to the only line describing the product — 6.5x in
 * favour of a brand nobody scrolling a feed has heard of. Three of the four
 * text slots described the launch rather than the thing.
 *
 * Two rules now govern this card. The value leads, because a stranger has to
 * understand the product before the name means anything. And nothing on it
 * gives a reason to keep scrolling — "Coming soon" was doing exactly that,
 * announcing there is nothing to see before anyone had decided to look.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 76px",
        backgroundColor: "#FBF6EF",
        backgroundImage: "linear-gradient(135deg, #FEFBF5 0%, #FBF6EF 52%, #FBE9E1 100%)",
        color: "#2E2620",
        fontFamily: "Plus Jakarta Sans",
      }}
    >
      {/* top: the wordmark, demoted to a lockup, and the compass */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
          <span style={{ color: "#2E2620" }}>GOOD</span>
          <span style={{ color: "#F26B4E" }}>Trip</span>
        </div>
        <svg width="84" height="84" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(242,107,78,0.4)"
            strokeWidth="3"
          />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="rgba(242,107,78,0.25)"
            strokeWidth="3"
          />
          <path d="M100 16 L112 100 L100 100 L88 100 Z" fill="#F4A63C" />
          <path d="M100 184 L112 100 L100 100 L88 100 Z" fill="#F26B4E" />
          <path d="M16 100 L100 112 L100 100 L100 88 Z" fill="#F26B4E" />
          <path d="M184 100 L100 112 L100 100 L100 88 Z" fill="#F26B4E" />
          <circle cx="100" cy="100" r="7" fill="#F4A63C" />
        </svg>
      </div>

      {/* centre: the value, which is the whole point of the card */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 100,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.04,
          }}
        >
          {/* Split across two colours the way the wordmark is, so the payoff
              word carries the brand's accent. */}
          <span style={{ color: "#2E2620" }}>Ask your itinerary</span>
          <span style={{ color: "#F26B4E" }}>anything.</span>
        </div>

        <div
          style={{
            marginTop: 30,
            width: 240,
            height: 8,
            borderRadius: 8,
            backgroundImage: "linear-gradient(90deg, #1F9E92, #F26B4E, #F4A63C)",
          }}
        />

        {/* The proof under the claim: three concrete things it can do, so
            "anything" reads as a capability rather than a boast. Kept to a
            single line — it wraps into an orphan at anything narrower. */}
        <div
          style={{
            display: "flex",
            marginTop: 26,
            maxWidth: 1048,
            fontSize: 27,
            fontWeight: 500,
            lineHeight: 1.35,
            color: "#6E635A",
          }}
        >
          Move dinner, pack for rain, replan a washed-out afternoon — it knows the trip.
        </div>
      </div>

      {/* bottom: where to go, and nothing else. This row held "COMING SOON",
          which told a stranger the site was not worth opening yet — a reason to
          scroll past, printed on the one asset whose entire job is the click. */}
      <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: "#B84327" }}>
        goodtrip.info
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Plus Jakarta Sans", data: extraBoldData, weight: 800, style: "normal" },
        { name: "Plus Jakarta Sans", data: mediumData, weight: 500, style: "normal" },
      ],
    },
  );
}
