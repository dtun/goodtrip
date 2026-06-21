import { ImageResponse } from "next/og";

export const alt = "GOODTrip — Have a GOOD trip.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0B0D24",
          backgroundImage: "linear-gradient(135deg, #11132E 0%, #0B0D24 55%, #160F1C 100%)",
          color: "#F3EAD8",
          fontFamily: "sans-serif",
        }}
      >
        {/* top: kicker + compass */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 10,
              color: "#C9A84C",
              textTransform: "uppercase",
            }}
          >
            Est. MMXXVI · Washington · D.C.
          </div>
          <svg width="120" height="120" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(201,168,76,0.45)" strokeWidth="2" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(201,168,76,0.28)" strokeWidth="2" />
            <path d="M100 16 L112 100 L100 100 L88 100 Z" fill="#E6CB78" />
            <path d="M100 184 L112 100 L100 100 L88 100 Z" fill="#C9A84C" />
            <path d="M16 100 L100 112 L100 100 L100 88 Z" fill="#C9A84C" />
            <path d="M184 100 L100 112 L100 100 L100 88 Z" fill="#C9A84C" />
            <circle cx="100" cy="100" r="7" fill="#E6CB78" />
          </svg>
        </div>

        {/* center: wordmark + tagline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 168, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
            <span style={{ color: "#F3EAD8" }}>GOOD</span>
            <span style={{ color: "#C9A84C" }}>Trip</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 44, fontStyle: "italic", color: "#F3EAD8" }}>
            Have a GOOD trip.
          </div>
          <div
            style={{
              marginTop: 28,
              width: 240,
              height: 8,
              borderRadius: 8,
              backgroundImage: "linear-gradient(90deg, #B22234, #C9A84C)",
            }}
          />
        </div>

        {/* bottom: trip line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: "#A7A189",
          }}
        >
          <div style={{ display: "flex" }}>
            Washington, D.C. · America&apos;s 250th Birthday
          </div>
          <div style={{ display: "flex", color: "#C9A84C" }}>Jul 21–29, 2026</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
