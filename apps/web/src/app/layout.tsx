import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// next/font loader calls must be assigned to const declarations.
const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
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

export let metadata: Metadata = {
  title: "GOODTrip — Have a GOOD trip.",
  description:
    "A collaborative, AI-assisted travel itinerary for small groups. One trip, every day, shared in real time. DC 2026.",
};

export let viewport = {
  themeColor: "#0B0D24",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} grain font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
