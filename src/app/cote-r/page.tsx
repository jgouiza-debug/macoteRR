import { CoteRPage } from "@/components/marketing/CoteRPage";
import { COTE_R_CONTENT } from "@/content/cote-r";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = COTE_R_CONTENT.fr;

export const metadata = marketingMetadata({
  locale: "fr",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/cote-r",
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
      <CoteRPage locale="fr" />
    </>
  );
}
