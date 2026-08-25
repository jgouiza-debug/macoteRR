import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

const MARKETING_PATHS = [
  "/",
  "/cote-r",
  "/programmes",
  "/bourses",
  "/pour-les-cegeps",
  "/a-propos",
  "/contact",
  "/confidentialite",
  "/conditions",
  "/accessibilite",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return MARKETING_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: {
        fr: `${SITE_URL}${path}`,
        en: `${SITE_URL}/en${path === "/" ? "" : path}`,
      },
    },
  }));
}
