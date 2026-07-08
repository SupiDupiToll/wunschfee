import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: "🔗",
    title: "Amazon-Links einfügen",
    description:
      "Füge einfach einen Amazon-Link ein – Titel, Bild und Preis werden automatisch erkannt.",
  },
  {
    icon: "📱",
    title: "Teilen mit einem Klick",
    description:
      "Kopiere den Link und teile ihn via WhatsApp, Instagram oder E-Mail.",
  },
  {
    icon: "🔒",
    title: "Keine doppelten Geschenke",
    description:
      "Gäste können Geschenke reservieren. Optional mit Passwort-Schutz.",
  },
  {
    icon: "🎂",
    title: "Name & Geburtstag",
    description:
      "Trage Name und Anlass ein – z.B. „Max' 30. Geburtstag&quot;.",
  },
  {
    icon: "🛒",
    title: "Direkt zu Amazon",
    description:
      "Jedes Produkt hat einen „Auf Amazon kaufen&quot;-Button.",
  },
  {
    icon: "🎉",
    title: "Überraschungsmodus",
    description:
      "Optionale Funktion: Der Besitzer sieht nicht, wer was reserviert hat.",
  },
];

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="mb-12 text-center font-serif text-3xl">
        Alle Vorteile auf einen Blick
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Card key={i} className="border-none shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
