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

function parseImages(html: string): string[] {
  const $ = cheerio.load(html);
  const images: string[] = [];

  // 1) og:image meta tag
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage) images.push(ogImage);

  // 2) #landingImage
  const landingSrc = $("#landingImage").attr("src");
  if (landingSrc) images.push(landingSrc);

  // 3) #imgTagWrapperId > img
  const wrapperImg = $("#imgTagWrapperId img").first().attr("src");
  if (wrapperImg) images.push(wrapperImg);

  // 4) #altImages thumbnails (Amazon's thumbnail strip)
  //    These are the alternate product views
  $("#altImages").find("img, [data-a-hires]").each((_, el) => {
    const $el = $(el);
    const src = $el.attr("data-a-hires") || $el.attr("src");
    if (src && src.includes("m.media-amazon.com")) {
      images.push(src);
    }
  });

  // 5) Broad fallback: any img with Amazon CDN in the page
  //    Captures images that might be outside #altImages
  $("img[src*='m.media-amazon.com']").each((_, el) => {
    const src = $(el).attr("src");
    if (src) images.push(src);
  });

  // 6) Also check data-a-hires attributes anywhere in the page
  $("[data-a-hires*='m.media-amazon.com']").each((_, el) => {
    const src = $(el).attr("data-a-hires");
    if (src) images.push(src);
  });

  // Deduplicate: group by the base image ID (strip size variant)
  const seen = new Map<string, string>();
  for (const url of images) {
    // Normalize Amazon image URLs like:
    // .../I/61ABC._AC_SL1500_.jpg  →  .../I/61ABC.jpg
    const normalized = url
      .replace(/\._AC_.*?\.jpg$/i, ".jpg")
      .replace(/\._SL\d+_\.jpg$/i, ".jpg")
      .replace(/\._SY\d+_\.jpg$/i, ".jpg")
      .replace(/\._UX\d+_\.jpg$/i, ".jpg")
      .replace(/\._SX\d+_\.jpg$/i, ".jpg");

    if (!seen.has(normalized)) {
      seen.set(normalized, url);
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
  const jsonldImages = parseJsonLdImages(html);
  const htmlImages = parseImages(html);

  const allImages = [...new Set([...jsonldImages, ...htmlImages])];

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
