import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginWithGoogleCredential: (credential: string) => void;
  loginWithGoogleAccount: (email: string, name?: string) => void;
  logout: () => void;
  googleClientId: string;
  hasValidGoogleClientId: boolean;
}

const GOOGLE_USER_KEY = 'live_caption_google_user';

// Production Google OAuth 2.0 Client ID fallback
const DEFAULT_CLIENT_ID = '223989835923-2k6o1g744aubi6a6142tt5gvb4igps88.apps.googleusercontent.com';
const ENV_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;
const hasValidClientId = !!(ENV_GOOGLE_CLIENT_ID && !ENV_GOOGLE_CLIENT_ID.includes('demo') && ENV_GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com'));

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(GOOGLE_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    
    // Default initial state is null (Visitor / Unauthenticated mode)
    return null;
  });

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(user));
      } catch (e) {}
    } else {
      localStorage.removeItem(GOOGLE_USER_KEY);
    }
  }, [user]);

  const loginWithGoogleCredential = (credential: string) => {
    const payload = parseJwt(credential);
    if (payload) {
      const googleProfile: UserProfile = {
        id: `google-${payload.sub || Date.now()}`,
        name: payload.name || payload.given_name || 'Google User',
        email: payload.email || 'user@gmail.com',
        picture: payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.email}`,
        provider: 'google'
      };
      setUser(googleProfile);
    }
  };

  const loginWithGoogleAccount = (email: string, name?: string) => {
    const cleanEmail = email.trim();
    const displayName = name?.trim() || cleanEmail.split('@')[0];
    const googleProfile: UserProfile = {
      id: `google-${Date.now()}`,
      name: displayName,
      email: cleanEmail,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      provider: 'google'
    };
    setUser(googleProfile);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(GOOGLE_USER_KEY);
  };

  const content = (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithGoogleCredential,
        loginWithGoogleAccount,
        logout,
        googleClientId: ENV_GOOGLE_CLIENT_ID,
        hasValidGoogleClientId: hasValidClientId
      }}
    >
      {children}
    </AuthContext.Provider>
  );

  if (hasValidClientId) {
    return (
      <GoogleOAuthProvider clientId={ENV_GOOGLE_CLIENT_ID}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  return content;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
