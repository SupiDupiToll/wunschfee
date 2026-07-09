"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { fetchPreview, fetchPrice, proxyImageUrl, detectStore } from "@/lib/amazon";

export async function fetchProductData(url: string) {
  if (!url || !url.startsWith("http")) {
    return { error: "Bitte gib eine gültige URL ein." };
  }

  const preview = await fetchPreview(url);
  if (!preview) {
    return {
      error:
        "Automatische Erkennung fehlgeschlagen. Bitte trage die Daten manuell ein.",
    };
  }

  const store = detectStore(url);

  return {
    title: preview.title,
    imageUrl: proxyImageUrl(preview.imageUrl),
    images: preview.images || [],
    store,
  };
}

export async function updateItemPrice(itemId: string, url: string): Promise<boolean> {
  const result = await fetchPrice(url);
  if (!result) return false;

  const item = await db.giftItem.findUnique({ where: { id: itemId } });
  if (!item) return false;

  await db.giftItem.update({
    where: { id: itemId },
    data: {
      price: result.price || item.price,
      ...(result.images.length > 0
        ? { images: JSON.stringify(result.images) }
        : {}),
    },
  });

  const list = await db.giftList.findUnique({ where: { id: item.listId } });
  if (list) {
    revalidatePath(`/liste/${list.slug}`);
    revalidatePath(`/liste/${list.slug}/verwalten`);
  }

  return true;
}
