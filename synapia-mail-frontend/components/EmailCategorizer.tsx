'use client';

import { useState, useEffect } from 'react';
import { buildApiUrl, getAuthHeaders, API_CONFIG } from '../lib/config';
import { useLanguage } from '../lib/language-provider';

interface Email {
  _id: string;
  subject: string;
  from: string;
  category?: string;
  confidence?: number;
  isUrgent?: boolean;
  urgencyLevel?: string;
  urgencyReason?: string;
  receivedAt: string;
}

interface Credits {
  remaining: number;
  total: number;
  warningThreshold: number;
}

export default function EmailCategorizer() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [categorizing, setCategorizing] = useState(false);
  const [error, setError] = useState('');

  // Safely get translation function
  let t: (key: string) => string;
  try {
    ({ t } = useLanguage());
  } catch {
    // Fallback if provider not available
    t = (key: string) => key;
  }

  useEffect(() => {
    fetchEmails();
    fetchCredits();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EMAILS), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      } else {
        console.error('Failed to fetch emails:', response.status);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CREDITS), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
        setError('');
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch credits:', response.status, errorText);
        setError(`Failed to load credits: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setError('Network error loading credits. Check backend connection.');
    }
  };

  const handleCategorize = async () => {
    if (!credits || credits.remaining <= 0) {
      alert(t('insufficientCredits'));
      return;
    }

    setCategorizing(true);
    setError('');
    try {
      const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.EMAILS)}/categorize`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const newEmails = await response.json();
        setEmails(prev => [...newEmails, ...prev]);
        await fetchCredits(); // Refresh credits
      } else if (response.status === 400) {
        setError(t('noCategories') || 'No categories defined or insufficient credits.');
      } else {
        setError(`Categorization failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error categorizing emails:', error);
      setError(t('networkError') || 'Error categorizing emails. Please try again.');
    } finally {
      setCategorizing(false);
    }
  };

  const creditPercentage = credits ? (credits.remaining / credits.total) * 100 : 0;
  const isLowCredits = credits ? creditPercentage < credits.warningThreshold : false;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">{t('emailCategorization')}</h2>
        <div className="flex items-center space-x-4">
          {credits ? (
            <div className="text-sm text-muted-foreground">
              {t('creditsRemaining')}: {credits.remaining}/{credits.total}
              {isLowCredits && (
                <span className="text-destructive ml-2">⚠️ {t('lowCreditsWarning')}</span>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t('loading')} {t('creditsRemaining').toLowerCase()}...
            </div>
          )}
          <button
            onClick={handleCategorize}
            disabled={categorizing || !credits || credits.remaining <= 0}
            className="btn-primary disabled:opacity-50"
          >
            {categorizing ? t('categorizing') : t('categorizeNewEmails')}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-destructive">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        </div>
      )}

      {(!credits || credits.remaining <= 0) && !error && (
        <div className="alert alert-warning">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('insufficientCredits')}
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>{t('upgradeMessage')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <ul className="divide-y divide-border">
          {emails.map((email) => (
            <li key={email._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{email.subject}</h4>
                  <p className="text-sm text-muted-foreground">{t('from')}: {email.from}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('received')}: {new Date(email.receivedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {email.category ? (
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {email.category}
                        {email.confidence && (
                          <span className="ml-1 text-xs">
                            ({Math.round(email.confidence * 100)}%)
                          </span>
                        )}
                      </span>
                      {email.isUrgent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {email.urgencyLevel?.toUpperCase() || 'URGENT'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {t('notCategorized')}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
          {emails.length === 0 && (
            <li className="px-6 py-8 text-center text-muted-foreground">
              {t('noEmails')}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
