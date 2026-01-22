'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Parameters() {
  const [threshold, setThreshold] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    fetchThreshold();
  }, []);

  const fetchThreshold = async () => {
    try {
      const response = await fetch('/api/config/categorization-threshold', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setThreshold(data.threshold);
      } else {
        setMessage({ type: 'error', text: 'Failed to load threshold settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading threshold settings' });
    } finally {
      setLoading(false);
    }
  };

  const updateThreshold = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/config/categorization-threshold', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ threshold }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Threshold updated successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update threshold' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating threshold' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-card-foreground mb-2">
          {t('parameters', 'Parameters')}
        </h2>
        <p className="text-muted-foreground">
          Configure your email categorization settings
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">
          Categorization Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Confidence Threshold: {threshold.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.0 (Low)</span>
              <span>0.5 (Medium)</span>
              <span>1.0 (High)</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              This threshold determines when the system should suggest creating a new category
              instead of using existing ones. Lower values will create more categories,
              higher values will use existing categories more often.
            </p>
          </div>

          <button
            onClick={updateThreshold}
            disabled={saving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
