import { LegalPage } from "@/components/marketing/LegalPage";
import { TERMS_CONTENT } from "@/content/conditions";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = TERMS_CONTENT.fr;

export const metadata = marketingMetadata({
  locale: "fr",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/conditions",
});

export default function Page() {
  return <LegalPage locale="fr" path="/conditions" content={c} />;
}
