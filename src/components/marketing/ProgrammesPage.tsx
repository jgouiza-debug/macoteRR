import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { InstallBar } from "./InstallBar";
import { SetHtmlLang } from "./SetHtmlLang";
import { PROGRAMMES_CONTENT } from "@/content/programmes";
import { mt } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

export function ProgrammesPage({ locale }: { locale: Locale }) {
  const c = PROGRAMMES_CONTENT[locale];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk text-ink">
      {locale === "en" && <SetHtmlLang lang="en" />}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ultramarine focus:px-4 focus:py-2 focus:text-paper"
      >
        {mt(locale, "mkt.skipToContent")}
      </a>
      <SiteHeader locale={locale} path="/programmes" />

      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-3 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-[720px]">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[42px]">
            {c.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-secondary">{c.intro}</p>

          {/* Illustrative mockup standing in for a screenshot — real figures (UdeM Droit,
              sourced in src/lib/sample-data.ts), not a live capture of the app. */}
          <div className="mt-6 rounded-[3px] border border-border bg-paper p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
              {c.mockup.label}
            </p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-[16px] font-semibold text-ink">{c.mockup.programName}</p>
                <p className="text-[13px] text-secondary">{c.mockup.institution}</p>
              </div>
              <span className="flex-shrink-0 rounded-full bg-ultramarine/10 px-3 py-1 text-[12px] font-semibold text-ultramarine">
                {c.mockup.statusLabel}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-hairline pt-3">
              <div>
                <p className="font-display text-[22px] font-bold tabular-nums text-ink">
                  {c.mockup.rangeLabel}
                </p>
                <p className="text-[12px] text-secondary">{c.mockup.rangeCaption}</p>
              </div>
              <p className="text-[13px] text-secondary">{c.mockup.scoreCaption}</p>
            </div>
          </div>

          <nav aria-label={c.tocTitle} className="mt-6 rounded-[3px] border border-border bg-paper p-4">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-secondary">{c.tocTitle}</p>
            <ol className="mt-3 flex list-none flex-col gap-2 p-0">
              {c.sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-[14.5px] text-ink transition-colors hover:text-ultramarine">
                    {i + 1}. {s.heading}
                  </a>
                </li>
              ))}
              <li>
                <a href="#faq" className="text-[14.5px] text-ink transition-colors hover:text-ultramarine">
                  {c.sections.length + 1}. {c.faqTitle}
                </a>
              </li>
            </ol>
          </nav>

          <article className="mt-8 flex flex-col gap-8">
            {c.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-20">
                <h2 className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">
                  {s.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {s.body.map((p, i) => (
                    <p key={i} className="max-w-[68ch] text-[16px] leading-relaxed text-ink/85">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section id="faq" className="scroll-mt-20">
              <h2 className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">
                {c.faqTitle}
              </h2>
              <div className="mt-3 flex flex-col">
                {c.faq.map((item) => (
                  <div key={item.q} className="border-t border-hairline py-4 first:border-t-0">
                    <h3 className="text-[16px] font-semibold text-ink">{item.q}</h3>
                    <p className="mt-1.5 max-w-[68ch] text-[15px] leading-relaxed text-ink/80">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </div>
      </main>

      <SiteFooter locale={locale} />
      <InstallBar locale={locale} />
    </div>
  );
}
