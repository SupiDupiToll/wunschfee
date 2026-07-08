import type { Metadata } from "next";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { HeroSection } from "@/components/landung/hero";
import { FeatureCards } from "@/components/landung/feature-cards";
import { StepsSection } from "@/components/landung/steps-section";
import { CTASection } from "@/components/landung/cta-section";
import { BlogPreview } from "@/components/landung/blog-preview";
import { JsonLd } from "@/components/shared/json-ld";

export const metadata: Metadata = {
  title: "Wunschfee – Wunschliste erstellen & teilen",
  description:
    "Erstelle deine persönliche Geschenkeliste und teile sie mit Freunden & Familie. Keine doppelten Geschenke mehr!",
  openGraph: {
    title: "Wunschfee – Wunschliste erstellen & teilen",
    description:
      "Erstelle deine persönliche Geschenkeliste und teile sie mit Freunden & Familie.",
  },
};

export default function LandingPage() {
  return (
    <>
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Wunschfee",
          url: process.env.NEXT_PUBLIC_SITE_URL || "https://wunschfee.sdtoll.de",
          description:
            "Erstelle deine persönliche Geschenkeliste und teile sie mit Freunden & Familie.",
          inLanguage: "de-DE",
        }}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <StepsSection />
          <FeatureCards />
          <BlogPreview />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
}
