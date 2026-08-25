import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { InstallBar } from "./InstallBar";
import { SetHtmlLang } from "./SetHtmlLang";
import { BOURSES_CONTENT } from "@/content/bourses";
import { mt } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

export function BoursesPage({ locale }: { locale: Locale }) {
  const c = BOURSES_CONTENT[locale];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk text-ink">
      {locale === "en" && <SetHtmlLang lang="en" />}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ultramarine focus:px-4 focus:py-2 focus:text-paper"
      >
        {mt(locale, "mkt.skipToContent")}
      </a>
      <SiteHeader locale={locale} path="/bourses" />

      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-3 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-[720px]">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[42px]">
            {c.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-secondary">{c.intro}</p>

          <div className="mt-6 rounded-[3px] border border-border bg-paper p-4">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-secondary">
              {c.privacyLabel}
            </p>
            <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-ink/85">
              {c.privacyBody}
            </p>
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
