import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { PRIVACY_CONTENT } from "@/content/confidentialite";

const c = PRIVACY_CONTENT.en;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/en/confidentialite",
    languages: { fr: "/confidentialite", en: "/en/confidentialite" },
  },
};

export default function Page() {
  return <LegalPage locale="en" path="/confidentialite" content={c} />;
}
