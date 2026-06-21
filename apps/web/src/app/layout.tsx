import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

// Next.js requires font loader calls to be assigned to const declarations
// to ensure consistent font loading and optimization across the application.
// Using 'let' or 'var' will trigger the error: "Font loader calls must be assigned to a const"
const inter = Inter({ subsets: ["latin"] });

export let metadata: Metadata = {
  title: "GOODTrip — Have a GOOD trip.",
  description:
    "A collaborative, AI-assisted travel itinerary app for small groups. v1.0 plan overview.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="flex flex-1 flex-col bg-[#F8F8F8]">{children}</main>
      </body>
    </html>
  );
}
