# Wunschfee ✨

**Wunschfee** ist eine digitale Wunschlisten-App. Erstelle personalisierte Geschenklisten für Geburtstage, Hochzeiten, Weihnachten oder jeden anderen Anlass – und teile sie mit Freunden und Familie. Keine doppelten Geschenke mehr.

👉 [wunschfee.sdtoll.de](https://wunschfee.sdtoll.de)

## Features

- **Amazon-Produkte hinzufügen** – Einfach einen Link einfügen, Preis und Bilder werden automatisch ausgelesen
- **Wunschliste teilen** – via Link, WhatsApp oder als gedruckte Einladungskarte mit QR-Code
- **Geschenke reservieren** – Gäste können Geschenke reservieren, damit nichts doppelt gekauft wird
- **Überraschungsmodus** – Reservierungen bleiben für den Listenersteller anonym
- **Einladungskarte** – PDF-freundliche Karte mit QR-Code zum Ausdrucken
- **Personalisierung** – Hintergrundverläufe, Dekorationen, QR-Code-Farben
- **Amazon-Partnerprogramm** – Alle Produktlinks enthalten einen Affiliate-Tag

## Tech-Stack

| Technologie | Zweck |
|---|---|
| [Next.js](https://nextjs.org) (App Router) | Framework |
| [React](https://react.dev) 19 | UI |
| [TypeScript](https://www.typescriptlang.org) | Sprache |
| [Tailwind CSS](https://tailwindcss.com) 4 | Styling |
| [shadcn/ui](https://ui.shadcn.com) + @base-ui/react | Komponenten |
| [Prisma](https://www.prisma.io) + PostgreSQL (Neon) | Datenbank |
| [Hexclave](https://hexclave.com) | Authentifizierung |
| [Zod](https://zod.dev) | Validierung |
| [Jina AI Reader](https://r.jina.ai) + BrightData | Amazon-Produkt-Scraping |

## Voraussetzungen

- Node.js >= 20
- pnpm
- PostgreSQL-Datenbank (z. B. [Neon](https://neon.tech))
- Hexclave-Projekt ([app.hexclave.com](https://app.hexclave.com))

## Einrichtung

```bash
# Repository klonen
git clone <repo-url>
cd geschenke

# Abhängigkeiten installieren
pnpm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local
# .env.local mit den folgenden Werten ausfüllen:
```

### Umgebungsvariablen

| Variable | Beschreibung |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Produktions-URL (z. B. `https://wunschfee.sdtoll.de`) |
| `DATABASE_URL` | PostgreSQL-Verbindungsstring (Neon) |
| `HEXCLAVE_PROJECT_ID` | Hexclave-Projekt-ID |
| `NEXT_PUBLIC_HEXCLAVE_PROJECT_ID` | Hexclave-Projekt-ID (öffentlich) |
| `HEXCLAVE_SECRET_SERVER_KEY` | Hexclave Secret Server Key |
| `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` | Amazon Affiliate-Tag (optional) |
| `BRIGHTDATA_API_TOKEN` | BrightData API-Token (optional) |
| `BRIGHTDATA_UNLOCKER_ZONE` | BrightData Unlocker Zone (optional) |

### Datenbank und Entwicklungsserver starten

```bash
# Prisma-Client generieren
pnpm db:generate

# Migrationen ausführen
pnpm db:migrate

# Entwicklungsserver starten (mit Hexclave)
pnpm dlx hexclave dev -- pnpm dev
```

## Skripte

| Befehl | Beschreibung |
|---|---|
| `pnpm dev` | Entwicklungsserver starten |
| `pnpm build` | Produktions-Build erstellen |
| `pnpm start` | Produktionsserver starten |
| `pnpm lint` | ESLint ausführen |
| `pnpm db:generate` | Prisma-Client generieren |
| `pnpm db:migrate` | Datenbank-Migrationen ausführen |
| `pnpm db:push` | Schema direkt per Push in die DB schreiben |

## Projektstruktur

```
src/
├── app/                    # Next.js App Router-Seiten
│   ├── page.tsx            # Landing Page
│   ├── dashboard/          # Dashboard (nach Login)
│   ├── liste/              # Wunschlisten (öffentlich, verwalten, einladung)
│   └── blog/               # Blog-Artikel
├── components/             # UI-Komponenten
│   ├── ui/                 # shadcn/ui-Primitives
│   ├── shared/             # Header, Footer, Logo, etc.
│   ├── landung/            # Landing-Page-Sektionen
│   ├── liste/              # Wunschlisten-Komponenten
│   └── dashboard/          # Dashboard-Komponenten
├── actions/                # Server Actions (CRUD)
├── lib/                    # Utilities (Amazon, Scraper, Validierung)
└── db/                     # Prisma-Client & Schema-Typen
```

## Lizenz

Privat. Nur für den autorisierten Gebrauch.
