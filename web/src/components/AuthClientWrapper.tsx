'use client';

import { ReactNode } from 'react';

interface AuthClientWrapperProps {
  children: (props: {
    saveAuthToken: (token: string) => void;
    getAuthToken: () => string | null;
    removeAuthToken: () => void;
    checkAuthStatus: () => boolean;
  }) => ReactNode;
}

export default function AuthClientWrapper({ children }: AuthClientWrapperProps) {
  const TOKEN_KEY = 'barberx_admin_token';

  const saveAuthToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const removeAuthToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
  };

  const checkAuthStatus = (): boolean => {
    return !!getAuthToken();
  };

  return <>{children({ saveAuthToken, getAuthToken, removeAuthToken, checkAuthStatus })}</>;
}