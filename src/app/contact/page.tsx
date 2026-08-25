import { ContactPage } from "@/components/marketing/ContactPage";
import { CONTACT_CONTENT } from "@/content/contact";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = CONTACT_CONTENT.fr;

export const metadata = marketingMetadata({
  locale: "fr",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/contact",
});

export default function Page() {
  return <ContactPage locale="fr" />;
}
