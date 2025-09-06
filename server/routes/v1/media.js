const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Media = require('../../models/Media');
const { validate, schemas } = require('../../middleware/validation');
const { verifyToken, requireScope, requireOwnership } = require('../../middleware/authorization');
const { generalLimiter, uploadLimiter, securityHeaders } = require('../../middleware/security');
const { success, error, notFound, validationError } = require('../../utils/response');
const { paginate, buildPaginationMeta, buildFilter, buildSort, selectFields } = require('../../utils/response');

const router = express.Router();

// Apply security headers to all media routes
router.use(securityHeaders);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/media');
    fs.mkdir(uploadDir, { recursive: true }).then(() => cb(null, uploadDir));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed'));
    }
  }
});

// GET /v1/media
router.get('/',
  verifyToken,
  requireScope('media:read'),
  generalLimiter,
  async (req, res) => {
    try {
      const { 
        page = 1, 
        page_size = 20, 
        filter, 
        sort, 
        fields,
        entityType,
        entityId,
        mediaType
      } = req.query;
      
      // Build query
      let query = Media.find();
      
      // Apply filters
      if (filter) {
        const filterObj = buildFilter(filter);
        query = query.where(filterObj);
      }
      
      // Apply specific filters
      if (entityType) query = query.where({ entityType });
      if (entityId) query = query.where({ entityId });
      if (mediaType) query = query.where({ mediaType });
      
      // Apply field selection
      const projection = selectFields(fields);
      if (Object.keys(projection).length > 0) {
        query = query.select(projection);
      }
      
      // Apply sorting
      const sortObj = buildSort(sort);
      query = query.sort(sortObj);
      
      // Apply pagination
      const { query: paginatedQuery, pagination } = paginate(query, page, page_size);
      
      // Populate uploaded by
      const populatedQuery = paginatedQuery.populate('uploadedBy', 'username firstName lastName');
      
      // Execute query
      const media = await populatedQuery;
      const total = await Media.countDocuments();
      
      // Build response
      const meta = buildPaginationMeta(media, total, pagination);
      
      return success(res, media, 200, meta);
      
    } catch (err) {
      console.error('Get media error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get media',
        status: 500,
        detail: 'Failed to retrieve media',
      });
    }
  }
);

// POST /v1/media
router.post('/',
  verifyToken,
  requireScope('media:write'),
  uploadLimiter,
  upload.single('file'),
  async (req, res) => {
    try {
      const { entityType, entityId, description, isPrimary = false } = req.body;
      
      if (!req.file) {
        return validationError(res, {
          file: ['File is required']
        });
      }
      
      if (!entityType || !entityId) {
        return validationError(res, {
          entityType: ['Entity type is required'],
          entityId: ['Entity ID is required']
        });
      }
      
      // Determine media type based on file extension
      const ext = path.extname(req.file.originalname).toLowerCase();
      let mediaType = 'document';
      
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        mediaType = 'image';
      } else if (['.pdf'].includes(ext)) {
        mediaType = 'pdf';
      }
      
      // Create media record
      const media = new Media({
        entityType,
        entityId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mediaType,
        bytes: req.file.size,
        mime: req.file.mimetype,
        url: `/uploads/media/${req.file.filename}`,
        description,
        isPrimary,
        uploadedBy: req.user.id,
      });
      
      await media.save();
      
      // Set as primary if requested
      if (isPrimary) {
        await Media.updateMany(
          {
            entityType,
            entityId,
            _id: { $ne: media._id }
          },
          { isPrimary: false }
        );
      }
      
      return success(res, {
        id: media._id,
        filename: media.filename,
        originalName: media.originalName,
        mediaType: media.mediaType,
        bytes: media.bytes,
        mime: media.mime,
        url: media.url,
        description: media.description,
        isPrimary: media.isPrimary,
        entityType: media.entityType,
        entityId: media.entityId,
        createdAt: media.createdAt,
      }, 201);
      
    } catch (err) {
      console.error('Upload media error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to upload media',
        status: 500,
        detail: 'Failed to upload media file',
      });
    }
  }
);

// GET /v1/media/:mediaId
router.get('/:mediaId',
  verifyToken,
  requireScope('media:read'),
  generalLimiter,
  async (req, res) => {
    try {
      const { mediaId } = req.params;
      const { fields } = req.query;
      
      // Build query
      let query = Media.findById(mediaId);
      
      // Apply field selection
      const projection = selectFields(fields);
      if (Object.keys(projection).length > 0) {
        query = query.select(projection);
      }
      
      // Populate uploaded by
      const populatedQuery = query.populate('uploadedBy', 'username firstName lastName');
      
      const media = await populatedQuery;
      
      if (!media) {
        return notFound(res, 'Media');
      }
      
      return success(res, media);
      
    } catch (err) {
      console.error('Get media error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get media',
        status: 500,
        detail: 'Failed to retrieve media',
      });
    }
  }
);

// PATCH /v1/media/:mediaId
router.patch('/:mediaId',
  verifyToken,
  requireOwnership('media'),
  generalLimiter,
  async (req, res) => {
    try {
      const { mediaId } = req.params;
      const { description, isPrimary } = req.body;
      
      const updateData = {};
      if (description !== undefined) updateData.description = description;
      if (isPrimary !== undefined) updateData.isPrimary = isPrimary;
      
      const media = await Media.findByIdAndUpdate(
        mediaId,
        updateData,
        { new: true, runValidators: true }
      ).populate('uploadedBy', 'username firstName lastName');
      
      if (!media) {
        return notFound(res, 'Media');
      }
      
      // Set as primary if requested
      if (isPrimary) {
        await Media.updateMany(
          {
            entityType: media.entityType,
            entityId: media.entityId,
            _id: { $ne: media._id }
          },
          { isPrimary: false }
        );
      }
      
      return success(res, media);
      
    } catch (err) {
      console.error('Update media error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to update media',
        status: 500,
        detail: 'Failed to update media',
      });
    }
  }
);

// DELETE /v1/media/:mediaId
router.delete('/:mediaId',
  verifyToken,
  requireOwnership('media'),
  generalLimiter,
  async (req, res) => {
    try {
      const { mediaId } = req.params;
      
      const media = await Media.findById(mediaId);
      
      if (!media) {
        return notFound(res, 'Media');
      }
      
      // Delete file from filesystem
      try {
        const filePath = path.join(__dirname, '../../uploads/media', media.filename);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('Failed to delete file from filesystem:', fileError);
      }
      
      // Delete from database
      await Media.findByIdAndDelete(mediaId);
      
      return success(res, { message: 'Media deleted successfully' });
      
    } catch (err) {
      console.error('Delete media error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to delete media',
        status: 500,
        detail: 'Failed to delete media',
      });
    }
  }
);

module.exports = router;

