import type { MetadataRoute } from "next";
import { db } from "@/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wunschfee.sdtoll.de";

  const lists = await db.giftList.findMany({
    where: {
      isArchived: false,
    },
    select: { slug: true, updatedAt: true },
  });

  const listPages = lists.map((list) => ({
    url: `${siteUrl}/liste/${list.slug}`,
    lastModified: list.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    ...listPages,
  ];
}
