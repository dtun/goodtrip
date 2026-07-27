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

const title = "GOODTrip — Have a GOOD trip.";
const description =
  "A collaborative, AI-assisted travel itinerary for small groups. Plan it together and change it in real time, pack with less effort, and let the logistics run themselves — so you can show up and enjoy the trip. Coming soon — join the waitlist.";

export let metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "GOODTrip",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicons/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicons/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon/apple-touch-icon-180x180.png",
  },
  openGraph: {
    type: "website",
    siteName: "GOODTrip",
    title,
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
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
