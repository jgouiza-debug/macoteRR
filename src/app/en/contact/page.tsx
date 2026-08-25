import type { Metadata } from "next";
import { ContactPage } from "@/components/marketing/ContactPage";
import { CONTACT_CONTENT } from "@/content/contact";

const c = CONTACT_CONTENT.en;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: {
    canonical: "/en/contact",
    languages: { fr: "/contact", en: "/en/contact" },
  },
};

export default function Page() {
  return <ContactPage locale="en" />;
}
