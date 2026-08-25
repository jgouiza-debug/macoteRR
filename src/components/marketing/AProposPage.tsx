/* TODO: replace the [Ton nom]/[your name] placeholders below with the real founder's name,
   cégep, and personal story before this page goes live. */

import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { InstallBar } from "./InstallBar";
import { SetHtmlLang } from "./SetHtmlLang";
import { A_PROPOS_CONTENT } from "@/content/a-propos";
import { mt } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

export function AProposPage({ locale }: { locale: Locale }) {
  const c = A_PROPOS_CONTENT[locale];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk text-ink">
      {locale === "en" && <SetHtmlLang lang="en" />}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ultramarine focus:px-4 focus:py-2 focus:text-paper"
      >
        {mt(locale, "mkt.skipToContent")}
      </a>
      <SiteHeader locale={locale} path="/a-propos" />

      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-3 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-[720px]">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[42px]">
            {c.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-secondary">{c.intro}</p>

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

            <section id="derriere-l-app" className="scroll-mt-20">
              <h2 className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">
                {c.identity.heading}
              </h2>
              <div className="mt-3 rounded-[3px] border border-border bg-paper p-4">
                <div className="flex items-center gap-4">
                  <div
                    aria-hidden="true"
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[3px] border border-border font-display text-[20px] font-bold text-secondary"
                  >
                    ?
                  </div>
                  <div>
                    <p className="font-display text-[18px] font-bold leading-tight text-ink">{c.identity.name}</p>
                    <p className="mt-0.5 text-[13.5px] text-secondary">{c.identity.roleLabel}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-hairline pt-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-secondary">
                    {c.identity.cegepLabel}
                  </p>
                  <p className="mt-1 text-[15px] text-ink">{c.identity.cegep}</p>
                </div>
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
