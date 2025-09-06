'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { getApiUrl } from '@/shared/config.js';
import { User, AuthContextType, RegisterData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize axios with base URL
  const api = axios.create({
    baseURL: getApiUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for refresh tokens
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle token expiration
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user data
  const fetchUser = async (authToken: string) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(response.data.data); // New API returns { data: user }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (identifier: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { accessToken, user: userData } = response.data.data;
      
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('authToken', accessToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { accessToken, user: newUser } = response.data.data;
      
      setToken(accessToken);
      setUser(newUser);
      localStorage.setItem('authToken', accessToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  // Google OAuth login
  const loginWithGoogle = async () => {
    try {
      const response = await api.get('/auth/google');
      // If we get here, it means Google OAuth is configured and we can redirect
      const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/oauth/google`;
      window.location.href = googleAuthUrl;
    } catch (error: any) {
      if (error.response?.status === 503) {
        throw new Error('Google OAuth is not configured');
      }
      throw error;
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role as any) || false;
  };

  // Check if user has a specific scope
  const hasScope = (scope: string): boolean => {
    // Scopes are handled through roles in the current implementation
    return false;
  };

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token');
    
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('authToken', authToken);
      fetchUser(authToken);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    updateUser,
    hasRole,
    hasScope,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
