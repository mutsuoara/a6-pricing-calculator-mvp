/**
 * Authentication and Authorization Middleware
 */

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { UserRole } from '@pricing-calculator/types';
import { AuthService } from '../services/auth.service';
import { AuditLog } from '../models';

// Extend Express Request interface
export interface AuthRequest extends Request {
  user?: any;
  tenantId?: string;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  return passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid or missing token' });
    }

    req.user = user;
    req.tenantId = user.tenantId;
    return next();
  })(req, res, next);
};

/**
 * Middleware to require specific role
 */
export const requireRole = (role: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!AuthService.hasRole(req.user, role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: role,
        current: req.user.role
      });
    }

    return next();
  };
};

/**
 * Middleware to require any of the specified roles
 */
export const requireAnyRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!AuthService.hasAnyRole(req.user, roles)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    return next();
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole('Admin');

/**
 * Middleware to require authenticated user (any role)
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return next();
};

/**
 * Middleware to log API access
 */
export const logApiAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    
    // Log API access asynchronously
    if (req.user) {
      AuditLog.logUserAction(
        req.user.tenantId,
        req.user.id,
        'READ' as any,
        'API',
        null,
        {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
        },
        req.ip || '127.0.0.1',
        req.get('User-Agent') || 'Unknown',
        res.statusCode < 400
      ).catch(console.error);
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

/**
 * Middleware to extract tenant context
 */
export const tenantContext = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.user) {
    req.tenantId = req.user.tenantId;
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  return passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) {
      console.error('Optional auth error:', err);
    }
    
    if (user) {
      req.user = user;
      req.tenantId = user.tenantId;
    }
    
    return next();
  })(req, res, next);
};
