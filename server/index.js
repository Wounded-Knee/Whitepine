const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./utils/database');
const errorHandler = require('./middleware/errorHandler');
const { corsOptions, helmetConfig, securityHeaders, idempotencyKey, etagMiddleware } = require('./middleware/security');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced security middleware
app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(idempotencyKey);
app.use(etagMiddleware);

// Standard middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Import passport configuration
require('./config/passport');

// Serve static files for uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Whitepine Backend API',
    version: '1.0',
    api: '/v1',
    documentation: '/v1/docs'
  });
});

// API Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0'
  });
});

// All API routes now use v1

// New v1 API Routes
app.use('/v1/auth', require('./routes/v1/auth'));
app.use('/v1/users', require('./routes/v1/users'));
app.use('/v1/roles', require('./routes/v1/roles'));
app.use('/v1/identities', require('./routes/v1/identities'));
app.use('/v1/obligations', require('./routes/v1/obligations'));
app.use('/v1/gov', require('./routes/v1/gov'));
app.use('/v1/media', require('./routes/v1/media'));

// API Documentation
app.get('/v1/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    version: '1.0',
    endpoints: {
      auth: {
        description: 'Authentication endpoints',
        base: '/v1/auth',
        endpoints: [
          'POST /register - Register new user',
          'POST /login - Authenticate user',
          'POST /logout - Logout user',
          'POST /refresh - Refresh access token',
          'GET /me - Get current user profile',
          'GET /oauth/:provider - OAuth authentication',
          'GET /oauth/:provider/callback - OAuth callback'
        ]
      },
      users: {
        description: 'User management endpoints',
        base: '/v1/users',
        endpoints: [
          'GET / - List users',
          'POST / - Create user (admin only)',
          'GET /:userId - Get user by ID',
          'PATCH /:userId - Update user',
          'DELETE /:userId - Deactivate user',
          'GET /:userId/roles - Get user roles',
          'PUT /:userId/roles - Update user roles',
          'POST /:userId/roles - Add role to user',
          'DELETE /:userId/roles/:role - Remove role from user',
          'GET /:userId/media - Get user media',
          'POST /:userId/media - Upload user media'
        ]
      },
      roles: {
        description: 'Role management endpoints',
        base: '/v1/roles',
        endpoints: [
          'GET / - List available roles',
          'GET /scopes - List available scopes'
        ]
      },
      obligations: {
        description: 'Unified obligation management endpoints (Promise, Petition, etc.)',
        base: '/v1/obligations',
        endpoints: [
          'GET / - List obligations with type filtering',
          'GET /?type=petition - List only petitions',
          'GET /?type=promise - List only promises',
          'GET /trending - Get trending obligations',
          'GET /trending?type=petition - Get trending petitions',
          'GET /stats - Get obligation statistics',
          'GET /:id - Get obligation by ID',
          'GET /:id/claims - Get detailed claims for obligation',
          'POST /:id/vigor - Add vigor to obligation',
          'POST /:id/votes - Vote on obligation',
          'POST / - Create new obligation (specify type)',
          'PUT /:id - Update obligation',
          'DELETE /:id - Delete obligation'
        ]
      },

      gov: {
        description: 'Government endpoints',
        base: '/v1/gov',
        endpoints: [
          'GET /jurisdictions - List jurisdictions',
          'GET /jurisdictions/:id - Get jurisdiction by ID',
          'GET /governing-bodies - List governing bodies',
          'GET /governing-bodies/:id - Get governing body by ID',
          'GET /offices - List offices',
          'GET /offices/:id - Get office by ID',
          'GET /positions - List positions',
          'GET /positions/:id - Get position by ID',
          'GET /elections - List elections',
          'GET /elections/:id - Get election by ID',
          'GET /legislation - List legislation',
          'GET /legislation/:id - Get legislation by ID'
        ]
      },
      media: {
        description: 'Media management endpoints',
        base: '/v1/media',
        endpoints: [
          'GET / - List media',
          'POST / - Upload media',
          'GET /:mediaId - Get media by ID',
          'PATCH /:mediaId - Update media',
          'DELETE /:mediaId - Delete media'
        ]
      },
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>'
    },
    pagination: {
      type: 'Page-based',
      parameters: 'page, page_size'
    },
    filtering: {
      type: 'Query parameters',
      example: '?filter[category]=environment&sort=-createdAt'
    },
    response_format: {
      success: {
        resources: 'Resource or array of resources',
        meta: 'Pagination and metadata'
      },
      error: {
        type: 'RFC 7807 Problem Details',
        fields: 'type, title, status, detail, errors'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    type: '${process.env.NEXT_PUBLIC_API_URL}/errors/not-found',
    title: 'Route not found',
    status: 404,
    detail: `The requested route ${req.originalUrl} was not found`,
    instance: req.originalUrl
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
      console.log(`🔗 Frontend should be at http://localhost:3000`);
      console.log(`📚 API Documentation at http://localhost:${PORT}/v1/docs`);
      console.log(`⚡ API available at http://localhost:${PORT}/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
