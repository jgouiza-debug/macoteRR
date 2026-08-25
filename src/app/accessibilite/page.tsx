import { LegalPage } from "@/components/marketing/LegalPage";
import { ACCESSIBILITY_CONTENT } from "@/content/accessibilite";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = ACCESSIBILITY_CONTENT.fr;

export const metadata = marketingMetadata({
  locale: "fr",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/accessibilite",
});

export default function Page() {
  return <LegalPage locale="fr" path="/accessibilite" content={c} />;
}
