'use client';

import { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedCustomer = localStorage.getItem('customer');
    if (storedToken && storedCustomer) {
      setToken(storedToken);
      setCustomer(JSON.parse(storedCustomer));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (newToken: string, customerData: any) => {
    setToken(newToken);
    setCustomer(customerData);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('customer', JSON.stringify(customerData));
  };

  const handleLogout = () => {
    setToken(null);
    setCustomer(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('customer');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !customer) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard customer={customer} onLogout={handleLogout} />;
}
