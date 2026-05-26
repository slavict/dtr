import React, { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken } from "../api/axios";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
    setTokenState(newToken);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setTokenState(null);
    setUser(null);
    setAuthToken(null);
  };

  const value = { token, user, login, logout, isAuthenticated: !!token };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
