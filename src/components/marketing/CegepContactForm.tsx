"use client";

import { useState, type FormEvent } from "react";
import type { PourLesCegepsContactLabels } from "@/content/pour-les-cegeps";

// TODO: placeholder contact address — replace with the real one before launch.
const CONTACT_EMAIL = "pilotes@macote.xyz";

/**
 * No backend exists for this static site, so the "submit" is a mailto: link built from the
 * field values and handed to the browser — it opens the visitor's own mail client with a
 * pre-filled draft; nothing is transmitted from this page itself.
 */
export function CegepContactForm({ labels }: { labels: PourLesCegepsContactLabels }) {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const subject = `${labels.subjectPrefix} ${institution}`.trim();
    const body = [
      `${labels.nameLabel}: ${name}`,
      `${labels.institutionLabel}: ${institution}`,
      `${labels.emailLabel}: ${email}`,
      "",
      message,
    ].join("\n");

    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-4 rounded-[3px] border border-border bg-paper p-4 sm:p-6">
      <TextField
        id="cegep-contact-name"
        label={labels.nameLabel}
        placeholder={labels.namePlaceholder}
        type="text"
        autoComplete="name"
        value={name}
        onChange={setName}
      />
      <TextField
        id="cegep-contact-institution"
        label={labels.institutionLabel}
        placeholder={labels.institutionPlaceholder}
        type="text"
        autoComplete="organization"
        value={institution}
        onChange={setInstitution}
      />
      <TextField
        id="cegep-contact-email"
        label={labels.emailLabel}
        placeholder={labels.emailPlaceholder}
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
      />

      <label htmlFor="cegep-contact-message" className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-secondary">{labels.messageLabel}</span>
        <textarea
          id="cegep-contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={labels.messagePlaceholder}
          rows={4}
          className="w-full resize-none rounded-[3px] border border-ink/50 bg-chalk px-3.5 py-2.5 text-[15px] leading-relaxed text-ink transition-colors placeholder:text-secondary/70 focus:border-ultramarine"
        />
      </label>

      <button
        type="submit"
        className="mt-1 flex h-12 min-h-[48px] items-center justify-center self-start rounded-full bg-ultramarine px-6 text-[14px] font-semibold text-paper transition-[transform,background-color] hover:bg-pressed active:bg-pressed active:scale-[0.98]"
      >
        {labels.submitLabel}
      </button>

      <p className="text-[12.5px] leading-relaxed text-secondary">{labels.note}</p>
    </form>
  );
}

function TextField({
  id,
  label,
  placeholder,
  type,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "email";
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-secondary">{label}</span>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-[3px] border border-ink/50 bg-chalk px-3.5 text-[15px] text-ink transition-colors placeholder:text-secondary/70 focus:border-ultramarine"
      />
    </label>
  );
}
