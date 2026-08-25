import { LegalPage } from "@/components/marketing/LegalPage";
import { PRIVACY_CONTENT } from "@/content/confidentialite";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = PRIVACY_CONTENT.fr;

export const metadata = marketingMetadata({
  locale: "fr",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/confidentialite",
});

export default function Page() {
  return <LegalPage locale="fr" path="/confidentialite" content={c} />;
}
