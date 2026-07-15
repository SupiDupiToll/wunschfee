export function extractAsin(url: string): string | null {
  const patterns = [
    /(?:dp|product|gp\/product)\/([A-Z0-9]{10})/i,
    /ASIN=([A-Z0-9]{10})/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function resolveAmznUrl(url: string): Promise<string> {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (!hostname.includes("amzn")) return url;
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.url;
  } catch {
    return url;
  }
}

export async function cleanAmazonUrl(url: string): Promise<string> {
  try {
    const resolved = await resolveAmznUrl(url);
    const asin = extractAsin(resolved);
    if (asin) return `https://www.amazon.de/dp/${asin}`;
    const u = new URL(resolved);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

export function addAffiliateTag(url: string): string {
  const tag =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG ||
          process.env.AMAZON_AFFILIATE_TAG)
      : undefined;
  if (!tag) return url;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (!hostname.includes("amazon") && !hostname.includes("amzn")) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}tag=${encodeURIComponent(tag)}`;
  } catch {
    return url;
  }
}

export function detectStore(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const stores: Record<string, string> = {
      amazon: "Amazon", amzn: "Amazon", etsy: "Etsy", otto: "OTTO", zalando: "Zalando",
      mediamarkt: "MediaMarkt", saturn: "Saturn", ebay: "eBay",
      ikea: "IKEA", douglas: "Douglas", aboutyou: "About You",
    };
    for (const [key, label] of Object.entries(stores)) {
      if (hostname.includes(key)) return label;
    }
    return hostname.replace(/^www\./, "").split(".")[0] || hostname;
  } catch {
    return "Unbekannter Shop";
  }
}


