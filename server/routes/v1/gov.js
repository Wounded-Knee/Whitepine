const express = require('express');
const { Jurisdiction, GoverningBody, Office, Position, Election, Legislation } = require('../../models/Government');
const { verifyToken, requireScope, optionalAuth } = require('../../middleware/authorization');
const { generalLimiter, securityHeaders } = require('../../middleware/security');
const { success, error, notFound } = require('../../utils/response');
const { paginate, buildPaginationMeta, buildFilter, buildSort, selectFields } = require('../../utils/response');

const router = express.Router();

// Apply security headers to all government routes
router.use(securityHeaders);

// GET /v1/gov/jurisdictions
router.get('/jurisdictions',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { page = 1, page_size = 50, filter, sort, fields, level, parentId } = req.query;
      
      // Build query
      let query = Jurisdiction.find({});
      
      // Apply filters
      if (filter) {
        const filterObj = buildFilter(filter);
        query = query.where(filterObj);
      }
      
      // Apply specific filters
      if (level) query = query.where({ level });
      if (parentId) query = query.where({ parent: parentId });
      
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
      
      // Execute query
      const jurisdictions = await paginatedQuery;
      const total = await Jurisdiction.countDocuments({});
      
      // Build response
      const meta = buildPaginationMeta(jurisdictions, total, pagination);
      
      return success(res, jurisdictions, 200, meta);
      
    } catch (err) {
      console.error('Get jurisdictions error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get jurisdictions',
        status: 500,
        detail: 'Failed to retrieve jurisdictions',
      });
    }
  }
);

// GET /v1/gov/jurisdictions/:id
router.get('/jurisdictions/:id',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      // Build query
      let query = Jurisdiction.findById(id);
      
      // Apply field selection
      const projection = selectFields(fields);
      if (Object.keys(projection).length > 0) {
        query = query.select(projection);
      }
      
      const jurisdiction = await query;
      
      if (!jurisdiction) {
        return notFound(res, 'Jurisdiction');
      }
      
      // Build hierarchy array
      const hierarchy = [];
      let current = jurisdiction;
      
      while (current) {
        hierarchy.unshift({
          id: current._id,
          name: current.name,
          slug: current.slug,
          level: current.level,
        });
        
        if (current.parent) {
          current = await Jurisdiction.findById(current.parent);
        } else {
          current = null;
        }
      }
      
      return success(res, {
        ...jurisdiction.toObject(),
        hierarchy,
      });
      
    } catch (err) {
      console.error('Get jurisdiction error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get jurisdiction',
        status: 500,
        detail: 'Failed to retrieve jurisdiction',
      });
    }
  }
);

// GET /v1/gov/governing-bodies
router.get('/governing-bodies',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { page = 1, page_size = 50, filter, sort, fields, jurisdictionId, branch, entity_type } = req.query;
      
      // Build query
      let query = GoverningBody.find({});
      
      // Apply filters
      if (filter) {
        const filterObj = buildFilter(filter);
        query = query.where(filterObj);
      }
      
      // Apply specific filters
      if (jurisdictionId) query = query.where({ jurisdiction: jurisdictionId });
      if (branch) query = query.where({ branch });
      if (entity_type) query = query.where({ entity_type });
      
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
      
      // Populate jurisdiction
      const populatedQuery = paginatedQuery.populate('jurisdiction', 'name slug');
      
      // Execute query
      const governingBodies = await populatedQuery;
      const total = await GoverningBody.countDocuments({});
      
      // Build response
      const meta = buildPaginationMeta(governingBodies, total, pagination);
      
      return success(res, governingBodies, 200, meta);
      
    } catch (err) {
      console.error('Get governing bodies error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get governing bodies',
        status: 500,
        detail: 'Failed to retrieve governing bodies',
      });
    }
  }
);

// GET /v1/gov/governing-bodies/:id
router.get('/governing-bodies/:id',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      // Build query
      let query = GoverningBody.findById(id);
      
      // Apply field selection
      const projection = selectFields(fields);
      if (Object.keys(projection).length > 0) {
        query = query.select(projection);
      }
      
      // Populate jurisdiction
      const populatedQuery = query.populate('jurisdiction', 'name slug');
      
      const governingBody = await populatedQuery;
      
      if (!governingBody) {
        return notFound(res, 'Governing body');
      }
      
      return success(res, governingBody);
      
    } catch (err) {
      console.error('Get governing body error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get governing body',
        status: 500,
        detail: 'Failed to retrieve governing body',
      });
    }
  }
);

// GET /v1/gov/offices
router.get('/offices',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { page = 1, page_size = 50, filter, sort, fields, governingBodyId } = req.query;
      
      // Build query
      let query = Office.find({});
      
      // Apply filters
      if (filter) {
        const filterObj = buildFilter(filter);
        query = query.where(filterObj);
      }
      
      // Apply specific filters
      if (governingBodyId) query = query.where({ governingBody: governingBodyId });
      
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
      
      // Populate governing body
      const populatedQuery = paginatedQuery.populate('governingBody', 'name slug');
      
      // Execute query
      const offices = await populatedQuery;
      const total = await Office.countDocuments({});
      
      // Build response
      const meta = buildPaginationMeta(offices, total, pagination);
      
      return success(res, offices, 200, meta);
      
    } catch (err) {
      console.error('Get offices error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get offices',
        status: 500,
        detail: 'Failed to retrieve offices',
      });
    }
  }
);

