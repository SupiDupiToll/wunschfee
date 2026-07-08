import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold">
      <span className="text-primary">🎁</span>
      <span>Wunschfee</span>
    </Link>
  );
}
