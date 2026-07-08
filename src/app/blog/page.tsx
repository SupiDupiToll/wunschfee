import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { blogPosts } from "@/lib/blog";
import { JsonLd } from "@/components/shared/json-ld";

export const metadata: Metadata = {
  title: "Blog – Tipps & Ideen für Wunschlisten und Geschenke",
  description:
    "Inspiration für deine Wunschliste: Geschenkideen zum Geburtstag, zur Hochzeit, zu Weihnachten und Tipps gegen doppelte Geschenke.",
  openGraph: {
    title: "Blog – Wunschfee",
    description:
      "Inspiration für deine Wunschliste: Geschenkideen und Tipps für die ganze Familie.",
  },
};

export default function BlogPage() {
  return (
    <>
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Wunschfee Blog",
          description:
            "Tipps & Ideen für Wunschlisten und Geschenke",
          url: "https://wunschfee.app/blog",
        }}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
          <h1 className="font-serif text-3xl">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Tipps, Ideen und Inspiration rund um Wunschlisten und Geschenke.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-xl border p-5 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <time className="text-xs text-muted-foreground">
                  {post.publishedAt} · {post.readingTime}
                </time>
                <h2 className="mt-2 font-serif text-lg font-medium group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
