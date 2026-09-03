export type ContactTopicOption = {
  value: string;
  label: string;
};

export type ContactFormContent = {
  heading: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  topicLabel: string;
  topicOptions: ContactTopicOption[];
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  subjectPrefix: string;
  mailBodyName: string;
  mailBodyEmail: string;
};

export type ContactContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  directEmailLabel: string;
  /** Shown under the form while SITE_CONFIG.contactEmail is unset — no mailto: can be built then. */
  pendingAddressNote: string;
  form: ContactFormContent;
};

export const CONTACT_CONTENT: Record<"fr" | "en", ContactContent> = {
  fr: {
    metaTitle: "Contact — écris-nous | MaCote",
    metaDescription:
      "Une question, un bug, une idée? Écris-nous directement ou passe par le formulaire. Pas de chat en direct, pas de ligne de support, juste un email qui se rend à quelqu'un.",
    title: "Contacte-nous",
    intro:
      "Pas de chat en direct, pas de ligne de support. Juste un email qui se rend à quelqu'un qui va le lire. Dis-nous ce qui se passe — bug, question, idée — et on te répond dès qu'on peut.",
    directEmailLabel: "Tu préfères écrire directement?",
    pendingAddressNote: "Adresse de contact à confirmer avant le lancement.",
    form: {
      heading: "Envoie-nous un message",
      nameLabel: "Ton nom",
      namePlaceholder: "Ton nom",
      emailLabel: "Ton courriel",
      emailPlaceholder: "toi@exemple.com",
      topicLabel: "Sujet",
      topicOptions: [
        { value: "general", label: "Question générale" },
        { value: "bug", label: "Bug ou problème technique" },
        { value: "suggestion", label: "Suggestion" },
        { value: "autre", label: "Autre" },
      ],
      messageLabel: "Ton message",
      messagePlaceholder: "Qu'est-ce qui se passe?",
      submitLabel: "Envoyer",
      subjectPrefix: "Message depuis macote.xyz",
      mailBodyName: "Nom",
      mailBodyEmail: "Courriel",
    },
  },
  en: {
    metaTitle: "Contact — get in touch | MaCote",
    metaDescription:
      "A question, a bug, an idea? Email us directly or use the form below. No live chat, no support line, just an email that reaches an actual person.",
    title: "Get in touch",
    intro:
      "No live chat, no support line. Just an email that reaches an actual person who reads it. Tell us what's going on — a bug, a question, an idea — and we'll get back to you when we can.",
    directEmailLabel: "Would rather just email us?",
    pendingAddressNote: "Contact address to be confirmed before launch.",
    form: {
      heading: "Send us a message",
      nameLabel: "Your name",
      namePlaceholder: "Your name",
      emailLabel: "Your email",
      emailPlaceholder: "you@example.com",
      topicLabel: "Topic",
      topicOptions: [
        { value: "general", label: "General question" },
        { value: "bug", label: "Bug or technical issue" },
        { value: "suggestion", label: "Suggestion" },
        { value: "autre", label: "Something else" },
      ],
      messageLabel: "Your message",
      messagePlaceholder: "What's going on?",
      submitLabel: "Send",
      subjectPrefix: "Message from macote.xyz",
      mailBodyName: "Name",
      mailBodyEmail: "Email",
    },
  },
};
