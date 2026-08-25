import { LegalPage } from "@/components/marketing/LegalPage";
import { TERMS_CONTENT } from "@/content/conditions";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = TERMS_CONTENT.en;

export const metadata = marketingMetadata({
  locale: "en",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/conditions",
});

export default function Page() {
  return <LegalPage locale="en" path="/conditions" content={c} />;
}
