import { LinkButton } from "@/components/shared/link-button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="font-serif text-8xl text-primary">404</div>
      <h1 className="font-serif text-2xl">Seite nicht gefunden</h1>
      <p className="text-muted-foreground">
        Diese Seite existiert nicht oder wurde gelöscht.
      </p>
      <LinkButton href="/">Zur Startseite</LinkButton>
    </div>
  );
}
