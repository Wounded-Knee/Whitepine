'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BaseBrowser from './BaseBrowser';
import OfficeForm from './forms/OfficeForm';
import { useTheme } from '@/app/contexts/ThemeContext';

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

interface OfficeBrowserProps {
  isAuthorized: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  breadcrumbs?: BreadcrumbItem[];
  onOfficeSelect?: (office: any) => void;
  currentGoverningBodyFilter?: string | null;
}

const OFFICE_TYPES = [
  'president', 'vice_president', 'governor', 'lieutenant_governor', 'mayor',
  'senator', 'representative', 'councilmember', 'commissioner', 'judge',
  'prosecutor', 'sheriff', 'clerk', 'treasurer', 'assessor', 'other'
];

const SELECTION_METHODS = [
  'elected', 'appointed', 'hybrid', 'career', 'inherited', 'other'
];

const CONSTITUENCIES = [
  'at_large', 'district', 'ward', 'circuit', 'subcircuit', 'single_member_district'
];

export default function OfficeBrowser({ 
  isAuthorized, 
  isLoading, 
  setIsLoading,
  breadcrumbs = [],
  onOfficeSelect,
  currentGoverningBodyFilter
}: OfficeBrowserProps) {
  const { resolvedTheme } = useTheme();
  const [offices, setOffices] = useState<any[]>([]);
  const [governingBodyOptions, setGoverningBodyOptions] = useState<{ value: string; label: string }[]>([]);

  // Theme-aware class names
  const themeClasses = {
    text: resolvedTheme === 'dark' ? 'text-foreground' : 'text-foreground',
    textSecondary: resolvedTheme === 'dark' ? 'text-neutral-light' : 'text-neutral-dark',
    textMuted: resolvedTheme === 'dark' ? 'text-neutral' : 'text-neutral',
    link: resolvedTheme === 'dark' 
      ? 'text-primary-light hover:text-primary focus:ring-primary-light' 
      : 'text-primary hover:text-primary-dark focus:ring-primary',
    badge: {
      elected: resolvedTheme === 'dark' ? 'bg-green-900/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200',
      appointed: resolvedTheme === 'dark' ? 'bg-blue-900/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200',
      hybrid: resolvedTheme === 'dark' ? 'bg-purple-900/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-200',
      career: resolvedTheme === 'dark' ? 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
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

  // Fetch governing bodies for dropdown
  useEffect(() => {
    const fetchGoverningBodies = async () => {
      try {
        // Use the new v1 API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/governing-bodies?page_size=1000`);
        const data = await response.json();
        const options = data.data?.map((governingBody: any) => ({
          value: governingBody._id,
          label: governingBody.name
        })) || [];
        setGoverningBodyOptions([{ value: '', label: 'Select Governing Body' }, ...options]);
      } catch (error) {
        console.error('Error fetching governing bodies:', error);
      }
    };
    fetchGoverningBodies();
  }, []);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    { key: 'office_type', label: 'Office Type', sortable: true },
    { key: 'selection_method', label: 'Selection Method', sortable: true },
    { key: 'governingBody', label: 'Governing Body', sortable: true },
    { key: 'term_length', label: 'Term Length', sortable: true },
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
      if (filters.office_type) {
        params.append('filter[office_type]', filters.office_type);
      }
      if (filters.selection_method) {
        params.append('filter[selection_method]', filters.selection_method);
      }
      if (filters.governingBodyId) {
        params.append('filter[governingBodyId]', filters.governingBodyId);
      }
      if (filters.search) {
        params.append('filter[name]', filters.search);
      }
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/offices?${params.toString()}`);
      const data = await response.json();
      
      if (data.data) {
        setOffices(data.data);
      }
    } catch (error) {
      console.error('Error fetching offices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const createOffice = async (officeData: any) => {
    try {
      setIsLoading(true);
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/offices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(officeData)
      });
      
      if (response.ok) {
        // Refresh the data
        await fetchData();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create office');
      }
    } catch (error) {
      console.error('Error creating office:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOffice = async (id: string, officeData: any) => {
    try {
      setIsLoading(true);
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/offices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(officeData)
      });
      
      if (response.ok) {
        // Refresh the data
        await fetchData();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update office');
      }
    } catch (error) {
      console.error('Error updating office:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOffice = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/offices/${id}`, {
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
        throw new Error(errorData.detail || 'Failed to delete office');
      }
    } catch (error) {
      console.error('Error deleting office:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectionMethodBadgeClass = (method: string) => {
    return themeClasses.badge[method as keyof typeof themeClasses.badge] || themeClasses.badge.default;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTermLength = (months: number) => {
    if (!months) return 'N/A';
    if (months === 12) return '1 year';
    if (months === 24) return '2 years';
    if (months === 48) return '4 years';
    if (months === 60) return '5 years';
    if (months === 72) return '6 years';
    return `${months} months`;
  };

  const renderCell = (item: any, column: { key: string; label: string }) => {
    switch (column.key) {
      case 'selection_method':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSelectionMethodBadgeClass(item.selection_method)}`}>
            {item.selection_method}
          </span>
        );
      case 'governingBody':
        return item.governingBody?.name || 'N/A';
      case 'term_length':
        return formatTermLength(item.term_length);
      case 'createdAt':
        return formatDate(item.createdAt);
      default:
        return item[column.key];
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Offices</h2>
      <p className="text-gray-600">Offices browser is temporarily disabled due to interface mismatch.</p>
    </div>
  );
}
