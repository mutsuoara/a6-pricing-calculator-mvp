/**
 * System Settings Service
 * Handles system-wide configuration settings
 */

import { SystemSettings, SystemSettingsUpdate } from '../types/system-settings';

class SystemSettingsService {
  private static instance: SystemSettingsService;
  private settings: SystemSettings = {
    wrapRate: 0, // Default wrap rate
  };

  private constructor() {}

  public static getInstance(): SystemSettingsService {
    if (!SystemSettingsService.instance) {
      SystemSettingsService.instance = new SystemSettingsService();
    }
    return SystemSettingsService.instance;
  }

  /**
   * Get current system settings
   */
  public getSettings(): SystemSettings {
    return { ...this.settings };
  }

  /**
   * Update system settings
   */
  public updateSettings(updates: SystemSettingsUpdate): SystemSettings {
    this.settings = {
      ...this.settings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.settings };
  }

  /**
   * Get wrap rate
   */
  public getWrapRate(): number {
    return this.settings.wrapRate;
  }

  /**
   * Set wrap rate
   */
  public setWrapRate(rate: number): void {
    this.settings.wrapRate = Math.round(rate * 100) / 100; // Round to 2 decimal places
    this.settings.updatedAt = new Date().toISOString();
  }

  /**
   * Calculate wrap amount for a given annual salary
   */
  public calculateWrapAmount(annualSalary: number): number {
    return Math.round((this.settings.wrapRate * annualSalary / 100) * 100) / 100;
  }
}

export default SystemSettingsService;
