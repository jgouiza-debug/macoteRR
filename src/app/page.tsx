import type { Metadata } from "next";
import { HomePage } from "@/components/marketing/HomePage";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "MaCote — Ta cote R, sur ton écran d'accueil" },
  description:
    "Suis ta cote R, vois ce que tes programmes cibles exigent, et trouve les bourses auxquelles tu es admissible — gratuit, pour les étudiants de cégep.",
  alternates: {
    canonical: "/",
    languages: { fr: "/", en: "/en" },
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MaCote",
  applicationCategory: "EducationApplication",
  operatingSystem: "iOS, Android, Web",
  url: SITE_URL,
  offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  description:
    "Suis ta cote R, vois ce que tes programmes cibles exigent, et trouve les bourses auxquelles tu es admissible.",
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <HomePage locale="fr" />
    </>
  );
}
