import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export interface AvatarUploadResponse {
  success: boolean;
  avatarUrl?: string;
  message?: string;
  error?: string;
}

export interface AvatarUpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class AvatarService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  /**
   * Get user's avatar URL (cached)
   */
  static async getUserAvatarUrl(userId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.API_BASE}/api/avatars/user/${userId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.avatarUrl || null;
    } catch (error) {
      console.error('Error fetching user avatar:', error);
      return null;
    }
  }

  /**
   * Upload a custom avatar file
   */
  static async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${this.API_BASE}/api/avatars/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Upload failed'
        };
      }

      return {
        success: true,
        avatarUrl: data.avatarUrl,
        message: data.message
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return {
        success: false,
        error: 'Network error during upload'
      };
    }
  }

  /**
   * Update user's avatar URL (for Google avatars or external URLs)
   */
  static async updateAvatarUrl(avatarUrl: string): Promise<AvatarUpdateResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/api/avatars/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarUrl }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Update failed'
        };
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Error updating avatar URL:', error);
      return {
        success: false,
        error: 'Network error during update'
      };
    }
  }

  /**
   * Refresh avatar cache for current user
   */
  static async refreshAvatarCache(userId: string): Promise<AvatarUpdateResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/api/avatars/refresh/${userId}`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Refresh failed'
        };
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Error refreshing avatar cache:', error);
      return {
        success: false,
        error: 'Network error during refresh'
      };
    }
  }

  /**
   * Remove user's avatar
   */
  static async removeAvatar(): Promise<AvatarUpdateResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/api/avatars/remove`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Remove failed'
        };
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Error removing avatar:', error);
      return {
        success: false,
        error: 'Network error during removal'
      };
    }
  }

  /**
   * Get avatar URL for display (handles both cached and direct URLs)
   */
  static getAvatarDisplayUrl(avatarUrl: string | undefined | null): string | null {
    if (!avatarUrl) {
      return null;
    }

    // If it's already a cached URL, return as-is
    if (avatarUrl.startsWith('/api/avatars/')) {
      const apiBase = this.API_BASE;
      return `${apiBase}${avatarUrl}`;
    }

    // For Google avatars or other external URLs, return as-is
    // The backend will handle caching automatically
    return avatarUrl;
  }

  /**
   * Validate file for avatar upload
   */
  static validateAvatarFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 5MB'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File must be an image (JPEG, PNG, GIF, or WebP)'
      };
    }

    return { valid: true };
  }
}
