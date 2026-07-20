import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import {
  Playfair_Display,
  Cinzel,
  Literata,
  Marcellus,
  Pinyon_Script,
} from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@fontsource-variable/material-symbols-outlined";
import "./globals.css";
import { MainLayoutContainer } from "./_components/main-layout-container";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-header",
  subsets: ["latin"],
  display: "swap",
});

const literata = Literata({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const marcellus = Marcellus({
  weight: "400",
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const pinyon = Pinyon_Script({
  weight: "400",
  variable: "--font-script",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Midnight Satin | Romance Library",
  description: "A premium reading experience for romance lovers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${cinzel.variable} ${literata.variable} ${marcellus.variable} ${pinyon.variable} bg-void text-text-main font-body antialiased`}
      >
        <ClerkProvider appearance={clerkAppearance}>
          <MainLayoutContainer className="mobile-container bg-silk-noise">
          {children}
          </MainLayoutContainer>
          <SpeedInsights />
        </ClerkProvider>
      </body>
    </html>
  );
}
