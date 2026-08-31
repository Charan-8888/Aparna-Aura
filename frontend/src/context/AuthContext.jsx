import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { saveTokens, getAccessToken, getRefreshToken, clearTokens } from '../utils/token';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // true on mount while restoring session

  // ─── Session Restore on Mount ─────────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const user = await authService.getMe();
        setCurrentUser(user);
      } catch {
        // Access token might be expired; the interceptor will try refresh.
        // If that also fails, the 'auth:logout' event will fire.
        clearTokens();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─── Listen for forced logout from API interceptor ────────────────────────────
  useEffect(() => {
    const handleForceLogout = () => {
      setCurrentUser(null);
      clearTokens();
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    saveTokens(data.access, data.refresh);
    // Use user from response or fetch fresh
    const user = data.user || (await authService.getMe());
    setCurrentUser(user);
    return user;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const data = await authService.loginWithGoogle(credential);
    saveTokens(data.access, data.refresh);
    setCurrentUser(data.user || (await authService.getMe()));
  }, []);

  // ─── Register ─────────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const data = await authService.register(formData);
    saveTokens(data.access, data.refresh);
    const user = data.user || (await authService.getMe());
    setCurrentUser(user);
    return user;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await authService.logout(refresh);
      }
    } catch {
      // Still clear locally even if the server call fails
    } finally {
      clearTokens();
      setCurrentUser(null);
    }
  }, []);

  // ─── Update User (e.g. after profile edit) ────────────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    loginWithGoogle,
    logout,
    register,
    updateUser,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
