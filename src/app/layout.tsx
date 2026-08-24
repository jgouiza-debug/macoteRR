import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MaCote",
  description:
    "Suis ta cote R, vois ce que tes programmes cibles exigent, et trouve les bourses auxquelles tu es admissible — gratuit, pour les étudiants de cégep.",
};

export const viewport: Viewport = {
  themeColor: "#e7e9e0",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-chalk text-ink">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
