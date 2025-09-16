import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { createWriteStream, createReadStream } from 'fs';
import { UserNodeModel } from '../models/index.js';
import { config } from '../config/index.js';

export interface AvatarCacheInfo {
  url: string;
  cachedAt: Date;
  lastChecked: Date;
  isGoogleAvatar: boolean;
  filePath: string;
  contentType: string;
}

export class AvatarService {
  private static readonly CACHE_DIR = path.join(process.cwd(), 'uploads', 'avatars');
  private static readonly MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly GOOGLE_AVATAR_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  /**
   * Initialize the avatar service by ensuring cache directory exists
   */
  static async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.CACHE_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create avatar cache directory:', error);
      throw error;
    }
  }

  /**
   * Get avatar URL for a user, caching if necessary
   */
  static async getAvatarUrl(userId: string): Promise<string | null> {
    try {
      const user = await UserNodeModel.findById(userId);
      if (!user || !user.avatar) {
        return null;
      }

      // Check if we need to refresh the cache
      const shouldRefresh = await this.shouldRefreshCache(user.avatar);
      
      if (shouldRefresh) {
        await this.refreshAvatarCache(user.avatar);
      }

      // Return cached avatar URL
      return this.getCachedAvatarUrl(user.avatar);
    } catch (error) {
      console.error('Error getting avatar URL:', error);
      return null;
    }
  }

  /**
   * Update user's avatar (either from Google or custom upload)
   */
  static async updateUserAvatar(userId: string, avatarUrl: string): Promise<boolean> {
    try {
      const user = await UserNodeModel.findById(userId);
      if (!user) {
        return false;
      }

      // Cache the new avatar
      await this.cacheAvatar(avatarUrl);

      // Update user record
      user.avatar = avatarUrl;
      user.updatedAt = new Date();
      await user.save();

      return true;
    } catch (error) {
      console.error('Error updating user avatar:', error);
      return false;
    }
  }

  /**
   * Upload and cache a custom avatar file
   */
  static async uploadCustomAvatar(userId: string, fileBuffer: Buffer, contentType: string): Promise<string | null> {
    try {
      // Validate file type
      if (!this.isValidImageType(contentType)) {
        throw new Error('Invalid image type');
      }

      // Generate unique filename
      const extension = this.getExtensionFromContentType(contentType);
      const filename = `${userId}_${Date.now()}${extension}`;
      const filePath = path.join(this.CACHE_DIR, filename);

      // Write file
      await fs.writeFile(filePath, fileBuffer);

      // Generate avatar URL
      const avatarUrl = `/api/avatars/${filename}`;

      // Update user record
      const success = await this.updateUserAvatar(userId, avatarUrl);
      
      return success ? avatarUrl : null;
    } catch (error) {
      console.error('Error uploading custom avatar:', error);
      return null;
    }
  }

  /**
   * Refresh avatar cache for a specific URL
   */
  static async refreshAvatarCache(avatarUrl: string): Promise<void> {
    try {
      if (this.isGoogleAvatar(avatarUrl)) {
        await this.cacheGoogleAvatar(avatarUrl);
      }
      // For custom avatars, no refresh needed as they're already cached
    } catch (error) {
      console.error('Error refreshing avatar cache:', error);
    }
  }

  /**
   * Clean up old cached avatars
   */
  static async cleanupOldAvatars(): Promise<void> {
    try {
      const files = await fs.readdir(this.CACHE_DIR);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.CACHE_DIR, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > this.MAX_CACHE_AGE) {
          await fs.unlink(filePath);
          console.log(`Cleaned up old avatar: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old avatars:', error);
    }
  }

  /**
   * Get avatar file path for serving
   */
  static getAvatarFilePath(avatarUrl: string): string | null {
    if (avatarUrl.startsWith('/api/avatars/')) {
      const filename = path.basename(avatarUrl);
      return path.join(this.CACHE_DIR, filename);
    }
    return null;
  }

  /**
   * Check if avatar URL is from Google
   */
  private static isGoogleAvatar(url: string): boolean {
    return url.includes('googleusercontent.com') || url.includes('googleapis.com');
  }

  /**
   * Check if we should refresh the cache for this avatar
   */
  private static async shouldRefreshCache(avatarUrl: string): Promise<boolean> {
    if (!this.isGoogleAvatar(avatarUrl)) {
      return false; // Custom avatars don't need refresh
    }

    const cacheInfo = await this.getCacheInfo(avatarUrl);
    if (!cacheInfo) {
      return true; // Not cached yet
    }

    const now = Date.now();
    const timeSinceLastCheck = now - cacheInfo.lastChecked.getTime();
    
    return timeSinceLastCheck > this.GOOGLE_AVATAR_CHECK_INTERVAL;
  }

  /**
   * Cache a Google avatar
   */
  private static async cacheGoogleAvatar(avatarUrl: string): Promise<void> {
    try {
      const response = await fetch(avatarUrl, {
        headers: {
          'User-Agent': 'WhitePine-AvatarCache/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch avatar: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const extension = this.getExtensionFromContentType(contentType);
      const filename = this.generateCacheFilename(avatarUrl, extension);
      const filePath = path.join(this.CACHE_DIR, filename);

      // Download and save the file
      const fileStream = createWriteStream(filePath);
      await pipeline(response.body!, fileStream);

      console.log(`Cached Google avatar: ${filename}`);
    } catch (error) {
      console.error('Error caching Google avatar:', error);
      throw error;
    }
  }

  /**
   * Cache any avatar URL
   */
  private static async cacheAvatar(avatarUrl: string): Promise<void> {
    if (this.isGoogleAvatar(avatarUrl)) {
      await this.cacheGoogleAvatar(avatarUrl);
    }
    // Custom avatars are already cached when uploaded
  }

  /**
   * Get cached avatar URL
   */
  private static getCachedAvatarUrl(originalUrl: string): string {
    if (originalUrl.startsWith('/api/avatars/')) {
      return originalUrl; // Already a cached URL
    }

    if (this.isGoogleAvatar(originalUrl)) {
      const extension = this.getExtensionFromContentType('image/jpeg'); // Default
      const filename = this.generateCacheFilename(originalUrl, extension);
      return `/api/avatars/${filename}`;
    }

    return originalUrl; // Return as-is for other URLs
  }

  /**
   * Generate cache filename for an avatar URL
   */
  private static generateCacheFilename(url: string, extension: string): string {
    const hash = crypto.createHash('md5').update(url).digest('hex');
    return `${hash}${extension}`;
  }

  /**
   * Get cache info for an avatar URL
   */
  private static async getCacheInfo(avatarUrl: string): Promise<AvatarCacheInfo | null> {
    if (!this.isGoogleAvatar(avatarUrl)) {
      return null;
    }

    const extension = this.getExtensionFromContentType('image/jpeg');
    const filename = this.generateCacheFilename(avatarUrl, extension);
    const filePath = path.join(this.CACHE_DIR, filename);

    try {
      const stats = await fs.stat(filePath);
      return {
        url: avatarUrl,
        cachedAt: stats.birthtime,
        lastChecked: stats.mtime,
        isGoogleAvatar: true,
        filePath,
        contentType: 'image/jpeg'
      };
    } catch {
      return null;
    }
  }

  /**
   * Validate image content type
   */
  private static isValidImageType(contentType: string): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(contentType.toLowerCase());
  }

  /**
   * Get file extension from content type
   */
  private static getExtensionFromContentType(contentType: string): string {
    const typeMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp'
    };
    
    return typeMap[contentType.toLowerCase()] || '.jpg';
  }
}
