import type { Metadata } from "next";
import { HomePage } from "@/components/marketing/HomePage";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "MaCote — Your R-score, on your home screen" },
  description:
    "Track your R-score, see what your target programs actually require, and find bursaries you qualify for — free, for cégep students.",
  alternates: {
    canonical: "/en",
    languages: { fr: "/", en: "/en" },
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MaCote",
  applicationCategory: "EducationApplication",
  operatingSystem: "iOS, Android, Web",
  url: `${SITE_URL}/en`,
  offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  description:
    "Track your R-score, see what your target programs actually require, and find bursaries you qualify for.",
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <HomePage locale="en" />
    </>
  );
}
