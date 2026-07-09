import * as cheerio from "cheerio";

export interface ScrapedData {
  title: string;
  imageUrl: string | null;
  images: string[];
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
    }
  }
  return null;
}

function parseJsonLdImages(html: string): string[] {
  const regex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const candidates = parsed["@type"] === "Product"
        ? [parsed]
        : parsed["@graph"]?.filter((i: Record<string, unknown>) => i["@type"] === "Product") || [];
      for (const product of candidates) {
        const image = product.image;
        if (Array.isArray(image)) {
          return image.filter((u: unknown) => typeof u === "string" && u.startsWith("http"));
        }
        if (typeof image === "string") {
          return [image];
        }
      }
    } catch {
    }
  }
  return [];
}

function isInstallmentPrice(text: string): boolean {
  return /\b(ab\s|monat|woche|raten?|pro\s+(monat|woche|jahr)|im\s+monat|monatlich|anzahlung)\b/i.test(text);
}

function parsePriceFromMeta(html: string): string | null {
  return html.match(/<meta[^>]+property="product:price:amount"[^>]+content="([^"]+)"/)?.[1]
    || null;
}

function isMainPriceSize(html: string, pos: number): boolean {
  const before = html.slice(Math.max(0, pos - 150), pos);
  return /data-a-size="[xl]+"/.test(before);
}

function parsePriceFromHtml(html: string): string | null {
  const offscreenRegex = /class="a-offscreen"[^>]*>([^<]+)</g;
  let m;
  while ((m = offscreenRegex.exec(html)) !== null) {
    const text = m[1].trim();
    if (!text || isInstallmentPrice(text)) continue;
    if (isMainPriceSize(html, m.index)) return text;
  }

  offscreenRegex.lastIndex = 0;
  while ((m = offscreenRegex.exec(html)) !== null) {
    const text = m[1].trim();
    if (text && !isInstallmentPrice(text)) return text;
  }

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

// Nur echte Produktbild-URLs von Amazon (keine Icons/Badges/Empfehlungen)
function isProductImage(url: string): boolean {
  return /\/images\/[ID]\//.test(url) && /\.(jpg|png|webp)(\?|$)/i.test(url);
}

/** Extrahiert NUR echte Produktbilder via Regex (robuster als DOM-Parsing) */
function parseImages(html: string): string[] {
  const images: string[] = [];

  // 1) JSON-LD structured data
  images.push(...parseJsonLdImages(html));

  // 2) Alle data-a-hires-Attribute (Amazon's High-Res-Thumbnails)
  const hiresRegex = /data-a-hires="([^"]+)"/g;
  let m;
  while ((m = hiresRegex.exec(html)) !== null) {
    if (isProductImage(m[1])) images.push(m[1]);
  }

  // 3) og:image meta tag
  const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
  if (ogMatch && isProductImage(ogMatch[1])) images.push(ogMatch[1]);

  // 4) #landingImage – Hauptproduktbild
  const landingMatch = html.match(/id="landingImage"[^>]+src="([^"]+)"/);
  if (landingMatch && isProductImage(landingMatch[1])) images.push(landingMatch[1]);

  // 5) #imgTagWrapperId > img
  const wrapperMatch = html.match(/id="imgTagWrapperId"[^>]*>\s*<img[^>]+src="([^"]+)"/);
  if (wrapperMatch && isProductImage(wrapperMatch[1])) images.push(wrapperMatch[1]);

  // 6) Alle img[src] innerhalb von #altImages (Thumbnails → Normalisierung macht High-Res draus)
  const altSection = html.match(/id="altImages"[\s\S]{0,5000}/i);
  if (altSection) {
    const imgRegex = /<img[^>]+src="([^"]+)"/g;
    let im;
    while ((im = imgRegex.exec(altSection[0])) !== null) {
      if (isProductImage(im[1])) images.push(im[1]);
    }
  }

  // Normalisieren + Deduplizieren
  const seen = new Map<string, string>();
  for (const url of images) {
    if (!isProductImage(url)) continue;

    // Größen-Suffix entfernen → Amazon liefert volle Auflösung
    const highRes = url.replace(/\._[A-Z]{2}\d+(?:,\d+)?_[^/]*\.(jpg|png|webp)$/i, ".$1");

    if (!seen.has(highRes)) {
      seen.set(highRes, highRes);
    }
  }

  return [...seen.values()];
}

function formatPrice(price: string): string {
  const cleaned = price.replace(/[^\d.,]/g, "");
  if (cleaned.includes(",")) return `${cleaned} €`;
  if (cleaned.includes(".")) return `${cleaned.replace(".", ",")} €`;
  return `${cleaned} €`;
}

export function parseHtml(html: string): ScrapedData | null {
  const title = parseTitle(html);
  if (!title || title.length < 2) return null;

  const cleanTitle = title.replace(/ : [A-Za-z0-9.-]+\.[a-z]+: .+$/, "").trim();

  const jsonldPrice = parseJsonLdPrice(html);
  const allImages = parseImages(html);

  const imageUrl = allImages.length > 0 ? allImages[0] : null;

  const price = jsonldPrice
    || parsePriceFromMeta(html)
    || parsePriceFromHtml(html)
    || null;

  const formattedPrice = price ? formatPrice(price) : null;

  return {
    title: cleanTitle.slice(0, 500),
    imageUrl,
    images: allImages,
    price: formattedPrice,
  };
}
