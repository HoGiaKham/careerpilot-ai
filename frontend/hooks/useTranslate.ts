'use client';

import { useLanguage } from '@/context/LanguageProvider';

export const useTranslate = () => {
  const { lang, setLang, t } = useLanguage();
  return { t, lang, setLang };
};