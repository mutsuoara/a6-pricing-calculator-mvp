/**
 * System Settings Service
 * Handles system-wide configuration settings with backend persistence
 */

import { SystemSettings, SystemSettingsUpdate } from '../types/system-settings';

class SystemSettingsService {
  private static instance: SystemSettingsService;
  private settings: SystemSettings = {
    wrapRate: 87.5, // Default wrap rate
    minimumProfitRate: 7.53, // Default minimum profit rate
  };
  private initialized = false;

  private constructor() {}

  public static getInstance(): SystemSettingsService {
    if (!SystemSettingsService.instance) {
      SystemSettingsService.instance = new SystemSettingsService();
    }
    return SystemSettingsService.instance;
  }

  /**
   * Initialize settings from backend
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('SystemSettingsService: Loading settings from backend...');
      const response = await fetch('/api/system-settings');
      const data = await response.json();

      if (data.success && data.settings) {
        this.settings = {
          wrapRate: data.settings.wrapRate,
          minimumProfitRate: data.settings.minimumProfitRate,
        };
        console.log('SystemSettingsService: Loaded settings from backend:', this.settings);
      } else {
        console.log('SystemSettingsService: Using default settings');
      }
    } catch (error) {
      console.error('SystemSettingsService: Failed to load settings from backend, using defaults:', error);
    }

    this.initialized = true;
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
  public async updateSettings(updates: SystemSettingsUpdate): Promise<SystemSettings> {
    this.settings = {
      ...this.settings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await this.saveToBackend();
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
  public async setWrapRate(rate: number): Promise<void> {
    this.settings.wrapRate = Math.round(rate * 100) / 100; // Round to 2 decimal places
    this.settings.updatedAt = new Date().toISOString();
    await this.saveToBackend();
  }

  /**
   * Calculate wrap amount for a given annual salary
   */
  public calculateWrapAmount(annualSalary: number): number {
    // Ensure value is a number, not a string
    const annualSalaryNum = typeof annualSalary === 'string' ? parseFloat(annualSalary) : annualSalary;
    const result = Math.round((this.settings.wrapRate * annualSalaryNum / 100) * 100) / 100;
    
    return result;
  }

  /**
   * Get minimum profit rate
   */
  public getMinimumProfitRate(): number {
    return this.settings.minimumProfitRate;
  }

  /**
   * Set minimum profit rate
   */
  public async setMinimumProfitRate(rate: number): Promise<void> {
    this.settings.minimumProfitRate = Math.round(rate * 100) / 100; // Round to 2 decimal places
    this.settings.updatedAt = new Date().toISOString();
    await this.saveToBackend();
  }

  /**
   * Calculate minimum profit amount for a given annual salary and wrap amount
   */
  public calculateMinimumProfitAmount(annualSalary: number, wrapAmount: number): number {
    // Ensure values are numbers, not strings
    const annualSalaryNum = typeof annualSalary === 'string' ? parseFloat(annualSalary) : annualSalary;
    const wrapAmountNum = typeof wrapAmount === 'string' ? parseFloat(wrapAmount) : wrapAmount;
    
    const totalCost = annualSalaryNum + wrapAmountNum;
    const result = Math.round((this.settings.minimumProfitRate * totalCost / 100) * 100) / 100;
    
    return result;
  }

  /**
   * Save settings to backend
   */
  private async saveToBackend(): Promise<void> {
    try {
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wrapRate: this.settings.wrapRate,
          minimumProfitRate: this.settings.minimumProfitRate,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to save settings');
      }

      console.log('SystemSettingsService: Settings saved to backend successfully');
    } catch (error) {
      console.error('SystemSettingsService: Failed to save settings to backend:', error);
      throw error;
    }
  }
}

export default SystemSettingsService;
