import { DEFAULT_LOCALE, LOCALES } from '@luxury-investment/shared';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import bg from '@/i18n/locales/bg.json';
import en from '@/i18n/locales/en.json';

void i18n.use(initReactI18next).init({
  resources: {
    bg: { translation: bg },
    en: { translation: en },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...LOCALES],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
