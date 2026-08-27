"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/app-shell/Footer";
import { MENTIONS_LEGALES_CONTENT } from "@/content/mentions-legales";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function MentionsLegalesPage() {
  const { locale } = useLocale();
  const c = MENTIONS_LEGALES_CONTENT[locale];

  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <Header />

      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-[800px]">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ultramarine hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ultramarine/[0.08] text-ultramarine">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-ink md:text-[32px]">
                {c.title}
              </h1>
              <p className="mt-1 text-[14px] text-ink/60">{c.intro}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {c.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="rounded-xl border border-ink/10 bg-paper p-5 shadow-card"
              >
                <h2 className="font-display text-[17px] font-bold text-ink">
                  {section.title}
                </h2>
                <div className="mt-3 flex flex-col gap-3 text-[13.5px] leading-relaxed text-ink/75">
                  {section.body.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
