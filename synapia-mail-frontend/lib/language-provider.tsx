'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  languages: { code: Language; name: string; flag: string }[];
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation();
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get language from i18n
    const currentLang = i18n.language as Language;
    if (languages.some(lang => lang.code === currentLang)) {
      setLanguageState(currentLang);
    }
  }, [i18n.language]);

  const setLanguage = (newLanguage: Language) => {
    i18n.changeLanguage(newLanguage);
    setLanguageState(newLanguage);
  };

  const value = {
    language,
    setLanguage,
    languages,
    t,
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Language toggle component
export function LanguageToggle() {
  const { language, setLanguage, languages } = useLanguage();

  const cycleLanguage = () => {
    const currentIndex = languages.findIndex(lang => lang.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === language);
  };

  const currentLang = getCurrentLanguage();

  return (
    <button
      onClick={cycleLanguage}
      className="btn-secondary flex items-center gap-2"
      title={`Current language: ${currentLang?.name}. Click to change language.`}
    >
      <span>{currentLang?.flag}</span>
      <span className="hidden sm:inline">{currentLang?.name}</span>
    </button>
  );
}
