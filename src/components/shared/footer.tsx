import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-8 pb-20 text-center text-sm text-muted-foreground">
      <p className="mb-2">
        Mit 🎁 gemacht – damit keine Geschenke mehr doppelt gekauft werden.
      </p>
      <p className="mb-3 text-[0.7rem] leading-relaxed text-muted-foreground/70">
        Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.
        Die mit einem Einkaufswagen 🛒 verlinkten Produkte können
        Affiliate-Links enthalten.
      </p>
      <nav className="flex justify-center gap-4 text-xs">
        <Link
          href="/blog"
          className="text-muted-foreground/60 underline-offset-2 hover:underline"
        >
          Blog
        </Link>
        <a
          data-impressum-popup
          className="cursor-pointer text-muted-foreground/60 underline-offset-2 hover:underline"
        >
          Impressum
        </a>
        <Link
          href="/datenschutz"
          className="text-muted-foreground/60 underline-offset-2 hover:underline"
        >
          Datenschutz
        </Link>
      </nav>
    </footer>
  );
}
