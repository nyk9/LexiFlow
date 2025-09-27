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
    
    // Listen for storage changes (when session is created/destroyed)
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check every 5 seconds for session changes
    const interval = setInterval(handleStorageChange, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
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