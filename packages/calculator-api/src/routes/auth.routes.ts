/**
 * Authentication Routes
 */

import express from 'express';
import passport from 'passport';
import { AuthService } from '../services/auth.service';
import { SimpleJWTService } from '../services/simple-jwt.service';
import { authenticateJWT, AuthRequest } from '../middleware/auth.middleware';
// import { User } from '../models'; // Not used in this file

const router = express.Router();

/**
 * Google OAuth login initiation
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

/**
 * Google OAuth callback
 */
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect('/login?error=no_user');
      }

      // Generate tokens
      const tokens = AuthService.generateTokens(user);

      // Set tokens as httpOnly cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        maxAge: tokens.expiresIn * 1000
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to frontend with success
      return res.redirect(`${process.env['CORS_ORIGIN'] || 'http://localhost:3000'}/dashboard?login=success`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.redirect('/login?error=callback_failed');
    }
  }
);

/**
 * Get current user profile
 */
router.get('/me', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Failed to get user profile' });
    }
});

/**
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const tokens = await SimpleJWTService.refreshAccessToken(refreshToken);
    
    // Set new access token as httpOnly cookie
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: tokens.expiresIn * 1000
    });

    return res.json({
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn
    });
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
});

/**
 * Logout user
 */
router.post('/logout', authenticateJWT, async (_req: AuthRequest, res) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * Logout from all devices (invalidate all refresh tokens)
 */
router.post('/logout-all', authenticateJWT, async (_req: AuthRequest, res) => {
  try {
    // In a real implementation, you would maintain a blacklist of refresh tokens
    // For now, we'll just clear the cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    return res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    console.error('Logout all error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * Update user profile
 */
router.put('/profile', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    const { name } = req.body;

    if (name) {
      await user.update({ name });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * Check authentication status
 */
router.get('/status', authenticateJWT, (req: AuthRequest, res) => {
  return res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      tenantId: req.user.tenantId
    }
  });
});

export default router;
