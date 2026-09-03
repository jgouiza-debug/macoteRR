"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { DICTIONARY, type Locale, type TranslationKey } from "./dictionary";

const STORAGE_KEY = "macote.locale";
const DEFAULT_LOCALE: Locale = "fr";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "fr";
}

function readLocale(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

// The server has no localStorage, so it always renders the default. useSyncExternalStore
// reconciles the stored value after hydration without the cascading render a setState-in-effect
// would cause.
function serverLocale(): Locale {
  return DEFAULT_LOCALE;
}

function writeLocale(next: Locale) {
  window.localStorage.setItem(STORAGE_KEY, next);
  emit();
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, serverLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // `?lang=en` hands the locale across a boundary that has no other way to carry it: the
  // English marketing site pushing into the (path-less) funnel, or a shared link. It is read
  // once per page load and then dropped from the URL, so the stored preference stays the
  // source of truth afterwards.
  useEffect(() => {
    const url = new URL(window.location.href);
    const requested = url.searchParams.get("lang");
    if (!isLocale(requested)) return;
    if (requested !== readLocale()) writeLocale(requested);
    url.searchParams.delete("lang");
    window.history.replaceState(window.history.state, "", url.toString());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    writeLocale(next);
  }, []);

  const t = useCallback((key: TranslationKey) => DICTIONARY[locale][key], [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside a LocaleProvider");
  return context;
}
