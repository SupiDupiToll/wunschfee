const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://cors.eu.org/${encodeURIComponent(url)}`,
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

function parseJsonLdPrice(html: string): string | null {
  const regex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const candidates = parsed["@type"] === "Product"
        ? [parsed]
        : parsed["@graph"]?.filter((i: Record<string, unknown>) => i["@type"] === "Product") || [];
      for (const product of candidates) {
        const offers = product.offers;
        const offer = offers?.["@type"] === "Offer"
          ? offers
          : Array.isArray(offers)
            ? offers.find((o: Record<string, unknown>) => o?.["@type"] === "Offer")
            : undefined;
        if (offer?.price) return offer.price.toString();
      }
    } catch {
      // skip malformed JSON-LD
    }
  }
  return null;
}

function parseJsonLdImage(html: string): string | null {
  const regex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const candidates = parsed["@type"] === "Product"
        ? [parsed]
        : parsed["@graph"]?.filter((i: Record<string, unknown>) => i["@type"] === "Product") || [];
      for (const product of candidates) {
        if (product.image) return typeof product.image === "string" ? product.image : null;
      }
    } catch {
      // skip
    }
  }
  return null;
}

function isInstallmentPrice(text: string): boolean {
  return /\b(ab\s|monat|woche|raten?|pro\s+(monat|woche|jahr)|im\s+monat|monatlich|anzahlung)\b/i.test(text);
}

function parsePriceFromMeta(html: string): string | null {
  return html.match(/<meta[^>]+property="product:price:amount"[^>]+content="([^"]+)"/)?.[1]
    || null;
}

function isMainPriceSize(html: string, pos: number): boolean {
  // Prüft ob innerhalb von 150 Zeichen vor pos ein data-a-size="l" oder "xl" steht
  const before = html.slice(Math.max(0, pos - 150), pos);
  return /data-a-size="[xl]+"/.test(before);
}

function parsePriceFromHtml(html: string): string | null {
  // 1) a-offscreen mit data-a-size="l"/"xl" (Hauptpreis)
  const offscreenRegex = /class="a-offscreen"[^>]*>([^<]+)</g;
  let m;
  while ((m = offscreenRegex.exec(html)) !== null) {
    const text = m[1].trim();
    if (!text || isInstallmentPrice(text)) continue;
    if (isMainPriceSize(html, m.index)) return text;
  }

  // 2) Fallback: irgendein a-offscreen (kein data-a-size="l" vorhanden)
  offscreenRegex.lastIndex = 0;
  while ((m = offscreenRegex.exec(html)) !== null) {
    const text = m[1].trim();
    if (text && !isInstallmentPrice(text)) return text;
  }

  // 3) a-price-whole/fraction mit data-a-size="l"/"xl"
  const wholeRegex = /class="a-price-whole"[^>]*>(\d[\d.]*)<\/span>/g;
  let wm;
  while ((wm = wholeRegex.exec(html)) !== null) {
    const ctx = html.slice(Math.max(0, wm.index - 200), wm.index);
    if (isInstallmentPrice(ctx)) continue;
    if (!isMainPriceSize(html, wm.index)) continue;
    const w = wm[1];
    const rest = html.slice(wm.index);
    const fm = rest.match(/class="a-price-fraction"[^>]*>(\d+)/);
    if (fm && fm.index !== undefined && fm.index < 500) {
      return `${w},${fm[1]} €`;
    }
    return `${w} €`;
  }

  // 4) Letzter Fallback: irgendein a-price-whole/fraction (Raten gefiltert)
  wholeRegex.lastIndex = 0;
  while ((wm = wholeRegex.exec(html)) !== null) {
    const ctx = html.slice(Math.max(0, wm.index - 200), wm.index);
    if (isInstallmentPrice(ctx)) continue;
    const w = wm[1];
    const rest = html.slice(wm.index);
    const fm = rest.match(/class="a-price-fraction"[^>]*>(\d+)/);
    if (fm && fm.index !== undefined && fm.index < 500) {
      return `${w},${fm[1]} €`;
    }
    return `${w} €`;
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

function formatPrice(price: string): string {
  const cleaned = price.replace(/[^\d.,]/g, "");
  if (cleaned.includes(",")) return `${cleaned} €`;
  if (cleaned.includes(".")) return `${cleaned.replace(".", ",")} €`;
  return `${cleaned} €`;
}

function parseHtml(html: string): ScrapedData | null {
  const title = parseTitle(html);
  if (!title || title.length < 2) return null;

  const cleanTitle = title.replace(/ : [A-Za-z0-9.-]+\.[a-z]+: .+$/, "").trim();

  // 1) JSON-LD (zuverlässigster Preis, nie Raten)
  const jsonldPrice = parseJsonLdPrice(html);
  const imageUrl = parseJsonLdImage(html) || parseImage(html);

  const price = jsonldPrice
    || parsePriceFromMeta(html)
    || parsePriceFromHtml(html)
    || null;

  const formattedPrice = price ? formatPrice(price) : null;

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
