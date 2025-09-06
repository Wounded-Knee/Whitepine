# Frontend API Integration Guide

## Overview
This document provides guidelines and best practices for integrating the Whitepine Full-Stack Application backend API with the Next.js frontend.

## API Client Setup

### Base Configuration
Create a centralized API client using axios:

```typescript
// lib/api-client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Service Classes
Organize API calls into service classes:

```typescript
// services/authService.ts
import apiClient from '@/lib/api-client';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  async refreshToken() {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  }
}

export const authService = new AuthService();
```

```typescript
// services/petitionService.ts
import apiClient from '@/lib/api-client';

export interface Petition {
  _id: string;
  title: string;
  description: string;
  category: string;
  voteCount: number;
  // vigorCount: number; // REMOVED
// totalVigor: number; // REMOVED
  isActive: boolean;
  creator: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  jurisdiction: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetitionData {
  title: string;
  description: string;
  category: string;
  jurisdiction: string;
  governingBody?: string;
  legislation?: string;
}

class PetitionService {
  async getPetitions(params?: {
    category?: string;
    isActive?: boolean;
    creator?: string;
    jurisdiction?: string;
    governingBody?: string;
    legislation?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get('/petitions', { params });
    return response.data;
  }

  async getPetition(id: string): Promise<Petition> {
    const response = await apiClient.get(`/petitions/${id}`);
    return response.data;
  }

  async createPetition(data: CreatePetitionData): Promise<Petition> {
    const response = await apiClient.post('/petitions', data);
    return response.data;
  }

  async updatePetition(id: string, data: Partial<CreatePetitionData>): Promise<Petition> {
    const response = await apiClient.put(`/petitions/${id}`, data);
    return response.data;
  }

  async deletePetition(id: string) {
    const response = await apiClient.delete(`/petitions/${id}`);
    return response.data;
  }

  async getJurisdictions(params?: { level?: string; parent?: string }) {
    const response = await apiClient.get('/petitions/jurisdictions', { params });
    return response.data;
  }

  async getGoverningBodies(jurisdiction: string) {
    const response = await apiClient.get('/petitions/governing-bodies', {
      params: { jurisdiction }
    });
    return response.data;
  }

  async getLegislation(params?: { governingBody?: string; status?: string }) {
    const response = await apiClient.get('/petitions/legislation', { params });
    return response.data;
  }
}

export const petitionService = new PetitionService();
```

## React Hooks for API Integration

### Custom Hooks
Create custom hooks for common API patterns:

```typescript
// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { authService, User } from '@/services/authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login({ identifier, password });
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  }, []);

  const register = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(data);
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };
}
```

```typescript
// hooks/usePetitions.ts
import { useState, useCallback } from 'react';
import { petitionService, Petition, CreatePetitionData } from '@/services/petitionService';

