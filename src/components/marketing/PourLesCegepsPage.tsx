import { SiteHeader } from "./SiteHeader";
import { SkipLink } from "./SkipLink";
import { SiteFooter } from "./SiteFooter";
import { InstallBar } from "./InstallBar";
import { SetHtmlLang } from "./SetHtmlLang";
import { CegepContactForm } from "./CegepContactForm";
import { renderTemplate } from "./PendingValue";
import { POUR_LES_CEGEPS_CONTENT } from "@/content/pour-les-cegeps";
import { mt } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

export function PourLesCegepsPage({ locale }: { locale: Locale }) {
  const c = POUR_LES_CEGEPS_CONTENT[locale];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk text-ink">
      {locale === "en" && <SetHtmlLang lang="en" />}
      <SkipLink locale={locale} />
      <SiteHeader locale={locale} path="/pour-les-cegeps" />

      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-3 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-[720px]">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[42px]">
            {c.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-secondary">{renderTemplate(c.intro, locale)}</p>
          {/* The page's one conversion is the pilot form, two sections down. One jump link under
              the intro, so a cégep staffer who came for it does not have to read to find it. */}
          <a
            href={`#${c.contact.id}`}
            className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-full bg-ultramarine px-6 text-[15px] font-semibold text-paper transition-colors hover:bg-pressed active:bg-pressed"
          >
            {mt(locale, "mkt.cegepsJumpToForm")}
          </a>

          <article className="mt-8 flex flex-col gap-8">
            {c.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-20">
                <h2 className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">
                  {s.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {s.body.map((p, i) => (
                    <p key={i} className="max-w-[68ch] text-[16px] leading-relaxed text-ink/85">
                      {renderTemplate(p, locale)}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section id={c.pilot.id} className="scroll-mt-20">
              <h2 className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">
                {c.pilot.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                <p className="max-w-[68ch] text-[16px] leading-relaxed text-ink/85">{renderTemplate(c.pilot.intro, locale)}</p>
                <ul className="flex flex-col gap-2.5">
                  {c.pilot.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink/85">
                      <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-moss" />
                      <span>{renderTemplate(point, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section id={c.contact.id} className="scroll-mt-20">
              <h2 className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">
                {c.contact.heading}
              </h2>
              <p className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-ink/85">{renderTemplate(c.contact.intro, locale)}</p>
              <CegepContactForm labels={c.contact} />
            </section>
          </article>
        </div>
      </main>

      <SiteFooter locale={locale} path="/pour-les-cegeps" />
      <InstallBar locale={locale} />
    </div>
  );
}
