'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, User } from 'lucide-react';
import { AvatarService } from '@/lib/avatar-service';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userId: string;
  userName?: string;
  onAvatarChange?: (newAvatarUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  showControls?: boolean;
}

export function AvatarUpload({
  currentAvatarUrl,
  userId,
  userName = 'User',
  onAvatarChange,
  size = 'md',
  showControls = true
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = AvatarService.validateAvatarFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await AvatarService.uploadAvatar(file);
      
      if (result.success && result.avatarUrl) {
        setSuccess('Avatar uploaded successfully!');
        onAvatarChange?.(result.avatarUrl);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Avatar upload error:', error);
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await AvatarService.refreshAvatarCache(userId);
      
      if (result.success) {
        setSuccess('Avatar cache refreshed!');
        // Trigger a re-render by calling onAvatarChange with current URL
        onAvatarChange?.(currentAvatarUrl || null);
      } else {
        setError(result.error || 'Refresh failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Avatar refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await AvatarService.removeAvatar();
      
      if (result.success) {
        setSuccess('Avatar removed successfully!');
        onAvatarChange?.(null);
      } else {
        setError(result.error || 'Remove failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Avatar removal error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = AvatarService.getAvatarDisplayUrl(currentAvatarUrl);

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Avatar Display */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={userName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`${displayUrl ? 'hidden' : ''} ${iconSizes[size]} text-gray-500`}>
            <User className="w-full h-full" />
          </div>
        </div>

        {/* Loading overlay */}
        {(isUploading || isRefreshing) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex space-x-2">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRefreshing}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="Upload new avatar"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Refresh Button (only for Google avatars) */}
          {currentAvatarUrl && (currentAvatarUrl.includes('googleusercontent.com') || currentAvatarUrl.includes('googleapis.com')) && (
            <button
              onClick={handleRefreshCache}
              disabled={isUploading || isRefreshing}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Refresh avatar cache"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Remove Button */}
          {currentAvatarUrl && (
            <button
              onClick={handleRemoveAvatar}
              disabled={isUploading || isRefreshing}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
              title="Remove avatar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Messages */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
          {success}
        </div>
      )}
    </div>
  );
}
