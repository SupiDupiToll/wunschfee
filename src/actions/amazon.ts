"use server";

import { fetchPreview, proxyImageUrl, detectStore } from "@/lib/amazon";

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
    store,
  };
}


