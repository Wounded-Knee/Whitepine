import { Request, Response, NextFunction } from 'express';

// Middleware to handle NextAuth session from X-User-ID header
export const nextAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  
  if (userId) {
    // Set the user in the request object to match what Passport.js would do
    req.user = {
      id: userId,
      email: req.headers['x-user-email'] as string,
      name: req.headers['x-user-name'] as string,
      picture: req.headers['x-user-picture'] as string,
      provider: 'nextauth'
    };
  }
  
  next();
};
