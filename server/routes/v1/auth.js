const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../../models/User');
const Role = require('../../models/Role');
const { validate, schemas } = require('../../middleware/validation');
const { verifyToken, requireScope } = require('../../middleware/authorization');
const { authLimiter, securityHeaders } = require('../../middleware/security');
const { success, error, unauthorized, validationError } = require('../../utils/response');
const authConfig = require('../../config/auth');

const router = express.Router();

// Apply security headers to all auth routes
router.use(securityHeaders);

// Helper function to get user scopes from roles
async function getUserScopes(user) {
  if (!user.roles || user.roles.length === 0) return [];
  
  const roles = await Role.find({ name: { $in: user.roles } }).select('scopes');
  const scopes = roles.reduce((acc, role) => {
    if (role.scopes) {
      acc.push(...role.scopes);
    }
    return acc;
  }, []);
  
  return [...new Set(scopes)]; // Remove duplicates
}

// POST /v1/auth/register
router.post('/register', 
  authLimiter,
  validate(schemas.register),
  async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      
      if (existingUser) {
        return validationError(res, {
          email: existingUser.email === email ? ['Email already exists'] : [],
          username: existingUser.username === username ? ['Username already exists'] : [],
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, authConfig.password.saltRounds);
      
      // Create user with default role name
      const user = new User({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roles: ['user'], // Use role name directly
        isActive: true,
      });
      
      await user.save();
      
      // Generate tokens
      const accessToken = jwt.sign(
        {
          sub: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          scopes: authConfig.defaultScopes,
        },
        process.env.JWT_SECRET,
        { expiresIn: authConfig.jwt.accessTokenExpiry }
      );
      
      const refreshToken = jwt.sign(
        {
          sub: user._id,
          jti: require('crypto').randomBytes(32).toString('hex'),
          type: 'refresh',
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: authConfig.jwt.refreshTokenExpiry }
      );
      
      // Set refresh token in HTTP-only cookie
      res.cookie(authConfig.cookies.refreshTokenName, refreshToken, {
        httpOnly: authConfig.cookies.httpOnly,
        secure: authConfig.cookies.secure,
        sameSite: authConfig.cookies.sameSite,
        maxAge: authConfig.cookies.maxAge,
      });
      
      return success(res, {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          createdAt: user.createdAt,
        },
        accessToken,
      }, 201);
      
    } catch (err) {
      console.error('Registration error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Registration failed',
        status: 500,
        detail: 'Failed to create user account',
      });
    }
  }
);

// POST /v1/auth/login
router.post('/login',
  authLimiter,
  validate(schemas.login),
  async (req, res) => {
    try {
      const { identifier, password } = req.body;
      
      // Find user by email or username
      const user = await User.findOne({
        $or: [
          { email: identifier },
          { username: identifier }
        ]
      }).select('+password +roles +isActive');
      
      if (!user || !user.isActive) {
        return unauthorized(res, 'Invalid credentials');
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return unauthorized(res, 'Invalid credentials');
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Get user scopes
      const scopes = await getUserScopes(user);
      
      // Generate tokens
      const accessToken = jwt.sign(
        {
          sub: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          scopes: scopes,
        },
        process.env.JWT_SECRET,
        { expiresIn: authConfig.jwt.accessTokenExpiry }
      );
      
      const refreshToken = jwt.sign(
        {
          sub: user._id,
          jti: require('crypto').randomBytes(32).toString('hex'),
          type: 'refresh',
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: authConfig.jwt.refreshTokenExpiry }
      );
      
      // Set refresh token in HTTP-only cookie
      res.cookie(authConfig.cookies.refreshTokenName, refreshToken, {
        httpOnly: authConfig.cookies.httpOnly,
        secure: authConfig.cookies.secure,
        sameSite: authConfig.cookies.sameSite,
        maxAge: authConfig.cookies.maxAge,
      });
      
      return success(res, {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          scopes: scopes,
          lastLogin: user.lastLogin,
        },
        accessToken,
      });
      
    } catch (err) {
      console.error('Login error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Login failed',
        status: 500,
        detail: 'Failed to authenticate user',
      });
    }
  }
);

// POST /v1/auth/logout
router.post('/logout',
  verifyToken,
  async (req, res) => {
    try {
      // Clear refresh token cookie
      res.clearCookie(authConfig.cookies.refreshTokenName, {
        httpOnly: authConfig.cookies.httpOnly,
        secure: authConfig.cookies.secure,
        sameSite: authConfig.cookies.sameSite,
      });
      
      // TODO: Add refresh token to blacklist/revocation list
      
      return success(res, { message: 'Logged out successfully' });
      
    } catch (err) {
      console.error('Logout error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Logout failed',
        status: 500,
        detail: 'Failed to logout user',
      });
    }
  }
);

