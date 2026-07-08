"use client";

import { useState } from "react";
import { PasswordGate } from "./password-gate";
import { ListHero } from "./list-hero";
import { GiftCard } from "./gift-card";
import { EmptyItems } from "./empty-items";
import { Footer } from "../shared/footer";
import type { GiftList, GiftItem } from "@/db/schema";

interface PasswordProtectedListProps {
  list: GiftList;
  items: GiftItem[];
}

export function PasswordProtectedList({
  list,
  items,
}: PasswordProtectedListProps) {
  const [verified, setVerified] = useState(false);

  if (!verified) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <PasswordGate slug={list.slug} onSuccess={() => setVerified(true)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ListHero list={list} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {items.length === 0 ? (
          <EmptyItems isOwner={false} />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <GiftCard
                key={item.id}
                item={item}
                list={list}
                isOwner={false}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
