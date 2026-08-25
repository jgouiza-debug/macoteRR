import type { Metadata } from "next";
import { BoursesPage } from "@/components/marketing/BoursesPage";
import { BOURSES_CONTENT } from "@/content/bourses";

const c = BOURSES_CONTENT.fr;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/bourses",
    languages: { fr: "/bourses", en: "/en/bourses" },
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: c.faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <BoursesPage locale="fr" />
    </>
  );
}
