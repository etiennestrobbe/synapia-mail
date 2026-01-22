'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function Footer() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render static content during SSR to avoid hydration mismatch
    return (
      <footer className="mt-auto border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2026 SynapIA Mail. SynapIA Mail Assistant.
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/privacy-policy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <a
                href="mailto:privacy@synapia-mail.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground text-center">
              <p className="mb-2">
                GDPR Compliance Summary
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Data Subject Rights
                </span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Lawful Processing
                </span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Data Minimization
                </span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Security Measures
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2026 SynapIA Mail. {t('appName')}.
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="/privacy-policy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('privacyPolicy')}
            </Link>
            <Link
              href="/terms-of-service"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('termsOfService')}
            </Link>
            <a
              href="mailto:privacy@synapia-mail.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center">
            <p className="mb-2">
              {t('gdprComplianceSummary')}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {t('dataSubjectRights')}
              </span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {t('lawfulProcessing')}
              </span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {t('dataMinimization')}
              </span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {t('securityMeasures')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
