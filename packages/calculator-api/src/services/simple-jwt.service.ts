/**
 * Simple JWT Service for token generation and validation
 */

import jwt from 'jsonwebtoken';
import { User } from '../models';
import { UserRole } from '@pricing-calculator/types';

export interface JWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class SimpleJWTService {
  private static readonly JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = '1h';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  /**
   * Generate access and refresh tokens for a user
   */
  public static generateTokenPair(user: User): TokenPair {
    const payload: JWTPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, SimpleJWTService.JWT_SECRET, {
      expiresIn: SimpleJWTService.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      SimpleJWTService.JWT_SECRET,
      { expiresIn: SimpleJWTService.REFRESH_TOKEN_EXPIRES_IN }
    );

    const expiresIn = 3600; // 1 hour in seconds

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Verify and decode an access token
   */
  public static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, SimpleJWTService.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify a refresh token
   */
  public static verifyRefreshToken(token: string): { userId: string; type: string } {
    try {
      const decoded = jwt.verify(token, SimpleJWTService.JWT_SECRET) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Generate a new access token from a refresh token
   */
  public static async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const decoded = SimpleJWTService.verifyRefreshToken(refreshToken);
    
    // Find user and generate new token pair
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return SimpleJWTService.generateTokenPair(user);
  }
}
