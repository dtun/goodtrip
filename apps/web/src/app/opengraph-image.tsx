import { ImageResponse } from "next/og";

export const alt = "GOODTrip — Have a GOOD trip.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: "#FBF6EF",
        backgroundImage: "linear-gradient(135deg, #FEFBF5 0%, #FBF6EF 52%, #FBE9E1 100%)",
        color: "#2E2620",
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
            color: "#B84327",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Coming soon
        </div>
        <svg width="120" height="120" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(242,107,78,0.4)"
            strokeWidth="2"
          />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="rgba(242,107,78,0.25)"
            strokeWidth="2"
          />
          <path d="M100 16 L112 100 L100 100 L88 100 Z" fill="#F4A63C" />
          <path d="M100 184 L112 100 L100 100 L88 100 Z" fill="#F26B4E" />
          <path d="M16 100 L100 112 L100 100 L100 88 Z" fill="#F26B4E" />
          <path d="M184 100 L100 112 L100 100 L100 88 Z" fill="#F26B4E" />
          <circle cx="100" cy="100" r="7" fill="#F4A63C" />
        </svg>
      </div>

      {/* center: wordmark + tagline */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 168,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#2E2620" }}>GOOD</span>
          <span style={{ color: "#F26B4E" }}>Trip</span>
        </div>
        <div style={{ marginTop: 16, fontSize: 44, fontWeight: 500, color: "#4A403A" }}>
          Have a GOOD trip.
        </div>
        <div
          style={{
            marginTop: 28,
            width: 240,
            height: 8,
            borderRadius: 8,
            backgroundImage: "linear-gradient(90deg, #1F9E92, #F26B4E, #F4A63C)",
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
          color: "#6E635A",
        }}
      >
        <div style={{ display: "flex" }}>Collaborative AI itineraries for small groups</div>
        <div style={{ display: "flex", color: "#B84327", fontWeight: 600 }}>Join the waitlist</div>
      </div>
    </div>,
    { ...size },
  );
}
