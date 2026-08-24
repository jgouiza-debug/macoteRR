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

function readLocale(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "fr" ? stored : DEFAULT_LOCALE;
}

// The server has no localStorage, so it always renders the default. useSyncExternalStore
// reconciles the stored value after hydration without the cascading render a setState-in-effect
// would cause.
function serverLocale(): Locale {
  return DEFAULT_LOCALE;
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

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    emit();
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
