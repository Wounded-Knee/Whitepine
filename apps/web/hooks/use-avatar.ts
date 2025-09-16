'use client';

import { useState, useEffect, useCallback } from 'react';
import { AvatarService } from '@/lib/avatar-service';

interface UseAvatarOptions {
  userId: string;
  initialAvatarUrl?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useAvatar({
  userId,
  initialAvatarUrl,
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}: UseAvatarOptions) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch avatar URL from API
  const fetchAvatar = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = await AvatarService.getUserAvatarUrl(userId);
      setAvatarUrl(url);
    } catch (err) {
      setError('Failed to fetch avatar');
      console.error('Avatar fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update avatar URL
  const updateAvatar = useCallback((newUrl: string | null) => {
    setAvatarUrl(newUrl);
    setError(null);
  }, []);

  // Refresh avatar cache
  const refreshAvatar = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await AvatarService.refreshAvatarCache(userId);
      if (result.success) {
        // Re-fetch the avatar URL after refresh
        await fetchAvatar();
      } else {
        setError(result.error || 'Failed to refresh avatar');
      }
    } catch (err) {
      setError('Failed to refresh avatar');
      console.error('Avatar refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchAvatar]);

  // Upload new avatar
  const uploadAvatar = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AvatarService.uploadAvatar(file);
      if (result.success && result.avatarUrl) {
        setAvatarUrl(result.avatarUrl);
        return { success: true, message: result.message };
      } else {
        setError(result.error || 'Upload failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Upload failed';
      setError(errorMsg);
      console.error('Avatar upload error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update avatar URL
  const updateAvatarUrl = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AvatarService.updateAvatarUrl(url);
      if (result.success) {
        setAvatarUrl(url);
        return { success: true, message: result.message };
      } else {
        setError(result.error || 'Update failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Update failed';
      setError(errorMsg);
      console.error('Avatar update error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remove avatar
  const removeAvatar = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AvatarService.removeAvatar();
      if (result.success) {
        setAvatarUrl(null);
        return { success: true, message: result.message };
      } else {
        setError(result.error || 'Remove failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Remove failed';
      setError(errorMsg);
      console.error('Avatar removal error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get display URL
  const getDisplayUrl = useCallback(() => {
    return AvatarService.getAvatarDisplayUrl(avatarUrl);
  }, [avatarUrl]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      fetchAvatar();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, userId, refreshInterval, fetchAvatar]);

  // Initial fetch
  useEffect(() => {
    if (userId && !initialAvatarUrl) {
      fetchAvatar();
    }
  }, [userId, initialAvatarUrl, fetchAvatar]);

  return {
    avatarUrl,
    displayUrl: getDisplayUrl(),
    isLoading,
    error,
    fetchAvatar,
    updateAvatar,
    refreshAvatar,
    uploadAvatar,
    updateAvatarUrl,
    removeAvatar,
    isGoogleAvatar: avatarUrl ? 
      (avatarUrl.includes('googleusercontent.com') || avatarUrl.includes('googleapis.com')) : 
      false
  };
}
