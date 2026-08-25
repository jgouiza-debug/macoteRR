import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { ACCESSIBILITY_CONTENT } from "@/content/accessibilite";

const c = ACCESSIBILITY_CONTENT.en;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/en/accessibilite",
    languages: { fr: "/accessibilite", en: "/en/accessibilite" },
  },
};

export default function Page() {
  return <LegalPage locale="en" path="/accessibilite" content={c} />;
}
