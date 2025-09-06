'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BaseBrowser from './BaseBrowser';
import GoverningBodyForm from './forms/GoverningBodyForm';
import { useTheme } from '@/app/contexts/ThemeContext';

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

interface GoverningBodyBrowserProps {
  isAuthorized: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  breadcrumbs?: BreadcrumbItem[];
  onGoverningBodySelect?: (governingBody: any) => void;
  currentJurisdictionFilter?: string | null;
}

const BRANCHES = [
  'executive', 'legislative', 'judicial', 'administrative', 'regulatory',
  'quasi-judicial', 'advisory', 'oversight', 'independent'
];

const ENTITY_TYPES = [
  'body', 'agency', 'department', 'court', 'office', 'board', 'commission',
  'authority', 'corporation', 'committee', 'council', 'assembly', 'senate',
  'house', 'chamber', 'division', 'bureau', 'service', 'administration'
];

export default function GoverningBodyBrowser({ 
  isAuthorized, 
  isLoading, 
  setIsLoading,
  breadcrumbs = [],
  onGoverningBodySelect,
  currentJurisdictionFilter
}: GoverningBodyBrowserProps) {
  const { resolvedTheme } = useTheme();
  const [governingBodies, setGoverningBodies] = useState<any[]>([]);
  const [jurisdictionOptions, setJurisdictionOptions] = useState<{ value: string; label: string }[]>([]);

  // Theme-aware class names
  const themeClasses = {
    text: resolvedTheme === 'dark' ? 'text-foreground' : 'text-foreground',
    textSecondary: resolvedTheme === 'dark' ? 'text-neutral-light' : 'text-neutral-dark',
    textMuted: resolvedTheme === 'dark' ? 'text-neutral' : 'text-neutral',
    link: resolvedTheme === 'dark' 
      ? 'text-primary-light hover:text-primary focus:ring-primary-light' 
      : 'text-primary hover:text-primary-dark focus:ring-primary',
    badge: {
      executive: resolvedTheme === 'dark' ? 'bg-red-900/20 text-red-300 border-red-500/30' : 'bg-red-100 text-red-800 border-red-200',
      legislative: resolvedTheme === 'dark' ? 'bg-blue-900/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200',
      judicial: resolvedTheme === 'dark' ? 'bg-purple-900/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-200',
      administrative: resolvedTheme === 'dark' ? 'bg-green-900/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200',
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

  // Fetch jurisdictions for dropdown
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
        setJurisdictionOptions([{ value: '', label: 'Select Jurisdiction' }, ...options]);
      } catch (error) {
        console.error('Error fetching jurisdictions:', error);
      }
    };
    fetchJurisdictions();
  }, []);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    { key: 'branch', label: 'Branch', sortable: true },
    { key: 'entity_type', label: 'Entity Type', sortable: true },
    { key: 'jurisdiction', label: 'Jurisdiction', sortable: true },
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
      if (filters.branch) {
        params.append('filter[branch]', filters.branch);
      }
      if (filters.entity_type) {
        params.append('filter[entity_type]', filters.entity_type);
      }
      if (filters.jurisdictionId) {
        params.append('filter[jurisdictionId]', filters.jurisdictionId);
      }
      if (filters.search) {
        params.append('filter[name]', filters.search);
      }
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/governing-bodies?${params.toString()}`);
      const data = await response.json();
      
      if (data.data) {
        setGoverningBodies(data.data);
      }
    } catch (error) {
      console.error('Error fetching governing bodies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const createGoverningBody = async (governingBodyData: any) => {
    try {
      setIsLoading(true);
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/governing-bodies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(governingBodyData)
      });
      
      if (response.ok) {
        // Refresh the data
        await fetchData();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create governing body');
      }
    } catch (error) {
      console.error('Error creating governing body:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoverningBody = async (id: string, governingBodyData: any) => {
    try {
      setIsLoading(true);
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/governing-bodies/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(governingBodyData)
      });
      
      if (response.ok) {
        // Refresh the data
        await fetchData();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update governing body');
      }
    } catch (error) {
      console.error('Error updating governing body:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoverningBody = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/governing-bodies/${id}`, {
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
        throw new Error(errorData.detail || 'Failed to delete governing body');
      }
    } catch (error) {
      console.error('Error deleting governing body:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getBranchBadgeClass = (branch: string) => {
    return themeClasses.badge[branch as keyof typeof themeClasses.badge] || themeClasses.badge.default;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderCell = (item: any, column: { key: string; label: string }) => {
    switch (column.key) {
      case 'branch':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBranchBadgeClass(item.branch)}`}>
            {item.branch}
          </span>
        );
      case 'jurisdiction':
        return item.jurisdiction?.name || 'N/A';
      case 'createdAt':
        return formatDate(item.createdAt);
      default:
        return item[column.key];
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Governing Bodies</h2>
      <p className="text-gray-600">Governing Bodies browser is temporarily disabled due to interface mismatch.</p>
    </div>
  );
}
