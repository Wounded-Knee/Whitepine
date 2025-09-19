import express from 'express';
import passport from 'passport';
import session from 'cookie-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from '../config/index.js';
import { UserNodeModel } from '../models/index.js';
import { NODE_TYPES, encodeNodeId } from '@whitepine/types';

export function setupAuth(app: express.Application): void {
  // Configure session middleware
  app.use(session({
    name: 'session',
    keys: [config.sessionSecret],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth Strategy
  if (config.googleClientId && config.googleClientSecret) {
    passport.use(new GoogleStrategy({
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email provided by Google'), undefined);
        }

        // Look up existing UserNode by email
        let userNode = await UserNodeModel.findOne({ email });

        if (!userNode) {
          // Create new UserNode if it doesn't exist
          userNode = new UserNodeModel({
            kind: NODE_TYPES.USER,
            email,
            name: name || 'Unknown User',
            avatar,
            isActive: true,
            lastLoginAt: new Date(),
          });
          await userNode.save();
        } else {
          // Update last login time for existing user
          userNode.lastLoginAt = new Date();
          if (name && userNode.name !== name) {
            userNode.name = name;
          }
          if (avatar && userNode.avatar !== avatar) {
            userNode.avatar = avatar;
          }
          await userNode.save();
        }

        // Return the UserNode's MongoDB ObjectId as a branded user ID
        const user = {
          id: encodeNodeId(userNode._id), // Branded node ID for consistency
          email: userNode.email,
          name: userNode.name,
          picture: userNode.avatar,
          provider: 'google'
        };

        return done(null, user);
      } catch (error) {
        console.error('Error in Google OAuth strategy:', error);
        return done(error, undefined);
      }
    }));
  }

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      // Look up the UserNode by its MongoDB ObjectId
      const userNode = await UserNodeModel.findById(id);
      
      if (!userNode) {
        return done(null, false); // User not found
      }

      // Return the user object with the UserNode's data
      const user = {
        id: userNode._id.toString(),
        email: userNode.email,
        name: userNode.name,
        picture: userNode.avatar,
        provider: 'google'
      };

      done(null, user);
    } catch (error) {
      console.error('Error in deserializeUser:', error);
      // If there's a database error, don't fail the entire request
      // Just return false to indicate the user is not authenticated
      done(null, false);
    }
  });

  // Auth routes
  app.get('/auth/google', 
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })
  );

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect home
      res.redirect('/');
    }
  );

  app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      return res.redirect('/');
    });
  });

  app.get('/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}
