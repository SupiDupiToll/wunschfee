import { parseHtml } from "./parse-html";

const API_BASE = "https://api.brightdata.com";

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
