import { LegalPage } from "@/components/marketing/LegalPage";
import { ACCESSIBILITY_CONTENT } from "@/content/accessibilite";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = ACCESSIBILITY_CONTENT.en;

export const metadata = marketingMetadata({
  locale: "en",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/accessibilite",
});

export default function Page() {
  return <LegalPage locale="en" path="/accessibilite" content={c} />;
}
