import { scrapeAmazonProduct } from "./brightdata";
import { parseHtml, type ScrapedData } from "./parse-html";

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://cors.eu.org/${encodeURIComponent(url)}`,
];

export function proxyImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (
    !url.includes("m.media-amazon.com") &&
    !url.includes("images-na.ssl-images-amazon.com")
  ) {
    return url;
  }
  return `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(url)}`;
}

export function proxyImages(urls: string[]): string[] {
  return urls.map((u) => proxyImageUrl(u)).filter((u): u is string => u !== null);
}

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

// Schnelle Vorschau: Titel + Bild(er) via Brightdata + CORS-Proxies
export async function fetchPreview(url: string): Promise<{ title: string; imageUrl: string | null; images: string[] } | null> {
  const cleanUrl = await cleanAmazonUrl(url);
  if (!isAmazonUrl(cleanUrl)) {
    const direct = await tryFetch(cleanUrl);
    if (direct) return { title: direct.title, imageUrl: direct.imageUrl, images: direct.images };
    return null;
  }

  // 1) BrightData Web Unblocker (volle HTML-Seite)
  const bright = await scrapeAmazonProduct(cleanUrl);
  if (bright) {
    return { title: bright.title, imageUrl: bright.imageUrl, images: bright.images };
  }

  // 2) Direkter Fetch
  const direct = await tryFetch(cleanUrl);
  if (direct) return { title: direct.title, imageUrl: direct.imageUrl, images: direct.images };

  // 3) CORS-Proxies als Fallback
  for (const proxy of CORS_PROXIES) {
    const result = await tryFetch(cleanUrl, proxy);
    if (result) return { title: result.title, imageUrl: result.imageUrl, images: result.images };
  }

  return null;
}

// Preis via Brightdata Web Unblocker
export async function fetchPrice(url: string): Promise<{ price: string | null; images: string[] } | null> {
  const cleanUrl = await cleanAmazonUrl(url);
  const product = await scrapeAmazonProduct(cleanUrl);
  if (!product) return null;
  return {
    price: product.price,
    images: proxyImages(product.images),
  };
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

async function tryFetch(url: string, proxy?: (url: string) => string): Promise<ScrapedData | null> {
  const target = proxy ? proxy(url) : url;
  try {
    const res = await fetch(target, {
      headers: proxy ? {} : {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
          + "AppleWebKit/537.36 (KHTML, like Gecko) "
          + "Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (html.length < 5000) return null;
    return parseHtml(html);
  } catch {
    return null;
  }
}

function isAmazonUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.includes("amazon") || hostname.includes("amzn");
  } catch {
    return false;
  }
}

export async function scrapeProductData(url: string): Promise<ScrapedData | null> {
  const cleanUrl = await cleanAmazonUrl(url);

  if (isAmazonUrl(cleanUrl)) {
    // 1) BrightData Web Unblocker (HTML via Proxy, geparst)
    const product = await scrapeAmazonProduct(cleanUrl);
    if (product) return product;
  }

  // 2) Direkter Fetch (HTML parsen)
  const direct = await tryFetch(cleanUrl);
  if (direct) return direct;

  // 3) CORS-Proxies als Fallback
  for (const proxy of CORS_PROXIES) {
    const result = await tryFetch(cleanUrl, proxy);
    if (result) return result;
  }

  return null;
}
