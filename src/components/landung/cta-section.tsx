import Link from "next/link";
import { LinkButton } from "@/components/shared/link-button";

export function CTASection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary p-8 sm:p-12">
        <h2 className="font-serif text-3xl">Bereit für deine Wunschliste?</h2>
        <p className="mt-4 text-muted-foreground">
          Erstelle in 2 Minuten eine Liste und teile sie mit deinen Liebsten.
        </p>
        <LinkButton
          href="/dashboard"
          size="lg"
          className="mt-8 h-12 px-8 text-base"
        >
          Kostenlos starten
        </LinkButton>
        <p className="mt-4 text-xs text-muted-foreground">
          <Link href="/blog" className="underline-offset-2 hover:underline">
            Tipps & Ideen im Blog →
          </Link>
        </p>
      </div>
    </section>
  );
}
