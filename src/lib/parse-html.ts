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
  const images: string[] = [];

  const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
  if (ogMatch?.[1]) images.push(ogMatch[1]);

  const landingMatch = html.match(/id="landingImage"[^>]+src="([^"]+)"/);
  if (landingMatch?.[1]) images.push(landingMatch[1]);

  const wrapperMatch = html.match(/id="imgTagWrapperId"[^>]*>\s*<img[^>]+src="([^"]+)"/);
  if (wrapperMatch?.[1]) images.push(wrapperMatch[1]);

  const altRegex = /id="altImages"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/i;
  const altMatch = html.match(altRegex);
  if (altMatch) {
    const srcRegex = /(?:data-a-hires|src)="([^"]*m\.media-amazon\.com[^"]*\.jpg[^"]*)"/gi;
    let sm;
    while ((sm = srcRegex.exec(altMatch[1])) !== null) {
      if (sm[1]) images.push(sm[1]);
    }
  }

  const seen = new Set<string>();
  return images.filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
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
