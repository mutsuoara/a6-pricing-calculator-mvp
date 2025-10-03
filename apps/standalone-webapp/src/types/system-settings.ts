/**
 * System Settings Types
 * Defines interfaces for system-wide configuration settings
 */

export interface SystemSettings {
  id?: string;
  wrapRate: number; // System-wide wrap rate percentage
  minimumProfitRate: number; // System-wide minimum profit rate percentage
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SystemSettingsUpdate {
  wrapRate?: number;
  minimumProfitRate?: number;
  updatedBy?: string;
}
