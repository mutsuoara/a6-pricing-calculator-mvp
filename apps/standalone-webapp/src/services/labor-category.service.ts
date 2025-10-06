/**
 * Labor Category Service
 * Handles labor category calculations and validation
 */

import { LaborCategoryInput, LaborCategoryResult, LaborCategorySummary, ValidationError } from '../types/labor-category';

export class LaborCategoryService {
  private static readonly CLEARANCE_PREMIUMS = {
    'None': 0,
    'Public Trust': 0.05,
    'Secret': 0.10,
    'Top Secret': 0.20,
  };

  /**
   * Calculate effective hours for a labor category
   */
  public static calculateEffectiveHours(hours: number, ftePercentage: number): number {
    return hours * (ftePercentage / 100);
  }

  /**
   * Calculate clearance premium
   */
  public static calculateClearancePremium(clearanceLevel: 'None' | 'Public Trust' | 'Secret' | 'Top Secret'): number {
    return this.CLEARANCE_PREMIUMS[clearanceLevel];
  }

  /**
   * Calculate clearance adjusted rate
   */
  public static calculateClearanceAdjustedRate(baseRate: number, clearanceLevel: 'None' | 'Public Trust' | 'Secret' | 'Top Secret'): number {
    const premium = this.calculateClearancePremium(clearanceLevel);
    return baseRate * (1 + premium);
  }

  /**
   * Calculate burdened rate
   */
  public static calculateBurdenedRate(
    baseRate: number,
    clearanceLevel: 'None' | 'Public Trust' | 'Secret' | 'Top Secret',
    overheadRate: number,
    gaRate: number,
    feeRate: number
  ): number {
    const clearanceAdjustedRate = this.calculateClearanceAdjustedRate(baseRate, clearanceLevel);
    return clearanceAdjustedRate * (1 + overheadRate) * (1 + gaRate) * (1 + feeRate);
  }

  /**
   * Calculate total cost for a labor category
   */
  public static calculateTotalCost(
    laborCategory: LaborCategoryInput,
    overheadRate: number,
    gaRate: number,
    feeRate: number
  ): LaborCategoryResult {
    const effectiveHours = this.calculateEffectiveHours(laborCategory.hours, laborCategory.ftePercentage);
    const clearancePremium = this.calculateClearancePremium(laborCategory.clearanceLevel);
    const clearanceAdjustedRate = this.calculateClearanceAdjustedRate(laborCategory.baseRate, laborCategory.clearanceLevel);
    const burdenedRate = this.calculateBurdenedRate(
      laborCategory.baseRate,
      laborCategory.clearanceLevel,
      overheadRate,
      gaRate,
      feeRate
    );

    const overheadAmount = clearanceAdjustedRate * overheadRate * effectiveHours;
    const gaAmount = clearanceAdjustedRate * (1 + overheadRate) * gaRate * effectiveHours;
    const feeAmount = clearanceAdjustedRate * (1 + overheadRate) * (1 + gaRate) * feeRate * effectiveHours;
    const totalCost = laborCategory.finalRate * effectiveHours * laborCategory.capacity; // (Capacity × Effective Hours) × Final Rate

    // Calculate new enhanced properties
    const annualSalary = laborCategory.companyRoleRate || 0;
    const wrapAmount = annualSalary * (wrapRate / 100);
    const minimumProfitAmount = (annualSalary + wrapAmount) * (minimumProfitRate / 100);
    const minimumAnnualRevenue = annualSalary + wrapAmount + minimumProfitAmount;
    const companyMinimumRate = minimumAnnualRevenue / effectiveHours;
    const actualCost = (annualSalary + wrapAmount) * laborCategory.capacity;
    const actualProfit = totalCost - actualCost;
    const actualProfitPercentage = actualCost > 0 ? (actualProfit / (actualCost + actualProfit)) * 100 : 0;
    const finalRateDiscount = laborCategory.baseRate > 0 ? ((laborCategory.baseRate - laborCategory.finalRate) / laborCategory.baseRate) * 100 : 0;

    return {
      id: laborCategory.id || '',
      title: laborCategory.title,
      baseRate: laborCategory.baseRate,
      hours: laborCategory.hours,
      ftePercentage: laborCategory.ftePercentage,
      capacity: laborCategory.capacity,
      effectiveHours,
      clearanceLevel: laborCategory.clearanceLevel,
      location: laborCategory.location,
      clearancePremium,
      clearanceAdjustedRate,
      overheadAmount,
      overheadRate,
      gaAmount,
      gaRate,
      feeAmount,
      feeRate,
      totalCost,
      burdenedRate,
      // New enhanced properties
      annualSalary,
      wrapAmount,
      minimumProfitAmount,
      minimumAnnualRevenue,
      companyMinimumRate,
      actualCost,
      actualProfit,
      actualProfitPercentage,
      finalRateDiscount,
    };
  }

