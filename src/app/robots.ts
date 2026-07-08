import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wunschfee.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/liste/neu",
          "/handler/",
          "/*/verwalten",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
