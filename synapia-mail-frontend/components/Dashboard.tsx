'use client';

import { useState, useEffect } from 'react';
import { ThemeToggle } from '../lib/theme-provider';
import { useLanguage } from '../lib/language-provider';
import { useTranslation } from 'react-i18next';
import CategoryManager from './CategoryManager';
import EmailCategorizer from './EmailCategorizer';
import EmailConnections from './EmailConnections';
import SubscriptionStatus from './SubscriptionStatus';
import Parameters from './Parameters';

interface DashboardProps {
  customer: any;
  onLogout: () => void;
}

export default function Dashboard({ customer, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('categories');
  const [connectionMessage, setConnectionMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { t } = useTranslation();
  const { language, setLanguage, languages } = useLanguage();

  // Check URL parameters for tab switching and connection messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const successParam = urlParams.get('success');
    const errorParam = urlParams.get('error');

    if (tabParam === 'connections') {
      setActiveTab('connections');

      if (successParam === 'true') {
        setConnectionMessage({
          type: 'success',
          message: 'Email account connected successfully!'
        });
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (errorParam === 'true') {
        setConnectionMessage({
          type: 'error',
          message: 'Failed to connect email account. Please try again.'
        });
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-card-foreground">{t('appName')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'fr')}
                className="input-field px-3 py-1 text-sm"
                title="Select language"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">{t('welcome')}, {customer.name}</span>
              <button
                onClick={onLogout}
                className="btn-primary"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'categories'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {t('categories')}
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'emails'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {t('emailCategorization')}
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'connections'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {t('emailConnections')}
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'subscription'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {t('subscription')}
            </button>
            <button
              onClick={() => setActiveTab('parameters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'parameters'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {t('parameters', 'Parameters')}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'emails' && <EmailCategorizer />}
          {activeTab === 'connections' && <EmailConnections connectionMessage={connectionMessage} onMessageClear={() => setConnectionMessage(null)} />}
          {activeTab === 'subscription' && <SubscriptionStatus customer={customer} />}
          {activeTab === 'parameters' && <Parameters />}
        </div>
      </main>
    </div>
  );
}
