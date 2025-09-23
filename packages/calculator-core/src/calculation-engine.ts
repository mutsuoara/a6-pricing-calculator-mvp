/**
 * Core pricing calculation engine
 * Implements government contracting pricing calculations with compounding burden rates
 */

import {
  CalculationResult,
  LaborCategory,
  LaborCategoryResult,
  OtherDirectCost,
  OtherDirectCostResult,
  PricingSettings,
  ClearanceLevel
} from '@pricing-calculator/types';

export class PricingCalculationEngine {
  private static readonly CLEARANCE_PREMIUMS: Record<ClearanceLevel, number> = {
    'None': 0.0,
    'Public Trust': 0.05,
    'Secret': 0.10,
    'Top Secret': 0.20
  };

  private static readonly TAX_RATE = 0.0875; // 8.75% default tax rate

  /**
   * Calculate pricing for a complete project
   */
  static calculateProject(
    settings: PricingSettings,
    laborCategories: LaborCategory[],
    otherDirectCosts: OtherDirectCost[] = []
  ): CalculationResult {
    const laborResults = this.calculateLaborCategories(settings, laborCategories);
    const odcResults = this.calculateOtherDirectCosts(otherDirectCosts);
    
    const totalLaborCost = laborResults.reduce((sum, result) => sum + result.totalCost, 0);
    const totalODCCost = odcResults.reduce((sum, result) => sum + result.totalAmount, 0);
    const totalProjectCost = totalLaborCost + totalODCCost;
    const totalEffectiveHours = laborResults.reduce((sum, result) => sum + result.effectiveHours, 0);
    const averageBurdenedRate = totalEffectiveHours > 0 ? totalLaborCost / totalEffectiveHours : 0;

    return {
      laborCategories: laborResults,
      otherDirectCosts: odcResults,
      totals: {
        totalLaborCost,
        totalODCCost,
        totalProjectCost,
        totalEffectiveHours,
        averageBurdenedRate
      },
      settings
    };
  }

  /**
   * Calculate pricing for labor categories
   */
  private static calculateLaborCategories(
    settings: PricingSettings,
    laborCategories: LaborCategory[]
  ): LaborCategoryResult[] {
    return laborCategories.map(category => this.calculateLaborCategory(settings, category));
  }

  /**
   * Calculate pricing for a single labor category
   */
  private static calculateLaborCategory(
    settings: PricingSettings,
    category: LaborCategory
  ): LaborCategoryResult {
    const effectiveHours = (category.hours * category.ftePercentage) / 100;
    const clearancePremium = this.CLEARANCE_PREMIUMS[category.clearanceLevel];
    const clearanceAdjustedRate = category.baseRate * (1 + clearancePremium);
    
    // Compounding burden calculation: Base → +Overhead → +G&A → +Fee
    const overheadAmount = clearanceAdjustedRate * settings.overheadRate;
    const overheadRate = clearanceAdjustedRate + overheadAmount;
    
    const gaAmount = overheadRate * settings.gaRate;
    const gaRate = overheadRate + gaAmount;
    
    const feeAmount = gaRate * settings.feeRate;
    const feeRate = gaRate + feeAmount;
    
    const burdenedRate = feeRate;
    const totalCost = burdenedRate * effectiveHours;

    return {
      id: category.id,
      title: category.title,
      baseRate: category.baseRate,
      hours: category.hours,
      ftePercentage: category.ftePercentage,
      effectiveHours,
      clearanceLevel: category.clearanceLevel,
      location: category.location,
      clearancePremium,
      clearanceAdjustedRate,
      overheadAmount,
      overheadRate,
      gaAmount,
      gaRate,
      feeAmount,
      feeRate,
      totalCost,
      burdenedRate
    };
  }

  /**
   * Calculate pricing for other direct costs
   */
  private static calculateOtherDirectCosts(
    otherDirectCosts: OtherDirectCost[]
  ): OtherDirectCostResult[] {
    return otherDirectCosts.map(odc => {
      const taxAmount = odc.taxable ? odc.amount * this.TAX_RATE : 0;
      const totalAmount = odc.amount + taxAmount;

      return {
        id: odc.id,
        description: odc.description,
        amount: odc.amount,
        category: odc.category,
        taxable: odc.taxable,
        taxAmount,
        totalAmount
      };
    });
  }

  /**
   * Calculate scenario comparison between different settings
   */
  static compareScenarios(
    baseSettings: PricingSettings,
    baseLaborCategories: LaborCategory[],
    baseOtherDirectCosts: OtherDirectCost[],
    scenarios: Array<{ name: string; settings: PricingSettings }>
  ) {
    const baseResult = this.calculateProject(baseSettings, baseLaborCategories, baseOtherDirectCosts);
    
    return scenarios.map(scenario => {
      const result = this.calculateProject(scenario.settings, baseLaborCategories, baseOtherDirectCosts);
      const totalCostVariance = result.totals.totalProjectCost - baseResult.totals.totalProjectCost;
      const totalCostVariancePercent = baseResult.totals.totalProjectCost > 0 
        ? (totalCostVariance / baseResult.totals.totalProjectCost) * 100 
        : 0;

      return {
        name: scenario.name,
        settings: scenario.settings,
        result,
        variance: {
          totalCostVariance,
          totalCostVariancePercent
        }
      };
    });
  }

  /**
   * Validate calculation inputs
   */
  static validateInputs(
    settings: PricingSettings,
    laborCategories: LaborCategory[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate settings
    if (settings.overheadRate < 0 || settings.overheadRate > 2.0) {
      errors.push('Overhead rate must be between 0% and 200%');
    }
    if (settings.gaRate < 0 || settings.gaRate > 2.0) {
      errors.push('G&A rate must be between 0% and 200%');
    }
    if (settings.feeRate < 0 || settings.feeRate > 1.0) {
      errors.push('Fee rate must be between 0% and 100%');
    }

    // Validate labor categories
    laborCategories.forEach((category, index) => {
      if (category.baseRate < 1 || category.baseRate > 1000) {
        errors.push(`Labor category ${index + 1}: Base rate must be between $1 and $1000`);
      }
      if (category.hours < 1 || category.hours > 10000) {
        errors.push(`Labor category ${index + 1}: Hours must be between 1 and 10,000`);
      }
      if (category.ftePercentage < 0.01 || category.ftePercentage > 100) {
        errors.push(`Labor category ${index + 1}: FTE percentage must be between 0.01% and 100%`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
