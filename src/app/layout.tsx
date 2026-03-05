import type { Metadata } from "next";
import {
  Playfair_Display,
  Cinzel,
  Literata,
  Marcellus,
  Pinyon_Script,
} from "next/font/google";
import "./globals.css";
import { MainLayoutContainer } from "./_components/main-layout-container";

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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${playfair.variable} ${cinzel.variable} ${literata.variable} ${marcellus.variable} ${pinyon.variable} bg-void text-text-main font-body antialiased`}
      >
        <MainLayoutContainer className="mobile-container bg-silk-noise">
          {children}
        </MainLayoutContainer>
      </body>
    </html>
  );
}
