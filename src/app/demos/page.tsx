import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/shared/link-button";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { demoList } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "Erkunde die Wunschfee-App mit Beispieldaten – ganz ohne Anmeldung.",
  robots: { index: false, follow: false },
};

export default function DemosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <span className="text-6xl">✨</span>
        <h1 className="mt-6 font-serif text-4xl">Wunschfee – Demo</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Entdecke die App mit Beispieldaten: das Ersteller-Dashboard, die
          Wunschliste und die Einladung – ganz ohne Anmeldung und ganz ohne
          etwas verändern zu können.
        </p>
        <LinkButton
          href={`/demos/${demoList.slug}`}
          size="lg"
          className="mt-8 h-12 px-8 text-base"
        >
          Demo öffnen
        </LinkButton>
        <Link
          href="/"
          className="mt-4 text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Zurück zur Startseite
        </Link>
      </main>
      <Footer />
    </div>
  );
}
