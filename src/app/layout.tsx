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
  metadataBase: new URL("https://macote.xyz"),
  title: {
    default: "MaCote",
    template: "MaCote - %s",
  },
  description:
    "Suis ta cote R, vois ce que tes programmes cibles exigent, et trouve les bourses auxquelles tu es admissible — gratuit, pour les étudiants de cégep.",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
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
  openGraph: {
    title: "MaCote",
    description:
      "Suis ta cote R, vois ce que tes programmes cibles exigent, et trouve les bourses auxquelles tu es admissible.",
    locale: "fr_CA",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MaCote",
    images: ["/og.png"],
  },
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
