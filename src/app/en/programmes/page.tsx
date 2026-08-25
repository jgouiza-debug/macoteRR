import type { Metadata } from "next";
import { ProgrammesPage } from "@/components/marketing/ProgrammesPage";
import { PROGRAMMES_CONTENT } from "@/content/programmes";

const c = PROGRAMMES_CONTENT.en;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/en/programmes",
    languages: { fr: "/programmes", en: "/en/programmes" },
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
      <ProgrammesPage locale="en" />
    </>
  );
}
