'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/auth/types';
import { getCurrentUser, signOut, getAccessToken } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const logout = () => {
    signOut();
    setUser(null);
  };

  const refreshUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    accessToken: getAccessToken(),
    logout,
    refreshUser
  };
}