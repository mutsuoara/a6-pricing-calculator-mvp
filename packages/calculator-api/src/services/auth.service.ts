/**
 * Authentication Service for Google OAuth and user management
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models';
import { UserRole } from '@pricing-calculator/types';
import { SimpleJWTService, JWTPayload } from './simple-jwt.service';
import { AuditLog } from '../models';

export class AuthService {
  private static readonly ALLOWED_DOMAIN = 'agile6.com';
  private static readonly DEFAULT_TENANT_ID = process.env['DEFAULT_TENANT_ID'] || 'agile6-default';

  /**
   * Initialize Passport strategies
   */
  public static initializePassport(): void {
    // Google OAuth Strategy
    passport.use(new GoogleStrategy({
      clientID: process.env['GOOGLE_CLIENT_ID'] || '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
      callbackURL: '/api/auth/google/callback'
    }, AuthService.handleGoogleCallback));

    // JWT Strategy for API protection
    passport.use(new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env['JWT_SECRET'] || 'your-secret-key',
      passReqToCallback: true
    }, AuthService.handleJwtCallback));

    // Serialize user for session
    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await User.findByPk(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
  }

  /**
   * Handle Google OAuth callback
   */
  private static async handleGoogleCallback(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void
  ): Promise<void> {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;
      const googleId = profile.id;

      if (!email) {
        return done(new Error('No email found in Google profile'));
      }

      // Validate domain restriction
      if (!AuthService.isAllowedDomain(email)) {
        await AuthService.logAuthAttempt(email, 'DOMAIN_REJECTED', 'Non-agile6.com email attempted login');
        return done(new Error('Access restricted to agile6.com domain only'));
      }

      // Find or create user
      let user = await User.findOne({ where: { googleId } });
      
      if (!user) {
        // Create new user
        user = await User.create({
          id: uuidv4(), // Generate UUID for new user
          tenantId: AuthService.DEFAULT_TENANT_ID,
          googleId,
          email,
          name,
          role: 'User' as UserRole,
          isActive: true,
          lastLoginAt: new Date(),
        });
        
        await AuthService.logAuthAttempt(email, 'USER_CREATED', 'New user created via Google OAuth');
      } else {
        // Update existing user
        await user.update({
          name,
          lastLoginAt: new Date(),
        });
        
        await AuthService.logAuthAttempt(email, 'LOGIN_SUCCESS', 'User logged in via Google OAuth');
      }

      return done(null, user);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      await AuthService.logAuthAttempt(profile.emails?.[0]?.value || 'unknown', 'LOGIN_ERROR', `OAuth error: ${error}`);
      return done(error);
    }
  }

  /**
   * Handle JWT token validation
   */
  private static async handleJwtCallback(
    req: any,
    payload: JWTPayload,
    done: (error: any, user?: any) => void
  ): Promise<void> {
    try {
      const user = await User.findByPk(payload.userId);
      
      if (!user || !user.isActive) {
        return done(null, false);
      }

      // Add user and tenant info to request
      req.user = user;
      req.tenantId = payload.tenantId;
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }

  /**
   * Check if email domain is allowed
   */
  private static isAllowedDomain(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain === AuthService.ALLOWED_DOMAIN;
  }

  /**
   * Log authentication attempts
   */
  private static async logAuthAttempt(
    email: string,
    action: 'LOGIN_SUCCESS' | 'LOGIN_ERROR' | 'DOMAIN_REJECTED' | 'USER_CREATED',
    details: string
  ): Promise<void> {
    try {
      await AuditLog.logUserAction(
        AuthService.DEFAULT_TENANT_ID,
        'system', // System user for auth events
        action as any,
        'Authentication',
        null,
        { email, details },
        '127.0.0.1', // Will be updated with real IP in middleware
        'Google OAuth',
        action === 'LOGIN_SUCCESS' || action === 'USER_CREATED',
        action === 'LOGIN_ERROR' || action === 'DOMAIN_REJECTED' ? details : null
      );
    } catch (error) {
      console.error('Failed to log auth attempt:', error);
    }
  }

  /**
   * Generate tokens for user
   */
  public static generateTokens(user: User) {
    return SimpleJWTService.generateTokenPair(user);
  }

  /**
   * Validate user role for access control
   */
  public static hasRole(user: User, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      'User': 1,
      'BD': 2,
      'Finance': 3,
      'Contracts': 4,
      'Admin': 5,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  /**
   * Check if user has any of the required roles
   */
  public static hasAnyRole(user: User, roles: UserRole[]): boolean {
    return roles.some(role => AuthService.hasRole(user, role));
  }
}