  /**
   * Validate a labor category
   */
  public static validateLaborCategory(laborCategory: LaborCategoryInput, index: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const prefix = `categories[${index}]`;

    if (!laborCategory.title || laborCategory.title.trim().length === 0) {
      errors.push({
        field: `${prefix}.title`,
        message: 'Labor category title is required',
        value: laborCategory.title,
        severity: 'error',
      });
    }

    if (laborCategory.baseRate < 1 || laborCategory.baseRate > 1000) {
      errors.push({
        field: `${prefix}.baseRate`,
        message: 'Base rate must be between $1 and $1000',
        value: laborCategory.baseRate,
        severity: 'error',
      });
    }

    if (laborCategory.hours < 1 || laborCategory.hours > 10000) {
      errors.push({
        field: `${prefix}.hours`,
        message: 'Hours must be between 1 and 10000',
        value: laborCategory.hours,
        severity: 'error',
      });
    }

    if (laborCategory.ftePercentage < 0.01 || laborCategory.ftePercentage > 100) {
      errors.push({
        field: `${prefix}.ftePercentage`,
        message: 'FTE percentage must be between 0.01% and 100%',
        value: laborCategory.ftePercentage,
        severity: 'error',
      });
    }

    if (laborCategory.capacity < 0.1 || laborCategory.capacity > 100) {
      errors.push({
        field: `${prefix}.capacity`,
        message: 'Capacity must be between 0.1 and 100',
        value: laborCategory.capacity,
        severity: 'error',
      });
    }

    if (!laborCategory.clearanceLevel || !['None', 'Public Trust', 'Secret', 'Top Secret'].includes(laborCategory.clearanceLevel)) {
      errors.push({
        field: `${prefix}.clearanceLevel`,
        message: 'Invalid clearance level',
        value: laborCategory.clearanceLevel,
        severity: 'error',
      });
    }

    if (!laborCategory.location || !['Remote', 'On-site', 'Hybrid'].includes(laborCategory.location)) {
      errors.push({
        field: `${prefix}.location`,
        message: 'Invalid location type',
        value: laborCategory.location,
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Calculate summary for all labor categories
   */
  public static calculateSummary(
    categories: LaborCategoryInput[],
    overheadRate: number,
    gaRate: number,
    feeRate: number
  ): LaborCategorySummary {
    if (categories.length === 0) {
      return {
        totalCategories: 0,
        totalHours: 0,
        totalEffectiveHours: 0,
        totalBaseCost: 0,
        totalBurdenedCost: 0,
        averageBaseRate: 0,
        averageBurdenedRate: 0,
        totalCost: 0,
        totalActualCost: 0,
        totalActualProfit: 0,
        averageActualProfitPercentage: 0,
      };
    }

    let totalHours = 0;
    let totalEffectiveHours = 0;
    let totalBaseCost = 0;
    let totalBurdenedCost = 0;
    let totalBaseRate = 0;
    let totalBurdenedRate = 0;
    let totalCost = 0;
    let totalActualCost = 0;
    let totalActualProfit = 0;

    categories.forEach(category => {
      const result = this.calculateTotalCost(category, overheadRate, gaRate, feeRate);
      
      totalHours += category.hours;
      totalEffectiveHours += result.effectiveHours;
      totalBaseCost += category.baseRate * category.hours;
      totalBurdenedCost += result.totalCost;
      totalBaseRate += category.baseRate;
      totalBurdenedRate += result.burdenedRate;
      totalCost += result.totalCost;
      totalActualCost += result.actualCost;
      totalActualProfit += result.actualProfit;
    });

    const averageActualProfitPercentage = totalActualCost > 0 ? (totalActualProfit / (totalActualCost + totalActualProfit)) * 100 : 0;

    return {
      totalCategories: categories.length,
      totalHours,
      totalEffectiveHours,
      totalBaseCost,
      totalBurdenedCost,
      averageBaseRate: totalBaseRate / categories.length,
      averageBurdenedRate: totalBurdenedRate / categories.length,
      totalCost,
      totalActualCost,
      totalActualProfit,
      averageActualProfitPercentage,
    };
  }

  /**
   * Create a new empty labor category
   */
  public static createEmptyCategory(): LaborCategoryInput {
    return {
      title: '',
      baseRate: 0,
      hours: 0,
      ftePercentage: 100,
      capacity: 1, // Default capacity of 1
      clearanceLevel: 'None',
      location: 'Remote',
      companyRoleId: '',
      companyRoleName: '',
      companyRoleRate: 0,
      finalRate: 0,
      finalRateMetadata: {
        source: 'manual',
        reason: 'New empty category',
        timestamp: new Date().toISOString(),
        userId: 'current-user',
      },
    };
  }

  /**
   * Format currency for display
   */
  public static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  public static formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  /**
   * Get clearance level color for UI
   */
  public static getClearanceLevelColor(clearanceLevel: 'None' | 'Public Trust' | 'Secret' | 'Top Secret'): string {
    switch (clearanceLevel) {
      case 'None': return '#4caf50'; // Green
      case 'Public Trust': return '#ff9800'; // Orange
      case 'Secret': return '#f44336'; // Red
      case 'Top Secret': return '#9c27b0'; // Purple
      default: return '#757575'; // Grey
    }
  }

  /**
   * Get location icon for UI
   */
  public static getLocationIcon(location: 'Remote' | 'On-site' | 'Hybrid'): string {
    switch (location) {
      case 'Remote': return '🏠';
      case 'On-site': return '🏢';
      case 'Hybrid': return '🔄';
      default: return '📍';
    }
  }
}
