/**
 * User management and authentication types
 */

export type UserRole = 'User' | 'BD' | 'Finance' | 'Contracts' | 'Admin';

export interface User {
  id: string;
  tenantId: string;
  googleId: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultContractType: string;
  defaultOverheadRate: number;
  defaultGaRate: number;
  defaultFeeRate: number;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  dateFormat: string;
  currencyFormat: string;
}

export interface AuthContext {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
}

export interface LoginRequest {
  googleToken: string;
}

export interface LoginResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

