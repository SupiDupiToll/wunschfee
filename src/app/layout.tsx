import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { HexclaveProvider, HexclaveTheme } from "@hexclave/next";
import { hexclaveServerApp } from "@/hexclave/server";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wunschfee.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wunschfee – Wunschliste erstellen & teilen",
    template: "%s – Wunschfee",
  },
  description:
    "Erstelle deine persönliche Geschenkeliste und teile sie mit Freunden & Familie. Keine doppelten Geschenke mehr!",
  keywords: [
    "Geschenkeliste",
    "Wunschliste",
    "Geburtstagsliste",
    "Geschenke organisieren",
    "Hochzeitsliste",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Wunschfee",
    title: "Wunschfee – Wunschliste erstellen & teilen",
    description:
      "Erstelle deine persönliche Geschenkeliste und teile sie mit Freunden & Familie.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wunschfee – Wunschliste erstellen & teilen",
    description:
      "Erstelle deine persönliche Geschenkeliste und teile sie mit Freunden & Familie.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <HexclaveProvider app={hexclaveServerApp} lang="de-DE">
          <HexclaveTheme
            theme={{
              light: {
                background: "#fafaf8",
                foreground: "#1a1a2e",
                card: "#ffffff",
                cardForeground: "#1a1a2e",
                popover: "#ffffff",
                popoverForeground: "#1a1a2e",
                primary: "#d4a853",
                primaryForeground: "#ffffff",
                secondary: "#f5f0e8",
                secondaryForeground: "#1a1a2e",
                muted: "#f0efea",
                mutedForeground: "#6b7280",
                accent: "#fdf6e3",
                accentForeground: "#1a1a2e",
                destructive: "#ef4444",
                destructiveForeground: "#ffffff",
                border: "#e5e7eb",
                input: "#e5e7eb",
                ring: "#d4a853",
              },
              dark: {
                background: "#0f0f1a",
                foreground: "#f1f1f1",
                card: "#1a1a2e",
                cardForeground: "#f1f1f1",
                popover: "#1a1a2e",
                popoverForeground: "#f1f1f1",
                primary: "#f0c060",
                primaryForeground: "#1a1a2e",
                secondary: "#2a2a3e",
                secondaryForeground: "#f1f1f1",
                muted: "#252535",
                mutedForeground: "#9ca3af",
                accent: "#2a2a3e",
                accentForeground: "#f1f1f1",
                destructive: "#7f1d1d",
                destructiveForeground: "#f1f1f1",
                border: "#2a2a3e",
                input: "#2a2a3e",
                ring: "#f0c060",
              },
              radius: "0.75rem",
            }}
          >
            {children}
          </HexclaveTheme>
        </HexclaveProvider>
        <Toaster position="top-right" richColors />
        <script src="https://embed.impressum.mangoe.de/impressum-embed.js" async />
      </body>
    </html>
  );
}
