import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { blogPosts, type BlogPost } from "@/lib/blog";
import { JsonLd } from "@/components/shared/json-ld";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

function findPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: `${post.title} – Wunschfee`,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          author: {
            "@type": "Organization",
            name: "Wunschfee",
          },
          publisher: {
            "@type": "Organization",
            name: "Wunschfee",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            url: `https://wunschfee.app/blog/${post.slug}`,
          },
        }}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
          <Link
            href="/blog"
            className="mb-8 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Alle Artikel
          </Link>

          <article>
            <header>
              <time className="text-xs text-muted-foreground">
                {post.publishedAt} · {post.readingTime}
              </time>
              <h1 className="mt-2 font-serif text-2xl leading-tight sm:text-3xl">
                {post.title}
              </h1>
              <p className="mt-3 text-muted-foreground">
                {post.description}
              </p>
            </header>

            <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/90">
              {post.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-10 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center text-sm">
              <p>
                Auch eine Wunschliste erstellen?{" "}
                <Link
                  href="/"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Wunschfee
                </Link>{" "}
                – kostenlos & einfach.
              </p>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
