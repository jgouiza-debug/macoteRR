import type { Metadata } from "next";

/** Public catalogue: indexable, unlike the rest of the (app) group. */
export const metadata: Metadata = {
  title: "Programmes universitaires",
  robots: { index: true, follow: true },
};

export default function ProgramsLayout({ children }: LayoutProps<"/programs">) {
  return children;
}
