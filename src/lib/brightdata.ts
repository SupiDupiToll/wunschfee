import { parseHtml } from "./parse-html";

const API_BASE = "https://api.brightdata.com";
const AMAZON_DATASET_ID = "gd_l7q7dkf244hwjntr0";

function getApiToken(): string | undefined {
  return typeof process !== "undefined"
    ? process.env.BRIGHTDATA_API_TOKEN
    : undefined;
}

function getUnlockerZone(): string {
  return (
    (typeof process !== "undefined"
      ? process.env.BRIGHTDATA_UNLOCKER_ZONE
      : undefined) || "web_unlocker"
  );
}

interface DatasetProduct {
  price?: number;
  currency?: string;
  title?: string;
  images?: string[];
}

async function pollSnapshot(
  snapshotId: string,
  token: string,
  retries = 10,
  delayMs = 3000,
): Promise<DatasetProduct[] | null> {
  for (let i = 0; i < retries; i++) {
    await new Promise((r) => setTimeout(r, delayMs));
    try {
      const res = await fetch(
        `${API_BASE}/datasets/v3/snapshots/${snapshotId}?format=json`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        if (res.status === 202) continue;
        return null;
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return null;
    }
  }
  return null;
}

export async function scrapeAmazonProduct(
  url: string,
): Promise<{
  title: string;
  imageUrl: string | null;
  images: string[];
  price: string | null;
} | null> {
  const token = getApiToken();
  if (!token) return null;

  try {
    const res = await fetch(
      `${API_BASE}/datasets/v3/scrape?dataset_id=${AMAZON_DATASET_ID}&include_errors=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: [{ url }] }),
      },
    );
    if (!res.ok) return null;

    const json = await res.json();

    let products: DatasetProduct[] = [];

    if (json?.snapshot_id) {
      products = (await pollSnapshot(json.snapshot_id, token)) || [];
    } else if (Array.isArray(json)) {
      products = json;
    } else if (json?.results && Array.isArray(json.results)) {
      products = json.results;
    }

    if (products.length === 0) return null;

    const product = products[0] as DatasetProduct;
    const price =
      product.price != null
        ? `${String(product.price).replace(".", ",")} ${product.currency || "€"}`
        : null;

    return {
      title: product.title || "",
      imageUrl: product.images?.[0] || null,
      images: product.images || [],
      price,
    };
  } catch {
    // Fallback: Web Unlocker (raw HTML) als Reserve
    try {
      const res = await fetch(`${API_BASE}/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zone: getUnlockerZone(),
          url,
          format: "raw",
        }),
      });
      if (!res.ok) return null;
      const html = await res.text();
      if (html.length < 5000) return null;
      return parseHtml(html);
    } catch {
      return null;
    }
  }
}

// Dataset API: für Hintergrund-Preisfetch (wird nur noch für Preis genutzt)
export async function scrapeAmazonPrice(
  url: string,
): Promise<string | null> {
  const token = getApiToken();
  if (!token) return null;

  try {
    const res = await fetch(
      `${API_BASE}/datasets/v3/scrape?dataset_id=${AMAZON_DATASET_ID}&include_errors=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: [{ url }] }),
      },
    );
    if (!res.ok) return null;

    const json = await res.json();

    let products: DatasetProduct[] = [];
    if (json?.snapshot_id) {
      products = (await pollSnapshot(json.snapshot_id, token)) || [];
    } else if (Array.isArray(json)) {
      products = json;
    } else if (json?.results && Array.isArray(json.results)) {
      products = json.results;
    }

    if (!Array.isArray(products) || products.length === 0) return null;

    const product = products[0];
    if (product.price == null) return null;

    return `${String(product.price).replace(".", ",")} ${product.currency || "€"}`;
  } catch {
    return null;
  }
}
