import { LinkButton } from "@/components/shared/link-button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,168,83,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
          <span className="text-base">🎁</span>
          Nie wieder doppelte Geschenke
        </div>
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
          Erstelle deine
          <br />
          <span className="text-primary">Wunschliste</span> und teile sie
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Füge Amazon-Links hinzu, lass Titel & Bilder automatisch laden und
          teile die Liste mit Freunden & Familie.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <LinkButton href="/dashboard" variant="default" size="lg" className="h-12 px-8 text-base">
            Kostenlos erstellen
          </LinkButton>
          <LinkButton href="#how-it-works" variant="outline" size="lg" className="h-12 px-8 text-base">
            So funktioniert&rsquo;s
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
