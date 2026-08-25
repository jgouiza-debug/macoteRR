import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { PRIVACY_CONTENT } from "@/content/confidentialite";

const c = PRIVACY_CONTENT.fr;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/confidentialite",
    languages: { fr: "/confidentialite", en: "/en/confidentialite" },
  },
};

export default function Page() {
  return <LegalPage locale="fr" path="/confidentialite" content={c} />;
}
