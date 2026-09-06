import { SiteHeader } from "./SiteHeader";
import { SkipLink } from "./SkipLink";
import { SiteFooter } from "./SiteFooter";
import { InstallBar } from "./InstallBar";
import { SetHtmlLang } from "./SetHtmlLang";
import { TableOfContents } from "./TableOfContents";
import { FaqList } from "./FaqList";
import { PROGRAMMES_CONTENT } from "@/content/programmes";
import type { Locale } from "@/lib/i18n/dictionary";

export function ProgrammesPage({ locale }: { locale: Locale }) {
  const c = PROGRAMMES_CONTENT[locale];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk text-ink">
      {locale === "en" && <SetHtmlLang lang="en" />}
      <SkipLink locale={locale} />
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
              <span className="flex-shrink-0 rounded-[3px] bg-ink/5 px-2 py-1 text-[12px] font-semibold text-secondary">
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

          <TableOfContents
            title={c.tocTitle}
            items={[
              ...c.sections.map((s) => ({ id: s.id, label: s.heading })),
              { id: "faq", label: c.faqTitle },
            ]}
          />

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
              <FaqList items={c.faq} />
            </section>
          </article>
        </div>
      </main>

      <SiteFooter locale={locale} path="/programmes" />
      <InstallBar locale={locale} />
    </div>
  );
}
