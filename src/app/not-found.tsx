import Link from "next/link";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

/**
 * A 404 keeps the site's chrome so the visitor can go somewhere useful, not only "home". The
 * route has no locale segment to read (see SetHtmlLang), so the copy stays bilingual and each
 * language gets its own home link.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk text-ink">
      <SiteHeader locale="fr" path="/404" />
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center justify-center gap-6 px-5 py-16 text-center">
        <p className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-ink">
          Page introuvable
          <span className="block text-[18px] font-semibold text-secondary">Page not found</span>
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex min-h-[48px] items-center justify-center rounded-full bg-ultramarine px-6 text-[14px] font-semibold text-paper transition-colors hover:bg-pressed active:bg-pressed"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/en"
            hrefLang="en"
            className="flex min-h-[48px] items-center justify-center rounded-full border border-ink px-6 text-[14px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            Back to home
          </Link>
        </div>
      </main>
      <SiteFooter locale="fr" path="/" />
    </div>
  );
}
