'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BaseBrowser from './BaseBrowser';
import JurisdictionForm from './forms/JurisdictionForm';
import { useTheme } from '@/app/contexts/ThemeContext';

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

interface JurisdictionBrowserProps {
  isAuthorized: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  breadcrumbs?: BreadcrumbItem[];
  onJurisdictionSelect?: (jurisdiction: any) => void;
  currentJurisdictionFilter?: string | null;
}

const LEVELS = [
  'federal', 'state', 'territory', 'tribal', 'regional',
  'county', 'municipal', 'special_district', 'school_district',
  'judicial_district', 'precinct', 'ward'
];

const ENTITY_TYPES = [
  'jurisdiction', 'body', 'agency', 'department', 'court', 'office',
  'board', 'commission', 'authority', 'corporation', 'committee', 'district'
];

export default function JurisdictionBrowser({ 
  isAuthorized, 
  isLoading, 
  setIsLoading,
  breadcrumbs = [],
  onJurisdictionSelect,
  currentJurisdictionFilter
}: JurisdictionBrowserProps) {
  const { resolvedTheme } = useTheme();
  const [jurisdictions, setJurisdictions] = useState<any[]>([]);
  const [parentOptions, setParentOptions] = useState<{ value: string; label: string }[]>([]);

  // Theme-aware class names
  const themeClasses = {
    text: resolvedTheme === 'dark' ? 'text-foreground' : 'text-foreground',
    textSecondary: resolvedTheme === 'dark' ? 'text-neutral-light' : 'text-neutral-dark',
    textMuted: resolvedTheme === 'dark' ? 'text-neutral' : 'text-neutral',
    link: resolvedTheme === 'dark' 
      ? 'text-primary-light hover:text-primary focus:ring-primary-light' 
      : 'text-primary hover:text-primary-dark focus:ring-primary',
    badge: {
      federal: resolvedTheme === 'dark' ? 'bg-purple-900/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-200',
      state: resolvedTheme === 'dark' ? 'bg-blue-900/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200',
      county: resolvedTheme === 'dark' ? 'bg-green-900/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200',
      municipal: resolvedTheme === 'dark' ? 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      default: resolvedTheme === 'dark' ? 'bg-neutral-900/20 text-neutral-300 border-neutral-500/30' : 'bg-neutral-100 text-neutral-800 border-neutral-200'
    },
    button: {
      edit: resolvedTheme === 'dark' 
        ? 'text-primary-light hover:text-primary focus:ring-primary-light' 
        : 'text-primary hover:text-primary-dark focus:ring-primary',
      delete: resolvedTheme === 'dark' 
        ? 'text-error hover:text-error/80 focus:ring-error/50' 
        : 'text-error hover:text-error/80 focus:ring-error/50'
    }
  };

  // Fetch jurisdictions for parent dropdown
  useEffect(() => {
    const fetchJurisdictions = async () => {
      try {
        // Use the new v1 API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/jurisdictions?page_size=1000`);
        const data = await response.json();
        const options = data.data?.map((jurisdiction: any) => ({
          value: jurisdiction._id,
          label: jurisdiction.name
        })) || [];
        setParentOptions([{ value: '', label: 'None (Top Level)' }, ...options]);
      } catch (error) {
        console.error('Error fetching jurisdictions:', error);
      }
    };
    fetchJurisdictions();
  }, []);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    { key: 'level', label: 'Level', sortable: true },
    { key: 'entity_type', label: 'Entity Type', sortable: true },
    { key: 'depth', label: 'Depth', sortable: true },
    { key: 'path', label: 'Path', sortable: false },
    { key: 'createdAt', label: 'Created', sortable: true }
  ];

  const fetchData = useCallback(async (filters: any = {}, sort: string = '', page: number = 1) => {
    try {
      setIsLoading(true);
      
      // Build query parameters for the new v1 API
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', '50');
      
      if (sort) {
        params.append('sort', sort);
      }
      
      // Add filters using the new v1 API filter format
      if (filters.level) {
        params.append('filter[level]', filters.level);
      }
      if (filters.entity_type) {
        params.append('filter[entity_type]', filters.entity_type);
      }
      if (filters.parentId) {
        params.append('filter[parentId]', filters.parentId);
      }
      if (filters.search) {
        params.append('filter[name]', filters.search);
      }
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/jurisdictions?${params.toString()}`);
      const data = await response.json();
      
      if (data.data) {
        setJurisdictions(data.data);
      }
    } catch (error) {
      console.error('Error fetching jurisdictions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const createJurisdiction = async (jurisdictionData: any) => {
    try {
      setIsLoading(true);
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/jurisdictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(jurisdictionData)
      });
      
      if (response.ok) {
        // Refresh the data
        await fetchData();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create jurisdiction');
      }
    } catch (error) {
      console.error('Error creating jurisdiction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateJurisdiction = async (id: string, jurisdictionData: any) => {
    try {
      setIsLoading(true);
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/jurisdictions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(jurisdictionData)
      });
      
      if (response.ok) {
        // Refresh the data
        await fetchData();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update jurisdiction');
      }
    } catch (error) {
      console.error('Error updating jurisdiction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJurisdiction = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/jurisdictions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        // Refresh the data
        await fetchData();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete jurisdiction');
      }
    } catch (error) {
      console.error('Error deleting jurisdiction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelBadgeClass = (level: string) => {
    return themeClasses.badge[level as keyof typeof themeClasses.badge] || themeClasses.badge.default;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderCell = (item: any, column: { key: string; label: string }) => {
    switch (column.key) {
      case 'level':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelBadgeClass(item.level)}`}>
            {item.level}
          </span>
        );
      case 'path':
        return (
          <div className="text-xs text-gray-500 max-w-xs truncate" title={item.path}>
            {item.path}
          </div>
        );
      case 'createdAt':
        return formatDate(item.createdAt);
      default:
        return item[column.key];
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Jurisdictions</h2>
      <p className="text-gray-600">Jurisdictions browser is temporarily disabled due to interface mismatch.</p>
    </div>
  );
}
