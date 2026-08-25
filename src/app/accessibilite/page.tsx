import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { ACCESSIBILITY_CONTENT } from "@/content/accessibilite";

const c = ACCESSIBILITY_CONTENT.fr;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/accessibilite",
    languages: { fr: "/accessibilite", en: "/en/accessibilite" },
  },
};

export default function Page() {
  return <LegalPage locale="fr" path="/accessibilite" content={c} />;
}
