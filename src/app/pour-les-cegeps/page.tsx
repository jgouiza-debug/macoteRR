import { PourLesCegepsPage } from "@/components/marketing/PourLesCegepsPage";
import { POUR_LES_CEGEPS_CONTENT } from "@/content/pour-les-cegeps";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = POUR_LES_CEGEPS_CONTENT.fr;

export const metadata = marketingMetadata({
  locale: "fr",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/pour-les-cegeps",
});

export default function Page() {
  return <PourLesCegepsPage locale="fr" />;
}
