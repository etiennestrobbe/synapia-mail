'use client';

import { useEffect } from 'react';
import { ThemeProvider } from './theme-provider';
import { LanguageProvider } from './language-provider';
import i18n from './i18n'; // Import i18n directly

function LanguageSetter() {
  useEffect(() => {
    // Set initial language
    document.documentElement.lang = i18n.language || 'en';

    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      document.documentElement.lang = lng;
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return null;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // i18n is initialized when this component mounts
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <LanguageSetter />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
