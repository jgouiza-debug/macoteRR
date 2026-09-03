import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

/**
 * What crawlers may index. Everything personal (the funnel, the dashboard, bursaries matched
 * to a profile, the profile itself, the counselor sheet), the dev harness and the API are
 * out. /programs and its detail pages are public, source-stamped catalogue facts and stay in.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/onboarding",
        "/dashboard",
        "/bursaries",
        "/profile",
        "/counselor-prep",
        "/dev",
        "/api",
        "/auth",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
