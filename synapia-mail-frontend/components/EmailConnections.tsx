'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { buildApiUrl, getAuthHeaders, API_CONFIG } from '../lib/config';

interface EmailProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'available' | 'coming_soon';
  note?: string;
  scopes?: string[];
  features?: string[];
}

interface EmailConnection {
  id: string;
  provider: string;
  providerEmail: string;
  status: 'active' | 'inactive' | 'error' | 'expired' | 'revoked';
  connectedAt: string;
  lastSyncAt: string;
  syncCount: number;
}

interface EmailConnectionsProps {
  connectionMessage?: { type: 'success' | 'error'; message: string } | null;
  onMessageClear?: () => void;
}

export default function EmailConnections({ connectionMessage, onMessageClear }: EmailConnectionsProps) {
  const { t } = useTranslation();
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [connections, setConnections] = useState<EmailConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
    fetchConnections();
  }, []);

  const fetchProviders = async () => {
    try {
      // For now, return static provider data since backend might not be running
      // In production, this would come from the API
      const staticProviders: EmailProvider[] = [
        {
          id: 'outlook',
          name: t('microsoftOutlook'),
          description: t('microsoftOutlookDesc'),
          icon: 'outlook',
          status: 'available' as const,
          scopes: ['Mail.Read', 'Mail.ReadWrite'],
          features: [
            t('emailCategorization'),
            t('automaticProcessing'),
            t('secureTokenStorage')
          ]
        },
        {
          id: 'gmail',
          name: t('googleGmail'),
          description: t('googleGmailDesc'),
          icon: 'gmail',
          status: 'coming_soon' as const,
          note: t('gmailComingSoon')
        },
        {
          id: 'yahoo',
          name: t('yahooMail'),
          description: t('yahooMailDesc'),
          icon: 'yahoo',
          status: 'coming_soon' as const,
          note: t('yahooComingSoon')
        },
        {
          id: 'icloud',
          name: t('appleIcloud'),
          description: t('appleIcloudDesc'),
          icon: 'icloud',
          status: 'coming_soon' as const,
          note: t('icloudComingSoon')
        }
      ];

      setProviders(staticProviders);

      // Also try the API call for future compatibility
      try {
        const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.EMAIL_CONNECTIONS}/providers/available`), {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        if (data.success) {
          setProviders(data.providers);
        }
      } catch (apiError) {
        // API not available, use static data (this is fine for development)
        console.log('Using static provider data (API not available)');
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EMAIL_CONNECTIONS), {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (data.success) {
        setConnections(data.connections);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (providerId: string) => {
    if (providerId !== 'outlook') {
      setError(t('failedToConnect'));
      return;
    }

    setConnecting(providerId);
    setError(null);

    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.EMAIL_CONNECTIONS}/outlook/auth-url`), {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (data.success && data.authUrl) {
        // Redirect to Microsoft OAuth
        window.location.href = data.authUrl;
      } else {
        setError(t('failedToConnect'));
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      setError(t('failedToConnect'));
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm(t('disconnectConfirm'))) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.EMAIL_CONNECTIONS}/${connectionId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setSuccess(t('emailAccountDisconnected'));
        fetchConnections(); // Refresh the list
      } else {
        setError(t('failedToDisconnect'));
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      setError(t('failedToDisconnect'));
    }
  };

  const getProviderIcon = (icon: string) => {
    switch (icon) {
      case 'outlook':
        return '📧';
      case 'gmail':
        return '📬';
      case 'yahoo':
        return '📮';
      case 'icloud':
        return '☁️';
      default:
        return '📧';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-orange-600 bg-orange-100';
      case 'revoked':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loadingEmailConnections')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{t('emailConnections')}</h2>
          <p className="text-muted-foreground mt-2">
            {t('connectYourEmail')}
          </p>
        </div>
      </div>

      {/* OAuth Success/Error Messages from URL redirect */}
      {connectionMessage && (
        <div className={`p-4 border rounded-lg ${connectionMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center">
            <span className={`text-lg mr-2 ${connectionMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {connectionMessage.type === 'success' ? '✅' : '❌'}
            </span>
            <p className={`${connectionMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {connectionMessage.message}
            </p>
          </div>
        </div>
      )}

      {/* Component Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 text-lg mr-2">✅</span>
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 text-lg mr-2">❌</span>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <span className="text-blue-600 text-2xl mr-3">🔒</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              {t('privacyFirstEmailProcessing')}
            </h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• {t('emailContentNeverStored')}</li>
              <li>• {t('onlyMetadataSaved')}</li>
              <li>• {t('processingInMemory')}</li>
              <li>• {t('oauthTokensEncrypted')}</li>
              <li>• {t('disconnectAnytime')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Existing Connections */}
      {connections.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">{t('connectedAccounts')}</h3>
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getProviderIcon(connection.provider)}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{connection.providerEmail}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('connected')} {new Date(connection.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </span>
                    <button
                      onClick={() => handleDisconnect(connection.id)}
                      className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      {t('disconnect')}
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  {t('lastSync')}: {new Date(connection.lastSyncAt).toLocaleString()} •
                  {t('totalSyncs')}: {connection.syncCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Providers */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          {connections.length > 0 ? t('connectAdditionalAccounts') : t('connectFirstEmailAccount')}
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`relative border rounded-lg p-6 transition-all ${
                provider.status === 'available'
                  ? 'border-border hover:border-primary/50 hover:shadow-md'
                  : 'border-border/50 bg-muted/30'
              }`}
            >
              {/* Coming Soon Badge */}
              {provider.status === 'coming_soon' && (
                <div className="absolute top-3 right-3 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              )}

              {/* Provider Icon */}
              <div className="text-4xl mb-4">
                {getProviderIcon(provider.icon)}
              </div>

              {/* Provider Info */}
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {provider.name}
              </h4>
              <p className="text-muted-foreground mb-4">
                {provider.description}
              </p>

              {/* Features */}
              {provider.features && (
                <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                  {provider.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Note for coming soon */}
              {provider.note && (
                <p className="text-sm text-orange-600 mb-4 italic">
                  {provider.note}
                </p>
              )}

              {/* Connect Button */}
              <button
                onClick={() => handleConnect(provider.id)}
                disabled={provider.status === 'coming_soon' || connecting === provider.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  provider.status === 'available'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {connecting === provider.id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {t('connecting')}
                  </div>
                ) : provider.status === 'available' ? (
                  t('connectAccount', { provider: provider.name })
                ) : (
                  t('comingSoon')
                )}
              </button>

              {/* Security Note */}
              {provider.status === 'available' && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {t('secureOauthConnection')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
