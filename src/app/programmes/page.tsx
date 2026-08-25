import { ProgrammesPage } from "@/components/marketing/ProgrammesPage";
import { PROGRAMMES_CONTENT } from "@/content/programmes";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = PROGRAMMES_CONTENT.fr;

export const metadata = marketingMetadata({
  locale: "fr",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/programmes",
});

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
      <ProgrammesPage locale="fr" />
    </>
  );
}
