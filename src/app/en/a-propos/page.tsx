import type { Metadata } from "next";
import { AProposPage } from "@/components/marketing/AProposPage";
import { A_PROPOS_CONTENT } from "@/content/a-propos";

const c = A_PROPOS_CONTENT.en;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/en/a-propos",
    languages: { fr: "/a-propos", en: "/en/a-propos" },
  },
};

export default function Page() {
  return <AProposPage locale="en" />;
}
