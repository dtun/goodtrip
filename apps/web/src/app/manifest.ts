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
    // The same hook the social card and the meta description lead with. This
    // was the last place still carrying the old category-label copy.
    description: "Ask your itinerary anything.",
    start_url: "/",
    // The landing page is the whole site today, but /trip is a real app screen
    // behind it — standalone is the right shell for where this is heading.
    display: "standalone",
    // Both match viewport.themeColor in layout.tsx; the sand background is the
    // page's own base colour, so the launch splash matches the first paint.
    background_color: "#FBF6EF",
    theme_color: "#FBF6EF",
    // The emojico set exactly as generated, at the sizes it actually renders.
    // 180 is the largest it produces, which is short of the 192 Android likes,
    // but this is a landing page with no service worker and so no install
    // prompt — Chrome scales the 180 for a home-screen shortcut and nobody
    // notices. Upscaling to fake a 192 would only ship a soft icon, and
    // inventing new artwork would put a second compass in the world.
    icons: [
      {
        src: "/favicons/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon/apple-touch-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
