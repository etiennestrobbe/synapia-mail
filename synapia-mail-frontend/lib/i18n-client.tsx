'use client';

import { useEffect } from 'react';
import i18n from './i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // i18n is already initialized in the i18n.ts file
    // This component just ensures it's loaded on the client side
  }, []);

  return <>{children}</>;
}
