const API_BASE = "https://api.brightdata.com";
const AMAZON_DATASET_ID = "gd_l7q7dkf244hwjntr0";

function getApiToken(): string | undefined {
  return typeof process !== "undefined"
    ? process.env.BRIGHTDATA_API_TOKEN
    : undefined;
}

interface AmazonProduct {
  title: string;
  main_image?: string;
  price?: number;
  currency?: string;
  url?: string;
}

export async function scrapeAmazonProduct(
  url: string,
): Promise<{
  title: string;
  imageUrl: string | null;
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

    const data: AmazonProduct[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const product = data[0];
    if (!product?.title) return null;

    return {
      title: product.title.slice(0, 500),
      imageUrl: product.main_image || null,
      price:
        product.price != null
          ? `${String(product.price).replace(".", ",")} ${product.currency || "€"}`
          : null,
    };
  } catch {
    return null;
  }
}
