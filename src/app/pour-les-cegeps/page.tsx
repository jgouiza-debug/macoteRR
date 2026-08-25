import type { Metadata } from "next";
import { PourLesCegepsPage } from "@/components/marketing/PourLesCegepsPage";
import { POUR_LES_CEGEPS_CONTENT } from "@/content/pour-les-cegeps";

const c = POUR_LES_CEGEPS_CONTENT.fr;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/pour-les-cegeps",
    languages: { fr: "/pour-les-cegeps", en: "/en/pour-les-cegeps" },
  },
};

export default function Page() {
  return <PourLesCegepsPage locale="fr" />;
}
