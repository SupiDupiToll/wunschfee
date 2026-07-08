import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "1",
    title: "Wunschliste erstellen",
    description:
      "Registriere dich kostenlos und lege deine persönliche Wunschliste an. Füge Amazon-Links, eigene Ideen oder Notizen hinzu.",
  },
  {
    number: "2",
    title: "Mit Freunden teilen",
    description:
      "Kopiere den Link zu deiner Liste und teile ihn per WhatsApp, E-Mail oder Instagram – ganz einfach und in Sekunden.",
  },
  {
    number: "3",
    title: "Geschenke bekommen",
    description:
      "Freunde und Familie reservieren ihre Wunschgeschenke. Du siehst nicht, wer was reserviert hat – Überraschung garantiert.",
  },
];

export function StepsSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="mb-12 text-center font-serif text-3xl">
        In 3 Schritten zur perfekten Wunschliste
      </h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.number} className="relative border-none text-center shadow-sm">
            <CardContent className="p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-serif text-xl text-primary">
                {step.number}
              </div>
              <h3 className="mb-2 font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
