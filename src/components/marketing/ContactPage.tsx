"use client";

import { useState, type FormEvent } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { InstallBar } from "./InstallBar";
import { SetHtmlLang } from "./SetHtmlLang";
import { CONTACT_CONTENT } from "@/content/contact";
import { mt } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

const CONTACT_EMAIL = "bonjour@macote.xyz"; // TODO: placeholder contact address

export function ContactPage({ locale }: { locale: Locale }) {
  const c = CONTACT_CONTENT[locale];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(c.form.topicOptions[0]?.value ?? "");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const topicLabel = c.form.topicOptions.find((o) => o.value === topic)?.label ?? topic;
    const subject = `${c.form.subjectPrefix} — ${topicLabel}`;
    const body = [`${c.form.mailBodyName}: ${name}`, `${c.form.mailBodyEmail}: ${email}`, "", message].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk text-ink">
      {locale === "en" && <SetHtmlLang lang="en" />}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ultramarine focus:px-4 focus:py-2 focus:text-paper"
      >
        {mt(locale, "mkt.skipToContent")}
      </a>
      <SiteHeader locale={locale} path="/contact" />

      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-3 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-[720px]">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[42px]">
            {c.title}
          </h1>
          <p className="mt-4 max-w-[68ch] text-[17px] leading-relaxed text-secondary">{c.intro}</p>

          <div className="mt-6 rounded-[3px] border border-border bg-paper p-4">
            <p className="text-[13px] font-medium text-secondary">{c.directEmailLabel}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-1 inline-block text-[16px] font-semibold text-ultramarine transition-colors hover:text-pressed"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <section className="mt-8">
            <h2 className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">
              {c.form.heading}
            </h2>

            <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="contact-name" className="text-[13px] font-medium text-secondary">
                  {c.form.nameLabel}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={c.form.namePlaceholder}
                  className="rounded-[3px] border border-ink/50 bg-paper px-4 py-3 text-[16px] text-ink outline-none placeholder:text-secondary/60"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="contact-email" className="text-[13px] font-medium text-secondary">
                  {c.form.emailLabel}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={c.form.emailPlaceholder}
                  className="rounded-[3px] border border-ink/50 bg-paper px-4 py-3 text-[16px] text-ink outline-none placeholder:text-secondary/60"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="contact-topic" className="text-[13px] font-medium text-secondary">
                  {c.form.topicLabel}
                </label>
                <select
                  id="contact-topic"
                  name="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="rounded-[3px] border border-ink/50 bg-paper px-4 py-3 text-[16px] text-ink outline-none"
                >
                  {c.form.topicOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="contact-message" className="text-[13px] font-medium text-secondary">
                  {c.form.messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={c.form.messagePlaceholder}
                  className="resize-y rounded-[3px] border border-ink/50 bg-paper px-4 py-3 text-[16px] leading-relaxed text-ink outline-none placeholder:text-secondary/60"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex h-12 items-center justify-center self-start rounded-full bg-ultramarine px-6 text-[15px] font-semibold text-paper transition-colors hover:bg-pressed active:bg-pressed"
              >
                {c.form.submitLabel}
              </button>
            </form>
          </section>
        </div>
      </main>

      <SiteFooter locale={locale} />
      <InstallBar locale={locale} />
    </div>
  );
}
