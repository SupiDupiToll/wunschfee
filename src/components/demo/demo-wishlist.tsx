"use client";

import { ListHero } from "@/components/liste/list-hero";
import { DemoGiftCard } from "./demo-gift-card";
import { DemoNote } from "./demo-note";
import type { GiftList, GiftItem } from "@/db/schema";

interface DemoWishlistProps {
  list: GiftList;
  items: GiftItem[];
}

export function DemoWishlist({ list, items }: DemoWishlistProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <ListHero list={list} showShare={false} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 pb-20">
        <DemoNote text="So sehen Freunde & Familie deine Wunschliste – Reservierungen inklusive." />
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <DemoGiftCard key={item.id} item={item} isOwner={false} />
          ))}
        </div>
      </main>
    </div>
  );
}
