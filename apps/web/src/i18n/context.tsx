'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Messages = Record<string, Record<string, string>>;

const locales: Record<string, Messages> = {};

const loadLocale = async (locale: string): Promise<Messages> => {
  if (locales[locale]) return locales[locale];
  try {
    const mod = await import(`./locales/${locale}.json`);
    locales[locale] = mod.default;
    return mod.default;
  } catch {
    const en = await import(`./locales/en.json`);
    return en.default;
  }
};

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, fallback?: string) => string;
  supportedLocales: { code: string; name: string; flag: string }[];
}

const supportedLocales = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (k: string) => k,
  supportedLocales,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState('en');
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('wisdomly-locale');
    if (saved && supportedLocales.some(l => l.code === saved)) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    loadLocale(locale).then(setMessages);
    localStorage.setItem('wisdomly-locale', locale);
  }, [locale]);

  const setLocale = useCallback((l: string) => {
    setLocaleState(l);
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    if (!messages) return fallback || key;
    const parts = key.split('.');
    let obj: any = messages;
    for (const part of parts) {
      if (obj && typeof obj === 'object' && part in obj) {
        obj = obj[part];
      } else {
        return fallback || key;
      }
    }
    return typeof obj === 'string' ? obj : fallback || key;
  }, [messages]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, supportedLocales }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
