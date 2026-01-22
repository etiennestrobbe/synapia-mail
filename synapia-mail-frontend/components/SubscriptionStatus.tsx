'use client';

import { useState, useEffect } from 'react';
import { buildApiUrl, getAuthHeaders, API_CONFIG } from '../lib/config';
import { useLanguage } from '../lib/language-provider';

interface SubscriptionStatusProps {
  readonly customer: any;
}

interface Credits {
  remaining: number;
  total: number;
  warningThreshold: number;
}

export default function SubscriptionStatus({ customer }: SubscriptionStatusProps) {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);

  // Safely get translation function
  let t: (key: string, options?: any) => string;
  try {
    ({ t } = useLanguage());
  } catch {
    // Fallback if provider not available
    t = (key: string, options?: any) => {
      if (key === 'creditsBelowThreshold') {
        return `Your credits are below the warning threshold (${options?.threshold}%). Consider upgrading your plan to continue using the email categorization service.`;
      }
      return key;
    };
  }

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CREDITS), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
      } else {
        console.error('Failed to fetch credits:', response.status);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  const creditPercentage = credits ? (credits.remaining / credits.total) * 100 : 0;
  const isLowCredits = credits ? creditPercentage < credits.warningThreshold : false;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t('subscriptionStatus')}</h2>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-card-foreground">{t('accountInfo')}</h3>
        </div>
        <div className="card-content">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('organization')}</dt>
              <dd className="mt-1 text-sm text-foreground">{customer.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('email')}</dt>
              <dd className="mt-1 text-sm text-foreground">{customer.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('plan')}</dt>
              <dd className="mt-1 text-sm text-foreground capitalize">{customer.subscriptionPlan}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('status')}</dt>
              <dd className="mt-1 text-sm text-foreground">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  customer.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {customer.isActive ? t('active') : t('inactive')}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {credits && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-card-foreground">{t('creditUsage')}</h3>
          </div>
          <div className="card-content">
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>{t('creditsRemaining')}</span>
                <span>{credits.remaining} / {credits.total}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isLowCredits ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(creditPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {creditPercentage.toFixed(1)}% {t('remaining', 'remaining')}
              </p>
            </div>

            {isLowCredits && (
              <div className="mt-4 alert alert-warning">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {t('lowCreditsWarning')}
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        {t('creditsBelowThreshold', { threshold: credits.warningThreshold })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>{t('howCreditsWork')}:</strong></p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>{t('creditsConsumed')}</li>
                <li>{t('creditsReset')}</li>
                <li>{t('creditsWarning', { threshold: credits.warningThreshold })}</li>
                <li>{t('serviceBlocked')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-card-foreground">{t('planDetails', 'Plan Details')}</h3>
        </div>
        <div className="card-content">
          <div className="text-sm text-muted-foreground">
            <p>{t('upgradeMessage')}</p>
            <p className="mt-2">
              <strong>{t('supportEmail')}:</strong> support@synapia.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
