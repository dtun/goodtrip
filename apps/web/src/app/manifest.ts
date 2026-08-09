import type { MetadataRoute } from "next";

/**
 * Web app manifest, served at /manifest.webmanifest.
 *
 * Without this the site had no name of its own when saved to a home screen —
 * Android fell back to the <title> and a generated glyph, and the install
 * prompt had nothing to show. iOS reads the apple-touch icon from the
 * <link rel="apple-touch-icon"> that app/apple-icon.png now emits, not from
 * here, so the two mechanisms are deliberately kept in step.
 *
 * Icons are referenced from /public by stable path. They cannot come from the
 * app/ convention files: Next content-hashes those URLs at build time, so
 * there is no fixed path to name here.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GOODTrip",
    short_name: "GOODTrip",
    description: "A collaborative, AI-assisted travel itinerary for families.",
    start_url: "/",
    // The landing page is the whole site today, but /trip is a real app screen
    // behind it — standalone is the right shell for where this is heading.
    display: "standalone",
    // Both match viewport.themeColor in layout.tsx; the sand background is the
    // page's own base colour, so the launch splash matches the first paint.
    background_color: "#FBF6EF",
    theme_color: "#FBF6EF",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        // 256 is the largest size the source artwork genuinely contains — the
        // favicon.ico these were derived from tops out there. Upscaling to the
        // customary 512 would only produce a soft icon, so we ship what's real.
        src: "/icons/icon-256.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  };
}