// GET /v1/gov/offices/:id
router.get('/offices/:id',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      // Build query
      let query = Office.findById(id);
      
      // Apply field selection
      const projection = selectFields(fields);
      if (Object.keys(projection).length > 0) {
        query = query.select(projection);
      }
      
      // Populate governing body
      const populatedQuery = query.populate('governingBody', 'name slug');
      
      const office = await populatedQuery;
      
      if (!office) {
        return notFound(res, 'Office');
      }
      
      return success(res, office);
      
    } catch (err) {
      console.error('Get office error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get office',
        status: 500,
        detail: 'Failed to retrieve office',
      });
    }
  }
);

// GET /v1/gov/positions
router.get('/positions',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { page = 1, page_size = 50, filter, sort, fields, officeId, isCurrent } = req.query;
      
      // Build query
      let query = Position.find({});
      
      // Apply filters
      if (filter) {
        const filterObj = buildFilter(filter);
        query = query.where(filterObj);
      }
      
      // Apply specific filters
      if (officeId) query = query.where({ office: officeId });
      if (isCurrent !== undefined) query = query.where({ isCurrent: isCurrent === 'true' });
      
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
      
      // Populate office and person
      const populatedQuery = paginatedQuery
        .populate('office', 'name slug')
        .populate('person', 'name party');
      
      // Execute query
      const positions = await populatedQuery;
      const total = await Position.countDocuments({});
      
      // Build response
      const meta = buildPaginationMeta(positions, total, pagination);
      
      return success(res, positions, 200, meta);
      
    } catch (err) {
      console.error('Get positions error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get positions',
        status: 500,
        detail: 'Failed to retrieve positions',
      });
    }
  }
);

// GET /v1/gov/positions/:id
router.get('/positions/:id',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      // Build query
      let query = Position.findById(id);
      
      // Apply field selection
      const projection = selectFields(fields);
      if (Object.keys(projection).length > 0) {
        query = query.select(projection);
      }
      
      // Populate office and person
      const populatedQuery = query
        .populate('office', 'name slug')
        .populate('person', 'name party');
      
      const position = await populatedQuery;
      
      if (!position) {
        return notFound(res, 'Position');
      }
      
      return success(res, position);
      
    } catch (err) {
      console.error('Get position error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get position',
        status: 500,
        detail: 'Failed to retrieve position',
      });
    }
  }
);

// GET /v1/gov/elections
router.get('/elections',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { page = 1, page_size = 50, filter, sort, fields, jurisdictionId, status } = req.query;
      
      // Build query
      let query = Election.find({});
      
      // Apply filters
      if (filter) {
        const filterObj = buildFilter(filter);
        query = query.where(filterObj);
      }
      
      // Apply specific filters
      if (jurisdictionId) query = query.where({ jurisdiction: jurisdictionId });
      if (status) query = query.where({ status });
      
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
      
      // Populate jurisdiction
      const populatedQuery = paginatedQuery.populate('jurisdiction', 'name slug');
      
      // Execute query
      const elections = await populatedQuery;
      const total = await Election.countDocuments({});
      
      // Build response
      const meta = buildPaginationMeta(elections, total, pagination);
      
      return success(res, elections, 200, meta);
      
    } catch (err) {
      console.error('Get elections error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get elections',
        status: 500,
        detail: 'Failed to retrieve elections',
      });
    }
  }
);

// GET /v1/gov/elections/:id
router.get('/elections/:id',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      // Build query
      let query = Election.findById(id);
      
      // Apply field selection
      const projection = selectFields(fields);
      if (Object.keys(projection).length > 0) {
        query = query.select(projection);
      }
      
      // Populate jurisdiction
      const populatedQuery = query.populate('jurisdiction', 'name slug');
      
      const election = await populatedQuery;
      
      if (!election) {
        return notFound(res, 'Election');
      }
      
      return success(res, election);
      
    } catch (err) {
      console.error('Get election error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get election',
        status: 500,
        detail: 'Failed to retrieve election',
      });
    }
  }
);

// GET /v1/gov/legislation
router.get('/legislation',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { page = 1, page_size = 50, filter, sort, fields, governingBodyId, status, bill_number } = req.query;
      
      // Build query
      let query = Legislation.find({});
      
      // Apply filters
      if (filter) {
        const filterObj = buildFilter(filter);
        query = query.where(filterObj);
      }
      
      // Apply specific filters
      if (governingBodyId) query = query.where({ governingBody: governingBodyId });
      if (status) query = query.where({ status });
      if (bill_number) query = query.where({ bill_number });
      
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
      
      // Populate governing body
      const populatedQuery = paginatedQuery.populate('governingBody', 'name slug');
      
      // Execute query
      const legislation = await populatedQuery;
      const total = await Legislation.countDocuments({});
      
      // Build response
      const meta = buildPaginationMeta(legislation, total, pagination);
      
      return success(res, legislation, 200, meta);
      
    } catch (err) {
      console.error('Get legislation error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get legislation',
        status: 500,
        detail: 'Failed to retrieve legislation',
      });
    }
  }
);

// GET /v1/gov/legislation/:id
router.get('/legislation/:id',
  optionalAuth,
  generalLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      // Build query
      let query = Legislation.findById(id);
      
      // Apply field selection
      const projection = selectFields(fields);
      if (Object.keys(projection).length > 0) {
        query = query.select(projection);
      }
      
      // Populate governing body
      const populatedQuery = query.populate('governingBody', 'name slug');
      
      const legislation = await populatedQuery;
      
      if (!legislation) {
        return notFound(res, 'Legislation');
      }
      
      return success(res, legislation);
      
    } catch (err) {
      console.error('Get legislation error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get legislation',
        status: 500,
        detail: 'Failed to retrieve legislation',
      });
    }
  }
);

module.exports = router;

