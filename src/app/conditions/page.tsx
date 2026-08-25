import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { TERMS_CONTENT } from "@/content/conditions";

const c = TERMS_CONTENT.fr;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/conditions",
    languages: { fr: "/conditions", en: "/en/conditions" },
  },
};

export default function Page() {
  return <LegalPage locale="fr" path="/conditions" content={c} />;
}
