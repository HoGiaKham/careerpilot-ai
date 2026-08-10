'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import viLocale from '@/locales/vi';
import enLocale from '@/locales/en';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof viLocale;
}

const translations: Record<Language, typeof viLocale> = {
  vi: viLocale,
  en: enLocale,
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'vi',
  setLang: () => {},
  t: viLocale,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('vi');

  useEffect(() => {
    const savedLang = (window.localStorage.getItem('pref_lang') as Language | null) || 'vi';
    setLangState(savedLang);
    document.documentElement.lang = savedLang === 'en' ? 'en' : 'vi';
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    window.localStorage.setItem('pref_lang', newLang);
    document.documentElement.lang = newLang === 'en' ? 'en' : 'vi';
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: translations[lang],
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
