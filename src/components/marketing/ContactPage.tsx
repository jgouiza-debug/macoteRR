"use client";

import { useState, type FormEvent } from "react";
import { SiteHeader } from "./SiteHeader";
import { SkipLink } from "./SkipLink";
import { SiteFooter } from "./SiteFooter";
import { InstallBar } from "./InstallBar";
import { SetHtmlLang } from "./SetHtmlLang";
import { PendingValue } from "./PendingValue";
import { CONTACT_CONTENT } from "@/content/contact";
import { SITE_CONFIG } from "@/lib/site-config";
import type { Locale } from "@/lib/i18n/dictionary";

export function ContactPage({ locale }: { locale: Locale }) {
  const c = CONTACT_CONTENT[locale];
  // Null until NEXT_PUBLIC_CONTACT_EMAIL is set: the page then shows an "à confirmer" chip
  // instead of an invented address, and the form cannot build a mailto: so submit is disabled.
  const contactEmail = SITE_CONFIG.contactEmail;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(c.form.topicOptions[0]?.value ?? "");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (contactEmail === null) return;

    const topicLabel = c.form.topicOptions.find((o) => o.value === topic)?.label ?? topic;
    const subject = `${c.form.subjectPrefix} — ${topicLabel}`;
    const body = [`${c.form.mailBodyName}: ${name}`, `${c.form.mailBodyEmail}: ${email}`, "", message].join("\n");

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk text-ink">
      {locale === "en" && <SetHtmlLang lang="en" />}
      <SkipLink locale={locale} />
      <SiteHeader locale={locale} path="/contact" />

      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-3 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-[720px]">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[42px]">
            {c.title}
          </h1>
          <p className="mt-4 max-w-[68ch] text-[17px] leading-relaxed text-secondary">{c.intro}</p>

          <div className="mt-6 rounded-[3px] border border-border bg-paper p-4">
            <p className="text-[13px] font-medium text-secondary">{c.directEmailLabel}</p>
            {contactEmail === null ? (
              <p className="mt-2">
                <PendingValue value={null} locale={locale} kind="email" />
              </p>
            ) : (
              <a
                href={`mailto:${contactEmail}`}
                className="mt-1 inline-flex min-h-[48px] items-center text-[16px] font-semibold text-ultramarine transition-colors hover:text-pressed"
              >
                {contactEmail}
              </a>
            )}
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
                  className="min-h-[48px] rounded-[3px] border border-ink/50 bg-paper px-4 py-3 text-[16px] text-ink transition-colors placeholder:text-secondary/60 focus:border-ultramarine"
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
                  className="min-h-[48px] rounded-[3px] border border-ink/50 bg-paper px-4 py-3 text-[16px] text-ink transition-colors placeholder:text-secondary/60 focus:border-ultramarine"
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
                  className="min-h-[48px] rounded-[3px] border border-ink/50 bg-paper px-4 py-3 text-[16px] text-ink transition-colors focus:border-ultramarine"
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
                  className="resize-y rounded-[3px] border border-ink/50 bg-paper px-4 py-3 text-[16px] leading-relaxed text-ink transition-colors placeholder:text-secondary/60 focus:border-ultramarine"
                />
              </div>

              <button
                type="submit"
                disabled={contactEmail === null}
                aria-describedby={contactEmail === null ? "contact-pending-address" : undefined}
                className="mt-2 flex h-12 min-h-[48px] items-center justify-center self-start rounded-full bg-ultramarine px-6 text-[15px] font-semibold text-paper transition-[transform,background-color] hover:bg-pressed active:bg-pressed active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-ultramarine disabled:active:scale-100"
              >
                {c.form.submitLabel}
              </button>

              {contactEmail === null && (
                <p id="contact-pending-address" className="text-[13px] font-medium leading-relaxed text-ember">
                  {c.pendingAddressNote}
                </p>
              )}

              {/* The form has no backend: submit hands a pre-filled draft to the mail client.
                  Say so next to the button, so "send" does not promise a server that isn't there. */}
              <p className="text-[12.5px] leading-relaxed text-secondary">{c.form.mailtoNote}</p>
            </form>
          </section>
        </div>
      </main>

      <SiteFooter locale={locale} path="/contact" />
      <InstallBar locale={locale} />
    </div>
  );
}
