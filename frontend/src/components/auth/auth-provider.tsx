"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_RUST_BACKEND_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Cookieからトークンを取得
  const getTokenFromCookie = () => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("auth_token="),
      );
      return tokenCookie ? tokenCookie.split("=")[1] : null;
    }
    return null;
  };

  // Cookieにトークンを保存 (HTTPOnly=false for client access)
  const setTokenCookie = (token: string) => {
    if (typeof window !== "undefined") {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30); // 30日後に期限切れ
      document.cookie = `auth_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }
  };

  // Cookieからトークンを削除
  const removeTokenCookie = () => {
    if (typeof window !== "undefined") {
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  // 現在のユーザー情報を取得
  const fetchCurrentUser = async (token?: string) => {
    const authToken = token || getTokenFromCookie();
    if (!authToken) {
      setUser(null);
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      } else {
        // トークンが無効な場合、削除
        removeTokenCookie();
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      removeTokenCookie();
      setUser(null);
      return false;
    }
  };

  // 初期化時に保存されたトークンを確認
  useEffect(() => {
    const initAuth = async () => {
      await fetchCurrentUser();
      setLoading(false);
    };

    initAuth();
  }, []);

  // ログイン処理
  const login = async (token: string) => {
    setTokenCookie(token);
    await fetchCurrentUser(token);
  };

  // ログアウト処理
  const logout = () => {
    removeTokenCookie();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// カスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
