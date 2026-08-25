import { AProposPage } from "@/components/marketing/AProposPage";
import { A_PROPOS_CONTENT } from "@/content/a-propos";
import { marketingMetadata } from "@/lib/i18n/marketing-metadata";

const c = A_PROPOS_CONTENT.en;

export const metadata = marketingMetadata({
  locale: "en",
  title: c.metaTitle,
  description: c.metaDescription,
  path: "/a-propos",
});

export default function Page() {
  return <AProposPage locale="en" />;
}