// POST /v1/auth/refresh
router.post('/refresh',
  async (req, res) => {
    try {
      const refreshToken = req.cookies[authConfig.cookies.refreshTokenName];
      
      if (!refreshToken) {
        return unauthorized(res, 'Refresh token required');
      }
      
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );
      
      if (decoded.type !== 'refresh') {
        return unauthorized(res, 'Invalid token type');
      }
      
      // Check if user exists and is active
      const user = await User.findById(decoded.sub).select('+roles +isActive');
      
      if (!user || !user.isActive) {
        return unauthorized(res, 'User not found or inactive');
      }
      
      // Generate new tokens
      const newAccessToken = jwt.sign(
        {
          sub: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          scopes: sharedConfig.auth.defaultScopes,
        },
        process.env.JWT_SECRET,
        { expiresIn: authConfig.jwt.accessTokenExpiry }
      );
      
      const newRefreshToken = jwt.sign(
        {
          sub: user._id,
          jti: require('crypto').randomBytes(32).toString('hex'),
          type: 'refresh',
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: authConfig.jwt.refreshTokenExpiry }
      );
      
      // Set new refresh token in HTTP-only cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      // TODO: Revoke old refresh token
      
      return success(res, {
        accessToken: newAccessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
        },
      });
      
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return unauthorized(res, 'Invalid refresh token');
      }
      
      console.error('Token refresh error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Token refresh failed',
        status: 500,
        detail: 'Failed to refresh token',
      });
    }
  }
);

// GET /v1/auth/me
router.get('/me',
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select('-password');
      
      if (!user) {
        return unauthorized(res, 'User not found');
      }
      
      return success(res, {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.profile?.bio,
        location: user.profile?.location,
        website: user.profile?.website,
        roles: user.roles,
        scopes: req.user.scopes,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      });
      
    } catch (err) {
      console.error('Get user profile error:', err);
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/internal',
        title: 'Failed to get user profile',
        status: 500,
        detail: 'Failed to retrieve user information',
      });
    }
  }
);

// GET /v1/auth/oauth/:provider
router.get('/oauth/:provider',
  (req, res, next) => {
    const { provider } = req.params;
    
    if (!authConfig.oauth.supportedProviders.includes(provider)) {
      return error(res, {
        type: '${process.env.NEXT_PUBLIC_API_URL}/errors/bad-request',
        title: 'Unsupported OAuth provider',
        status: 400,
        detail: `Provider '${provider}' is not supported`,
      });
    }
    
    // Configure passport strategy based on provider
    passport.authenticate(provider, {
      scope: authConfig.oauth.scopes,
      state: req.query.redirect_uri || '/',
    })(req, res, next);
  }
);

// GET /v1/auth/oauth/:provider/callback
router.get('/oauth/:provider/callback',
  (req, res, next) => {
    const { provider } = req.params;
    
    passport.authenticate(provider, { session: false }, (err, user, info) => {
      if (err) {
        return error(res, {
          type: '${process.env.NEXT_PUBLIC_API_URL}/errors/oauth',
          title: 'OAuth authentication failed',
          status: 500,
          detail: err.message,
        });
      }
      
      if (!user) {
        return error(res, {
          type: '${process.env.NEXT_PUBLIC_API_URL}/errors/oauth',
          title: 'OAuth authentication failed',
          status: 401,
          detail: 'Failed to authenticate with OAuth provider',
        });
      }
      
      // Generate tokens for OAuth user
      const accessToken = jwt.sign(
        {
          sub: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          scopes: sharedConfig.auth.defaultScopes,
        },
        process.env.JWT_SECRET,
        { expiresIn: authConfig.jwt.accessTokenExpiry }
      );
      
      const refreshToken = jwt.sign(
        {
          sub: user._id,
          jti: require('crypto').randomBytes(32).toString('hex'),
          type: 'refresh',
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: authConfig.jwt.refreshTokenExpiry }
      );
      
      // Set refresh token in HTTP-only cookie
      res.cookie(authConfig.cookies.refreshTokenName, refreshToken, {
        httpOnly: authConfig.cookies.httpOnly,
        secure: authConfig.cookies.secure,
        sameSite: authConfig.cookies.sameSite,
        maxAge: authConfig.cookies.maxAge,
      });
      
      // Redirect to frontend with token
      const redirectUri = req.query.state || '/';
      const frontendUrl = process.env.FRONTEND_URL;
      
      res.redirect(`${frontendUrl}${redirectUri}?token=${accessToken}`);
    })(req, res, next);
  }
);

module.exports = router;

