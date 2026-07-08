import Link from "next/link";
import { blogPosts } from "@/lib/blog";

const latestPosts = blogPosts.slice(0, 3);

export function BlogPreview() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="font-serif text-3xl">Tipps & Ideen</h2>
        <p className="mt-2 text-muted-foreground">
          Inspiration für Geschenke, Wunschlisten und besondere Anlässe.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {latestPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-xl border p-5 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <time className="text-xs text-muted-foreground">
              {post.publishedAt} · {post.readingTime}
            </time>
            <h3 className="mt-2 font-serif text-lg font-medium group-hover:text-primary">
              {post.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/blog"
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Alle Blogartikel anzeigen →
        </Link>
      </div>
    </section>
  );
}
