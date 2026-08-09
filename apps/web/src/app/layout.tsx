import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// next/font loader calls must be assigned to const declarations.
// Plus Jakarta Sans — a friendly, rounded, modern sans for headings.
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

// The page title leads with the brand, because that is what someone types into
// a search box once they already know the name. The social title drops it: the
// card already carries the wordmark and og:site_name says GOODTrip underneath,
// so spending the headline slot on the name too would say it three times and
// the value none.
const title = "GOODTrip — Ask your itinerary anything.";
const socialTitle = "Ask your itinerary anything.";

// Deliberately the same promise the card makes, in the same order. On Bluesky
// and Threads this description is rendered directly beneath the image, so a
// mismatch reads as two different products stacked on top of each other.
//
// It no longer ends in "Coming soon" for the same reason the card doesn't:
// announcing there is nothing to see yet, before anyone has decided to look,
// only ever costs clicks. The page itself is honest about the waitlist.
const description =
  "Move dinner, pack for rain, replan a washed-out afternoon — GOODTrip knows the trip, the group, and what everyone already booked.";

export let metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "GOODTrip",
  // No `icons` block here on purpose. App-router *file* conventions —
  // app/favicon.ico, app/icon.png, app/apple-icon.png — take precedence over
  // this config, so the two cannot be mixed: whatever is declared here is
  // silently dropped the moment a convention file exists. It did, and it was:
  // production shipped a lone <link rel="icon" href="/favicon.ico">, and the
  // apple-touch icon this block pointed at never reached the page at all.
  // The convention files are now the single source of truth, and Next derives
  // the correct type/sizes attributes from the files themselves.
  openGraph: {
    type: "website",
    siteName: "GOODTrip",
    title: socialTitle,
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description,
  },
};

export let viewport = {
  themeColor: "#FBF6EF",
  // Let content extend under the notch/home indicator so env(safe-area-inset-*)
  // resolves — the checklist editor sheet pads itself off the home indicator.
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} grain font-sans`}>
        {children}
      </body>
    </html>
  );
}
