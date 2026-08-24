import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { IosInstallGuide } from "@/components/pwa/IosInstallGuide";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "MaCote",
    template: "MaCote - %s",
  },
  description:
    "Suis ta cote R, vois ce que tes programmes cibles exigent, et trouve les bourses auxquelles tu es admissible — gratuit, pour les étudiants de cégep.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MaCote",
  },
  manifest: "/manifest.webmanifest",
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
      <head>
        {/* Critical boot inline style to eliminate flash of unstyled content during cold paint */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { --font-display: ${bricolage.style.fontFamily}, ui-sans-serif, system-ui; --font-sans: ${instrument.style.fontFamily}, ui-sans-serif, system-ui; }
              body { background-color: #e7e9e0; color: #17181a; margin: 0; }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-chalk text-ink">
        <LocaleProvider>
          {children}
          <IosInstallGuide />
        </LocaleProvider>
      </body>
    </html>
  );
}
