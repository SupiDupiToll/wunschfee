import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { getListBySlug } from "@/actions/list";
import { hexclaveServerApp } from "@/hexclave/server";
import { ListHero } from "@/components/liste/list-hero";
import { GiftCard } from "@/components/liste/gift-card";
import { EmptyItems } from "@/components/liste/empty-items";
import { PasswordProtectedList } from "@/components/liste/password-protected-list";
import { JsonLd } from "@/components/shared/json-ld";
import { PromoBanner } from "@/components/liste/promo-banner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/shared/footer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const list = await getListBySlug(slug);

  if (!list) return {};

  const title = `${list.honoreeName} – ${list.title}`;
  const description = list.message
    ? `${list.message.slice(0, 160)}`
    : `Geschenkeliste für ${list.honoreeName} – ${list.title}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} – Wunschfee`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicListPage({ params }: Props) {
  const { slug } = await params;
  const list = await getListBySlug(slug);

  if (!list) notFound();

  if (list.isArchived) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <div>
            <span className="text-5xl">📦</span>
            <h1 className="mt-4 font-serif text-2xl">
              Diese Liste ist archiviert
            </h1>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const user = await hexclaveServerApp.getUser();
  const isOwner = user?.id === list.userId;

  const items = await db.giftItem.findMany({
    where: { listId: list.id },
    orderBy: { sortOrder: "asc" },
  });

  if (list.accessType === "password" && !isOwner) {
    return (
      <div className="flex min-h-screen flex-col">
        <Suspense>
          <PasswordProtectedList list={list} items={items} />
        </Suspense>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {items.length > 0 && (
        <JsonLd
          schema={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: list.title,
            description: list.message || `Geschenkeliste für ${list.honoreeName}`,
            url: `https://wunschfee.app/liste/${list.slug}`,
            itemListElement: items.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: item.title,
                ...(item.imageUrl ? { image: item.imageUrl } : {}),
                ...(item.price
                  ? {
                      offers: {
                        "@type": "Offer",
                        price: item.price.replace(/[^\d,.]/g, "").replace(",", "."),
                        priceCurrency: "EUR",
                      },
                    }
                  : {}),
                ...(item.url ? { url: item.url } : {}),
              },
            })),
          }}
        />
      )}
      <div className="flex min-h-screen flex-col">
        <ListHero list={list} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 pb-20">
          {isOwner && (
            <Link
              href="/dashboard"
              className="mb-6 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Zurück zur Übersicht
            </Link>
          )}

          {items.length === 0 ? (
            <EmptyItems isOwner={isOwner} />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <GiftCard
                  key={item.id}
                  item={item}
                  list={list}
                  isOwner={isOwner}
                />
              ))}
            </div>
          )}

        </main>
        <PromoBanner />
        <Footer />
      </div>
    </>
  );
}
