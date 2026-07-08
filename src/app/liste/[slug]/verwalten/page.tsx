import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { getListBySlug } from "@/actions/list";
import { hexclaveServerApp } from "@/hexclave/server";
import { ListHero } from "@/components/liste/list-hero";
import { GiftCard } from "@/components/liste/gift-card";
import { EmptyItems } from "@/components/liste/empty-items";
import { AddItemForm } from "@/components/liste/add-item-form";
import { ManageListSettings } from "@/components/liste/manage-list-settings";
import { PromoBanner } from "@/components/liste/promo-banner";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/shared/footer";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ManageListPage({ params }: Props) {
  const { slug } = await params;
  const list = await getListBySlug(slug);

  if (!list) notFound();

  const user = await hexclaveServerApp.getUser();
  if (!user || user.id !== list.userId) {
    redirect(`/liste/${slug}`);
  }

  const items = await db.giftItem.findMany({
    where: { listId: list.id },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <ListHero list={list} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8 pb-20">
        <Link
          href="/dashboard"
          className="-mt-2 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück zur Übersicht
        </Link>

        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">
            Geschenke ({items.length})
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/liste/${slug}/einladung`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-muted"
            >
              <Mail className="h-4 w-4" />
              Einladung
            </Link>
            <ManageListSettings list={list} />
          </div>
        </div>

        <Suspense>
          <AddItemForm listId={list.id} />
        </Suspense>

        {items.length === 0 ? (
          <EmptyItems isOwner={true} />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <GiftCard
                key={item.id}
                item={item}
                list={list}
                isOwner={true}
              />
            ))}
          </div>
        )}

      </main>
      <PromoBanner />
      <Footer />
    </div>
  );
}
