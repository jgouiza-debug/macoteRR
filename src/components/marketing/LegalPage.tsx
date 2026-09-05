import { SiteHeader } from "./SiteHeader";
import { SkipLink } from "./SkipLink";
import { SiteFooter } from "./SiteFooter";
import { SetHtmlLang } from "./SetHtmlLang";
import { renderTemplate } from "./PendingValue";
import { mt } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";
import type { LegalSection } from "@/content/confidentialite";

type LegalContent = {
  title: string;
  lastUpdated: string;
  summaryTitle: string;
  summaryPoints: string[];
  sections: LegalSection[];
};

/** Shared shell for /confidentialite, /conditions, /accessibilite — all three are draft
 *  legal documents with the same summary-box-then-sections shape. See LEGAL-REVIEW-NOTES.md. */
export function LegalPage({ locale, path, content }: { locale: Locale; path: string; content: LegalContent }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk text-ink">
      {locale === "en" && <SetHtmlLang lang="en" />}
      <SkipLink locale={locale} />
      <SiteHeader locale={locale} path={path} />

      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-3 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-[720px]">
          <div role="note" className="rounded-[3px] border border-dashed border-ember/50 bg-ember/[0.06] p-4 text-[13px] font-medium leading-relaxed text-ember">
            {mt(locale, "mkt.legalDraftBanner")}
          </div>

          <h1 className="mt-6 font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[38px]">
            {content.title}
          </h1>
          <p className="mt-2 text-[13px] text-secondary">{content.lastUpdated}</p>

          <div className="mt-6 rounded-[3px] border border-border bg-paper p-4">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-secondary">
              {content.summaryTitle}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {content.summaryPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14.5px] leading-snug text-ink">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#12795A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0" aria-hidden="true">
                    <polyline points="4 10 8 14 16 5" />
                  </svg>
                  <span>{renderTemplate(point, locale)}</span>
                </li>
              ))}
            </ul>
          </div>

          <article className="mt-8 flex flex-col gap-8">
            {content.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="font-display text-[20px] font-bold leading-tight tracking-[-0.02em] text-ink">
                  {s.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {s.body.map((p, i) => (
                    <p key={i} className="max-w-[68ch] text-[15.5px] leading-relaxed text-ink/85">
                      {renderTemplate(p, locale)}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>

      <SiteFooter locale={locale} path={path} />
    </div>
  );
}
