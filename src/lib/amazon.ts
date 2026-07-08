const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
];

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

export function cleanAmazonUrl(url: string): string {
  try {
    const asin = extractAsin(url);
    if (asin) return `https://www.amazon.de/dp/${asin}`;
    const u = new URL(url);
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
    if (!hostname.includes("amazon")) return url;
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
      amazon: "Amazon", etsy: "Etsy", otto: "OTTO", zalando: "Zalando",
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

interface ScrapedData {
  title: string;
  imageUrl: string | null;
  price: string | null;
}

function parseJsonLd(html: string): { title?: string; image?: string; price?: string } | null {
  const match = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    const product = parsed["@type"] === "Product" ? parsed : undefined;
    if (!product) return null;
    const offer = product.offers?.["@type"] === "Offer" ? product.offers
      : Array.isArray(product.offers) ? product.offers[0]
      : undefined;
    return {
      title: product.name,
      image: product.image,
      price: offer?.price?.toString(),
    };
  } catch {
    return null;
  }
}

function parsePriceFromMeta(html: string): string | null {
  return html.match(/<meta[^>]+property="product:price:amount"[^>]+content="([^"]+)"/)?.[1]
    || null;
}

function parsePriceFromHtml(html: string): string | null {
  const blocks = html.matchAll(/class="a-price"[^>]*>([\s\S]*?)<\/span>\s*<\/span>\s*<\/span>/g);
  for (const block of blocks) {
    const w = block[0].match(/class="a-price-whole"[^>]*>(\d[\d.]*)/)?.[1];
    if (!w) continue;
    const f = block[0].match(/class="a-price-fraction"[^>]*>(\d+)/)?.[1];
    return f ? `${w},${f} €` : `${w} €`;
  }
  return null;
}

function parseTitle(html: string): string {
  return html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/)?.[1]
    || html.match(/<meta[^>]+name="title"[^>]+content="([^"]+)"/)?.[1]
    || html.match(/id="productTitle"[^>]*>([^<]+)</)?.[1]?.trim()
    || "";
}

function parseImage(html: string): string | null {
  return html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)?.[1]
    || html.match(/id="landingImage"[^>]+src="([^"]+)"/)?.[1]
    || html.match(/id="imgTagWrapperId"[^>]*>\s*<img[^>]+src="([^"]+)"/)?.[1]
    || null;
}

function parseHtml(html: string): ScrapedData | null {
  const title = parseTitle(html);
  if (!title || title.length < 2) return null;

  const cleanTitle = title.replace(/ : [A-Za-z0-9.-]+\.[a-z]+: .+$/, "").trim();

  // 1) JSON-LD (zuverlässigster Preis)
  const jsonld = parseJsonLd(html);
  const imageUrl = jsonld?.image || parseImage(html);

  const price = jsonld?.price
    || parsePriceFromMeta(html)
    || parsePriceFromHtml(html)
    || null;

  const formattedPrice = price
    ? (price.includes(",") || price.includes("€") ? price
        : price.includes(".") ? `${price.replace(".", ",")} €`
        : `${price} €`)
    : null;

  return {
    title: cleanTitle.slice(0, 500),
    imageUrl,
    price: formattedPrice,
  };
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

export async function scrapeProductData(url: string): Promise<ScrapedData | null> {
  const cleanUrl = cleanAmazonUrl(url);

  // 1) Direkter Fetch
  const direct = await tryFetch(cleanUrl);
  if (direct) return direct;

  // 2) CORS-Proxies als Fallback
  for (const proxy of CORS_PROXIES) {
    const result = await tryFetch(cleanUrl, proxy);
    if (result) return result;
  }

  return null;
}
