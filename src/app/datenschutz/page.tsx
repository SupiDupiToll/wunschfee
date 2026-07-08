import type { Metadata } from "next";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  robots: { index: false, follow: false },
};

export default function DatenschutzPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <h1 className="font-serif text-3xl">Datenschutzerklärung</h1>

        <section className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="font-medium text-foreground">
            1. Übersicht der Verarbeitungen
          </h2>
          <p>
            Diese Webseite stellt einen Dienst zum Erstellen und Teilen von
            Geschenkelisten bereit. Im Folgenden wird detailliert aufgeführt,
            welche Dienste und Komponenten bei der Nutzung Daten verarbeiten.
          </p>

          <h2 className="font-medium text-foreground">
            2. Hosting & Infrastruktur
          </h2>
          <p>
            <strong>Vercel Inc.</strong> (440 N Barranca Ave #4133, Covina, CA
            91723, USA)
          </p>
          <p>
            Diese Webseite wird bei Vercel gehostet. Beim Besuch der Seite
            werden Verbindungsdaten wie IP-Adresse, Browsertyp, Betriebssystem,
            Referrer-URL und Zugriffszeit automatisiert verarbeitet. Vercel
            verarbeitet diese Daten als Auftragsverarbeiter. Rechtsgrundlage:
            Art. 6 Abs. 1 lit. f DSGVO (Bereitstellung der Webseite).
          </p>
          <p>
            <strong>Neon Database (Neon Tech Inc.)</strong> (3000 El Camino
            Real, Building 4, Suite 200, Palo Alto, CA 94306, USA)
          </p>
          <p>
            Die Anwendungsdaten (Nutzer-IDs, Geschenkelisten, Artikel) werden in
            einer PostgreSQL-Datenbank bei Neon gespeichert. Neon verarbeitet
            diese Daten als Auftragsverarbeiter. Rechtsgrundlage: Art. 6 Abs. 1
            lit. b DSGVO (Erfüllung des Dienstes).
          </p>

          <h2 className="font-medium text-foreground">3. Authentifizierung</h2>
          <p>
            <strong>Hexclave</strong>
          </p>
          <p>
            Für die Registrierung und Anmeldung nutzen wir Hexclave. Es werden
            keine Passwörter auf unserem Server gespeichert. Hexclave
            verarbeitet E-Mail-Adresse und Authentifizierungsdaten. Details zur
            Datenverarbeitung durch Hexclave finden sich in deren
            Datenschutzerklärung unter{" "}
            <a
              href="https://www.hexclave.com/privacy"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              hexclave.com/privacy
            </a>
            . Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
          </p>

          <h2 className="font-medium text-foreground">
            4. Amazon Partnerprogramm (Affiliate)
          </h2>
          <p>
            Wir nehmen am Amazon EU-Partnerprogramm (Amazon.de) teil. Wenn du
            einen mit einem Einkaufswagen 🛒 gekennzeichneten Link zu Amazon
            anklickst und anschließend ein Produkt kaufst, setzt Amazon einen
            Cookie auf deinem Gerät, um die Provision abrechnen zu können. Dabei
            wird Amazon mitgeteilt, dass du den Link auf unserer Seite geklickt
            hast. Wir haben keinen Zugriff auf die von Amazon erhobenen Daten.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (Wirtschaftliches
            Interesse).
          </p>

          <h2 className="font-medium text-foreground">
            5. Externe Produkterkennung (Scraping)
          </h2>
          <p>
            Wenn du einen Amazon-Produktlink eingibst, versucht die Webseite
            automatisch, Produktinformationen (Titel, Preis, Bild) zu ermitteln.
            Dabei können folgende Dienste angefragt werden:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>api.allorigins.win</strong> – Ein CORS-Proxy zur
              Weiterleitung der Anfrage an Amazon. Es werden keine
              personenbezogenen Daten übermittelt.
            </li>
            <li>
              <strong>corsproxy.io</strong> – Ein weiterer CORS-Proxy als
              Fallback. Auch hier werden keine personenbezogenen Daten
              gespeichert.
            </li>
          </ul>
          <p>
            Die übermittelte Produkt-URL dient ausschließlich der Erkennung des
            Artikels und wird nicht zu anderen Zwecken genutzt. Rechtsgrundlage:
            Art. 6 Abs. 1 lit. f DSGVO (Bereitstellung der Funktion).
          </p>

          <h2 className="font-medium text-foreground">6. Cookies</h2>
          <p>
            Diese Webseite verwendet ausschließlich technisch notwendige
            Cookies:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Session-Cookies</strong> – Werden von Hexclave zur
              Aufrechterhaltung der Authentifizierung gesetzt. Ohne diese
              Cookies ist die Nutzung des Dienstes (Erstellen und Verwalten von
              Listen) nicht möglich.
            </li>
          </ul>
          <p>
            Es werden keine Tracking-Cookies, Analyse-Cookies oder Werbe-Cookies
            gesetzt. Die Cookie-Speicherung erfolgt auf Basis von Art. 6 Abs. 1
            lit. f DSGVO bzw. § 25 Abs. 2 TTDSG.
          </p>

          <h2 className="font-medium text-foreground">
            7. Erhobene Daten im Dienst
          </h2>
          <p>Bei der Nutzung des Dienstes werden folgende Daten gespeichert:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Benutzerkennung (von Hexclave bereitgestellt, keine E-Mail)</li>
            <li>Titel, Name und Nachricht der Geschenkeliste</li>
            <li>Produktinformationen (URL, Titel, Preis, Bild-URL)</li>
            <li>Reservierungsstatus und Name der reservierenden Person</li>
          </ul>
          <p>
            Diese Daten werden ausschließlich zur Bereitstellung der
            Wunschlisten-Funktion verarbeitet. Eine Weitergabe an Dritte erfolgt
            nicht, außer an die oben genannten Auftragsverarbeiter.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
          </p>

          <h2 className="font-medium text-foreground">8. Speicherdauer</h2>
          <p>
            Die Daten werden gelöscht, sobald der Zweck ihrer Erhebung entfällt,
            spätestens mit Löschung der Geschenkeliste durch den Nutzer. Darüber
            hinaus werden Daten nur aufbewahrt, wenn gesetzliche
            Aufbewahrungspflichten bestehen (z. B. steuerliche
            Aufzeichnungspflichten).
          </p>

          <h2 className="font-medium text-foreground">
            9. Rechte der betroffenen Person
          </h2>
          <p>Du hast jederzeit das Recht auf:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
          <p>
            Zur Ausübung deiner Rechte wende dich bitte an die oben genannte
            E-Mail-Adresse. Du hast außerdem das Recht, bei der zuständigen
            Aufsichtsbehörde Beschwerde einzulegen.
          </p>

          <h2 className="font-medium text-foreground">
            10. Drittlandübermittlung
          </h2>
          <p>
            Einige der eingesetzten Dienste (Vercel, Neon, Hexclave) haben ihren
            Sitz in den USA. Für diese Dienste bestehen
            Angemessenheitsbeschlüsse (EU-US Data Privacy Framework) bzw. wurden
            EU-Standardvertragsklauseln abgeschlossen, um ein angemessenes
            Datenschutzniveau sicherzustellen.
          </p>

          <h2 className="font-medium text-foreground">
            11. Änderungen dieser Datenschutzerklärung
          </h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung bei Änderungen des
            Dienstes oder der Rechtslage anzupassen. Die jeweils aktuelle
            Version ist jederzeit unter dieser URL abrufbar.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
