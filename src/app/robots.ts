import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wunschfee.sdtoll.de";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/liste/",
          "/handler/",
          "/*/verwalten",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
