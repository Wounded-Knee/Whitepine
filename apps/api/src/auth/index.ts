import express from 'express';
import passport from 'passport';
import session from 'cookie-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from '../config/index.js';

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
        // Here you would typically:
        // 1. Check if user exists in your database
        // 2. Create user if they don't exist
        // 3. Return the user object
        
        const user = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          picture: profile.photos?.[0]?.value,
          provider: 'google'
        };

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }));
  }

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser((id: string, done) => {
    // Here you would typically fetch user from database
    // For now, we'll just pass the id
    done(null, { id });
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
      res.redirect('/');
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
