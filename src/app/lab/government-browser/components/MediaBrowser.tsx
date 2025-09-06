'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { Media, EntityType } from '../../../types';

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

interface MediaBrowserProps {
  isAuthorized: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  breadcrumbs?: BreadcrumbItem[];
  onMediaSelect?: (media: any) => void;
  currentEntityFilter?: string | null;
}

const MEDIA_TYPES = [
  'image', 'document', 'video', 'audio', 'archive', 'other'
];

const ENTITY_TYPES: EntityType[] = [
  'User', 'Obligation', 'Claim', 'Evidence', 'Jurisdiction', 'GoverningBody', 'Office', 'Position'
];

export default function MediaBrowser({ 
  isAuthorized, 
  isLoading, 
  setIsLoading,
  breadcrumbs = [],
  onMediaSelect,
  currentEntityFilter
}: MediaBrowserProps) {
  const { resolvedTheme } = useTheme();
  const [media, setMedia] = useState<Media[]>([]);
  const [entityOptions, setEntityOptions] = useState<{ value: string; label: string }[]>([]);

  // Theme-aware class names
  const themeClasses = {
    text: resolvedTheme === 'dark' ? 'text-foreground' : 'text-foreground',
    textSecondary: resolvedTheme === 'dark' ? 'text-neutral-light' : 'text-neutral-dark',
    textMuted: resolvedTheme === 'dark' ? 'text-neutral' : 'text-neutral',
    link: resolvedTheme === 'dark' 
      ? 'text-primary-light hover:text-primary focus:ring-primary-light' 
      : 'text-primary hover:text-primary-dark focus:ring-primary',
    badge: {
      image: resolvedTheme === 'dark' ? 'bg-blue-900/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200',
      document: resolvedTheme === 'dark' ? 'bg-green-900/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200',
      video: resolvedTheme === 'dark' ? 'bg-purple-900/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-200',
      audio: resolvedTheme === 'dark' ? 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
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

  // Fetch media data
  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { key: 'filename', label: 'Filename', sortable: true },
    { key: 'mediaType', label: 'Type', sortable: true },
    { key: 'entityType', label: 'Entity Type', sortable: true },
    { key: 'entityId', label: 'Entity ID', sortable: true },
    { key: 'bytes', label: 'Size', sortable: true },
    { key: 'isPrimary', label: 'Primary', sortable: true },
    { key: 'createdAt', label: 'Uploaded', sortable: true }
  ];

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters for the new v1 API
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('page_size', '50');
      
      // Add filters using the new v1 API filter format
      if (currentEntityFilter) {
        params.append('filter[entityId]', currentEntityFilter);
      }
      
      // Use the new v1 API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/media?${params.toString()}`);
      const data = await response.json();
      
      if (data.data) {
        setMedia(data.data);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, currentEntityFilter]);

  const getMediaTypeBadgeClass = (type: string) => {
    return themeClasses.badge[type as keyof typeof themeClasses.badge] || themeClasses.badge.default;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    if (bytes >= 1073741824) {
      return `${(bytes / 1073741824).toFixed(1)} GB`;
    } else if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} B`;
  };

  const renderCell = (item: any, column: { key: string; label: string }) => {
    switch (column.key) {
      case 'mediaType':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMediaTypeBadgeClass(item.mediaType)}`}>
            {item.mediaType?.charAt(0).toUpperCase() + item.mediaType?.slice(1) || 'N/A'}
          </span>
        );
      case 'entityType':
        return (
          <span className="capitalize">
            {item.entityType || 'N/A'}
          </span>
        );
      case 'entityId':
        return item.entityId || 'N/A';
      case 'bytes':
        return formatFileSize(item.bytes);
      case 'isPrimary':
        return item.isPrimary ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            Primary
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Secondary
          </span>
        );
      case 'createdAt':
        return formatDate(item.createdAt);
      default:
        return item[column.key];
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral text-lg mb-4">📁</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Media</h3>
        <p className="text-neutral mb-6">Loading media files...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-neutral text-lg mb-4">📁</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Media</h3>
        <p className="text-neutral mb-6">Browse and manage media files across all entities.</p>
      </div>

      {/* Info */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-primary">
          {media.length === 0 
            ? 'No media files found.' 
            : `${media.length} media file${media.length !== 1 ? 's' : ''} found.`
          }
        </p>
      </div>

      {/* Results */}
      {media.length > 0 && (
        <div className="bg-surface rounded-lg border border-neutral-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-light">
              <thead className="bg-neutral-light">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-neutral-light">
                {media.map((mediaItem) => (
                  <tr
                    key={mediaItem._id}
                    className="hover:bg-neutral-light cursor-pointer"
                    onClick={() => onMediaSelect?.(mediaItem)}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {renderCell(mediaItem, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
                  </div>
                  </div>
                )}

      {/* Coming Soon Notice */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
        <h4 className="text-lg font-semibold text-primary mb-2">Enhanced Media Management</h4>
        <p className="text-sm text-primary/80 mb-4">
          This feature will allow you to upload, organize, and manage media files with full metadata tracking, 
          version control, and media library tools.
        </p>
        <div className="text-xs text-primary/60">
          <p>• Upload and organize media files</p>
          <p>• Manage media metadata and descriptions</p>
          <p>• Track media usage across entities</p>
          <p>• Generate media reports and analytics</p>
                  </div>
              </div>
            </div>
  );
}
