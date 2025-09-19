import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { AvatarService } from '../services/avatarService.js';
import { SchedulerService } from '../services/schedulerService.js';
import { UserNodeModel } from '../models/index.js';
import { decodeNodeId } from '@whitepine/types';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

/**
 * GET /api/avatars/:filename
 * Serve cached avatar files
 */
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'avatars', filename);
    
    try {
      await fs.access(filePath);
      res.sendFile(filePath);
    } catch {
      res.status(404).json({ error: 'Avatar not found' });
    }
  } catch (error) {
    console.error('Error serving avatar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/avatars/user/:userId
 * Get user's avatar URL (cached)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const avatarUrl = await AvatarService.getAvatarUrl(userId);
    
    if (!avatarUrl) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    res.json({ avatarUrl });
  } catch (error) {
    console.error('Error getting user avatar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/avatars/upload
 * Upload a custom avatar for the authenticated user
 */
router.post('/upload', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = (req.user as any).id;
    const decodedUserId = decodeNodeId(userId).toString();
    const avatarUrl = await AvatarService.uploadCustomAvatar(
      decodedUserId,
      req.file.buffer,
      req.file.mimetype
    );

    if (!avatarUrl) {
      return res.status(500).json({ error: 'Failed to upload avatar' });
    }

    res.json({ 
      success: true, 
      avatarUrl,
      message: 'Avatar uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/avatars/update
 * Update user's avatar URL (for Google avatars or external URLs)
 */
router.put('/update', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { avatarUrl } = req.body;
    
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return res.status(400).json({ error: 'Valid avatar URL is required' });
    }

    const userId = (req.user as any).id;
    const decodedUserId = decodeNodeId(userId).toString();
    const success = await AvatarService.updateUserAvatar(decodedUserId, avatarUrl);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update avatar' });
    }

    res.json({ 
      success: true, 
      message: 'Avatar updated successfully' 
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/avatars/refresh/:userId
 * Manually refresh avatar cache for a user
 */
router.post('/refresh/:userId', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { userId } = req.params;
    const currentUserId = (req.user as any).id;
    const decodedCurrentUserId = decodeNodeId(currentUserId).toString();

    // Users can only refresh their own avatars (or admin check could be added)
    if (userId !== decodedCurrentUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await UserNodeModel.findById(userId);
    if (!user || !user.avatar) {
      return res.status(404).json({ error: 'User or avatar not found' });
    }

    await AvatarService.refreshAvatarCache(user.avatar);

    res.json({ 
      success: true, 
      message: 'Avatar cache refreshed successfully' 
    });
  } catch (error) {
    console.error('Error refreshing avatar cache:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/avatars/remove
 * Remove user's avatar (set to null)
 */
router.delete('/remove', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = (req.user as any).id;
    const decodedUserId = decodeNodeId(userId).toString();
    const user = await UserNodeModel.findById(decodedUserId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.avatar = undefined;
    user.updatedAt = new Date();
    await user.save();

    res.json({ 
      success: true, 
      message: 'Avatar removed successfully' 
    });
  } catch (error) {
    console.error('Error removing avatar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/avatars/cleanup
 * Clean up old cached avatars (admin endpoint)
 */
router.post('/cleanup', async (req, res) => {
  try {
    // Add admin check here if needed
    await AvatarService.cleanupOldAvatars();
    
    res.json({ 
      success: true, 
      message: 'Avatar cleanup completed' 
    });
  } catch (error) {
    console.error('Error cleaning up avatars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/avatars/refresh-all
 * Manually refresh all Google avatars (admin endpoint)
 */
router.post('/refresh-all', async (req, res) => {
  try {
    // Add admin check here if needed
    await SchedulerService.triggerAvatarRefresh();
    
    res.json({ 
      success: true, 
      message: 'All Google avatars refresh triggered' 
    });
  } catch (error) {
    console.error('Error refreshing all avatars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as avatarRoutes };
