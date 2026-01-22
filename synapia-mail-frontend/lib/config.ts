// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
    },
    CATEGORIES: '/categories',
    EMAILS: '/emails',
    CREDITS: '/emails/credits',
    EMAIL_CONNECTIONS: '/api/email-connections',
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true; // If we can't parse, assume expired
  }
};

// Helper function to get auth headers
export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const authToken = token || localStorage.getItem('authToken');

  if (authToken) {
    // Check if token is expired
    if (isTokenExpired(authToken)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('customer');
      // Force page reload to go back to login
      window.location.reload();
      return headers;
    }
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
};