export function usePetitions() {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchPetitions = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await petitionService.getPetitions(params);
      setPetitions(response.petitions);
      setPagination(response.pagination);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch petitions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPetition = useCallback(async (data: CreatePetitionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await petitionService.createPetition(data);
      setPetitions(prev => [response, ...prev]);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create petition');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePetition = useCallback(async (id: string, data: Partial<CreatePetitionData>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await petitionService.updatePetition(id, data);
      setPetitions(prev => prev.map(p => p._id === id ? response : p));
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update petition');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePetition = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await petitionService.deletePetition(id);
      setPetitions(prev => prev.filter(p => p._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete petition');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    petitions,
    loading,
    error,
    pagination,
    fetchPetitions,
    createPetition,
    updatePetition,
    deletePetition,
  };
}
```

## Error Handling

### Global Error Handler
Implement a global error handling system:

```typescript
// utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): ApiError {
  if (error.response) {
    // Server responded with error status
    return new ApiError(
      error.response.status,
      error.response.data?.message || 'An error occurred',
      error.response.data?.code
    );
  } else if (error.request) {
    // Network error
    return new ApiError(0, 'Network error. Please check your connection.');
  } else {
    // Other error
    return new ApiError(0, error.message || 'An unexpected error occurred');
  }
}
```

### Error Boundary Component
Create an error boundary for React components:

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600 mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Loading States

### Loading Components
Create reusable loading components:

```typescript
// components/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
}
```

```typescript
// components/LoadingSkeleton.tsx
interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}
```

## Form Handling

### Form Validation
Implement form validation with error handling:

```typescript
// hooks/useForm.ts
import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validate = useCallback((fieldValues: T = values) => {
    if (!validationRules) return {};

    const newErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validationRules).forEach((key) => {
      const value = fieldValues[key];
      const rules = validationRules[key];

      if (rules.required && !value) {
        newErrors[key as keyof T] = 'This field is required';
      } else if (value) {
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[key as keyof T] = `Minimum length is ${rules.minLength} characters`;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[key as keyof T] = `Maximum length is ${rules.maxLength} characters`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          newErrors[key as keyof T] = 'Invalid format';
        }
        if (rules.custom) {
          const customError = rules.custom(value);
          if (customError) {
            newErrors[key as keyof T] = customError;
          }
        }
      }
    });

    return newErrors;
  }, [values, validationRules]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const newErrors = validate({ ...values, [name]: value });
      setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
    }
  }, [touched, values, validate]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const newErrors = validate();
    setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
  }, [validate]);

  const handleSubmit = useCallback((onSubmit: (values: T) => void) => {
    const newErrors = validate();
    setErrors(newErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}
```

## File Upload

### File Upload Hook
Create a hook for handling file uploads:

```typescript
// hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

export function useFileUpload(options: UploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    endpoint: string,
    additionalData?: Record<string, any>
  ) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Validate file
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(`File size exceeds ${options.maxSize / 1024 / 1024}MB limit`);
      }

      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      // Upload with progress tracking
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(progress);
          options.onProgress?.(progress);
        },
      });

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [options]);

  return {
    uploading,
    progress,
    error,
    uploadFile,
  };
}
```

## Caching and State Management

### React Query Integration
Use React Query for efficient caching and state management:

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

```typescript
// hooks/usePetitionsQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petitionService, Petition, CreatePetitionData } from '@/services/petitionService';

export function usePetitionsQuery(params?: any) {
  return useQuery({
    queryKey: ['petitions', params],
    queryFn: () => petitionService.getPetitions(params),
    keepPreviousData: true,
  });
}

export function usePetitionQuery(id: string) {
  return useQuery({
    queryKey: ['petition', id],
    queryFn: () => petitionService.getPetition(id),
    enabled: !!id,
  });
}

export function useCreatePetitionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePetitionData) => petitionService.createPetition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
    },
  });
}

export function useUpdatePetitionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePetitionData> }) =>
      petitionService.updatePetition(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      queryClient.invalidateQueries({ queryKey: ['petition', data._id] });
    },
  });
}
```

## Best Practices

### 1. Error Handling
- Always handle API errors gracefully
- Provide meaningful error messages to users
- Log errors for debugging
- Implement retry logic for transient failures

### 2. Loading States
- Show loading indicators during API calls
- Use skeleton loaders for better UX
- Implement optimistic updates where appropriate

### 3. Caching
- Cache API responses to reduce server load
- Implement proper cache invalidation
- Use React Query for complex caching scenarios

### 4. Security
- Never store sensitive data in localStorage
- Validate all user inputs
- Sanitize data before sending to API
- Use HTTPS in production

### 5. Performance
- Implement pagination for large datasets
- Use debouncing for search inputs
- Optimize bundle size by code splitting
- Implement proper loading states

### 6. Testing
- Write unit tests for API services
- Mock API calls in component tests
- Test error scenarios
- Use MSW for API mocking in tests

---

*Last Updated: $(date)*
*Version: 1.0*
*Maintainer: Frontend Development Team*
*Next Review: $(date -d '+3 months')*
