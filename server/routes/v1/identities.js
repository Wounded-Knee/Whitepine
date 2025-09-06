const express = require('express');
const { verifyToken, requireScope } = require('../../middleware/authorization');
const { generalLimiter, securityHeaders } = require('../../middleware/security');
const { success, error } = require('../../utils/response');
const { Identity } = require('../../models/Identity/Identity');

const router = express.Router();

// Apply security headers to all identity routes
router.use(securityHeaders);

// GET /v1/identities - Get all identities with optional filtering
router.get('/',
  verifyToken,
  requireScope('identities:read'),
  generalLimiter,
  async (req, res) => {
    try {
      const { 
        level, 
        parentId, 
        category, 
        search, 
        limit = 100, 
        skip = 0,
        sortBy = 'level',
        sortOrder = 'asc'
      } = req.query;

      // Build query
      const query = { isActive: true };
      
      if (level !== undefined) {
        query.level = parseInt(level);
      }
      
      if (parentId !== undefined) {
        query.parentId = parentId === 'null' ? null : parentId;
      }
      
      if (category) {
        // Find top-level identity by slug and get its descendants
        const categoryIdentity = await Identity.findOne({ slug: category, isActive: true });
        if (categoryIdentity) {
          query.path = { $in: [categoryIdentity._id] };
        }
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { abbr: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const identities = await Identity.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('parent', '_id name slug abbr color')
        .populate('children', '_id name slug abbr color level');

      const total = await Identity.countDocuments(query);

      return success(res, {
        identities,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: skip + identities.length < total
        }
      });

    } catch (err) {
      console.error('Get identities error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get identities',
        status: 500,
        detail: 'Failed to retrieve identities',
      });
    }
  }
);

// GET /v1/identities/hierarchy - Get identities organized by hierarchy
router.get('/hierarchy',
  verifyToken,
  requireScope('identities:read'),
  generalLimiter,
  async (req, res) => {
    try {
      const { category } = req.query;
      
      let query = { isActive: true };
      
      if (category) {
        const categoryIdentity = await Identity.findOne({ slug: category, isActive: true });
        if (categoryIdentity) {
          query.path = { $in: [categoryIdentity._id] };
        }
      }

      const identities = await Identity.find(query)
        .sort({ level: 1, name: 1 })
        .populate('parent', '_id name slug abbr color')
        .populate('children', '_id name slug abbr color level');

      // Organize into hierarchy
      const hierarchy = {};
      const identityMap = new Map();

      // Create map for quick lookup
      identities.forEach(identity => {
        identityMap.set(identity._id, identity);
      });

      // Build hierarchy
      identities.forEach(identity => {
        if (identity.level === 0) {
          // Top level
          hierarchy[identity._id] = {
            ...identity.toObject(),
            children: []
          };
        } else if (identity.parentId && identityMap.has(identity.parentId)) {
          // Add to parent's children
          const parent = identityMap.get(identity.parentId);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(identity);
          }
        }
      });

      // Convert to array and sort
      const result = Object.values(hierarchy).sort((a, b) => a.name.localeCompare(b.name));

      return success(res, result);

    } catch (err) {
      console.error('Get identities hierarchy error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get identities hierarchy',
        status: 500,
        detail: 'Failed to retrieve identities hierarchy',
      });
    }
  }
);

// GET /v1/identities/categories - Get top-level identity categories
router.get('/categories',
  verifyToken,
  requireScope('identities:read'),
  generalLimiter,
  async (req, res) => {
    try {
      const categories = await Identity.find({ 
        level: 0, 
        isActive: true 
      })
      .select('_id name slug abbr color description')
      .sort({ name: 1 });

      return success(res, categories);

    } catch (err) {
      console.error('Get identity categories error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get identity categories',
        status: 500,
        detail: 'Failed to retrieve identity categories',
      });
    }
  }
);

// GET /v1/identities/:id - Get specific identity by ID
router.get('/:id',
  verifyToken,
  requireScope('identities:read'),
  generalLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const identity = await Identity.findOne({ 
        $or: [
          { _id: id },
          { slug: id }
        ],
        isActive: true 
      })
      .populate('parent', 'id name slug abbr color')
      .populate('children', 'id name slug abbr color level description');

      if (!identity) {
        return error(res, {
          type: '${process.env.NEXT_PUBLIC_API_URL}/errors/not-found',
          title: 'Identity not found',
          status: 404,
          detail: 'The requested identity could not be found',
        });
      }

      return success(res, identity);

    } catch (err) {
      console.error('Get identity error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get identity',
        status: 500,
        detail: 'Failed to retrieve identity',
      });
    }
  }
);

// GET /v1/identities/:id/descendants - Get all descendants of an identity
router.get('/:id/descendants',
  verifyToken,
  requireScope('identities:read'),
  generalLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const identity = await Identity.findOne({ 
        $or: [
          { _id: id },
          { slug: id }
        ],
        isActive: true 
      });

      if (!identity) {
        return error(res, {
          type: '${process.env.NEXT_PUBLIC_API_URL}/errors/not-found',
          title: 'Identity not found',
          status: 404,
          detail: 'The requested identity could not be found',
        });
      }

      const descendants = await Identity.find({ 
        path: { $in: [identity._id] },
        isActive: true 
      })
      .sort({ level: 1, name: 1 })
      .select('_id name slug abbr color level description parentId');

      return success(res, descendants);

    } catch (err) {
      console.error('Get identity descendants error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get identity descendants',
        status: 500,
        detail: 'Failed to retrieve identity descendants',
      });
    }
  }
);

module.exports = router;
