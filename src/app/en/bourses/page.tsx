import { BoursesPage } from "@/components/marketing/BoursesPage";
import { BOURSES_CONTENT } from "@/content/bourses";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = BOURSES_CONTENT.en;

export const metadata = marketingMetadata({
  locale: "en",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/bourses",
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
      <BoursesPage locale="en" />
    </>
  );
}
