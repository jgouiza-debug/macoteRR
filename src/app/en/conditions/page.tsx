import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { TERMS_CONTENT } from "@/content/conditions";

const c = TERMS_CONTENT.en;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/en/conditions",
    languages: { fr: "/conditions", en: "/en/conditions" },
  },
};

export default function Page() {
  return <LegalPage locale="en" path="/conditions" content={c} />;
}
