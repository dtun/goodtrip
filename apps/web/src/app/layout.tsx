import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

// Next.js requires font loader calls to be assigned to const declarations
// to ensure consistent font loading and optimization across the application.
// Using 'let' or 'var' will trigger the error: "Font loader calls must be assigned to a const"
const inter = Inter({ subsets: ["latin"] });

export let metadata: Metadata = {
  title: "GoodTrip",
  description: "Your Adventure, AI Perfected",
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
        <main className="bg-muted/50 flex h-100vh flex-1 flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
