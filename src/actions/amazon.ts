"use server";

import { scrapeProductData, detectStore } from "@/lib/amazon";

export async function fetchProductData(url: string) {
  if (!url || !url.startsWith("http")) {
    return { error: "Bitte gib eine gültige URL ein." };
  }

  const data = await scrapeProductData(url);
  if (!data) {
    return {
      error:
        "Automatische Erkennung fehlgeschlagen. Bitte trage die Daten manuell ein.",
    };
  }

  const store = detectStore(url);

  return {
    title: data.title,
    imageUrl: data.imageUrl,
    price: data.price,
    store,
  };
}
