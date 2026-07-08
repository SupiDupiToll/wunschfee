import Link from "next/link";

export function PromoBanner() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pt-6 pb-3">
      <Link
        href="/"
        className="mx-auto flex max-w-xs items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary shadow-sm transition-all hover:bg-primary/20 hover:shadow-md"
      >
        <span className="text-base">✨</span>
        Eigene Wunschliste erstellen
      </Link>
    </div>
  );
}
