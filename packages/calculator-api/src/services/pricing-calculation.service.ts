/**
 * Pricing Calculation Service
 * Core calculation engine for government contracting pricing
 * Provides stateless calculation methods with validation and scenario modeling
 */

import { 
  PricingSettings, 
  CalculationResult,
  LaborCategoryResult,
  OtherDirectCostResult,
  ScenarioComparison,
  ClearanceLevel,
  LocationType
} from '@pricing-calculator/types';

export interface CalculationInput {
  settings: PricingSettings;
  laborCategories: LaborCategoryInput[];
  otherDirectCosts: OtherDirectCostInput[];
}

export interface LaborCategoryInput {
  id?: string;
  title: string;
  baseRate: number;
  hours: number;
  ftePercentage: number;
  clearanceLevel: ClearanceLevel;
  location: LocationType;
}

export interface OtherDirectCostInput {
  id?: string;
  description: string;
  amount: number;
  category: 'Travel' | 'Equipment' | 'Software' | 'Other';
  taxable: boolean;
  taxRate: number;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ScenarioInput {
  name: string;
  settings: PricingSettings;
  laborCategories: LaborCategoryInput[];
  otherDirectCosts: OtherDirectCostInput[];
}

export class PricingCalculationService {
  
  /**
   * Calculate complete pricing for a project
   */
  public static calculateProject(input: CalculationInput): CalculationResult {
    // Validate inputs
    const validationErrors = this.validateCalculationInput(input);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    // Calculate labor categories
    const laborResults = input.laborCategories.map(lc => 
      this.calculateLaborCategory(lc, input.settings)
    );

    // Calculate other direct costs
    const odcResults = input.otherDirectCosts.map(odc => 
      this.calculateOtherDirectCost(odc)
    );

    // Calculate totals
    const totalLaborCost = laborResults.reduce((sum, lr) => sum + lr.totalCost, 0);
    const totalODCCost = odcResults.reduce((sum, odc) => sum + odc.totalAmount, 0);
    const totalProjectCost = totalLaborCost + totalODCCost;
    const totalEffectiveHours = laborResults.reduce((sum, lr) => sum + lr.effectiveHours, 0);
    const averageBurdenedRate = totalEffectiveHours > 0 ? totalLaborCost / totalEffectiveHours : 0;

    return {
      laborCategories: laborResults,
      otherDirectCosts: odcResults,
      totals: {
        totalLaborCost,
        totalODCCost,
        totalProjectCost,
        totalEffectiveHours,
        averageBurdenedRate,
      },
      settings: input.settings,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calculate individual labor category with full breakdown
   */
  public static calculateLaborCategory(
    laborCategory: LaborCategoryInput, 
    settings: PricingSettings
  ): LaborCategoryResult {
    // Calculate effective hours
    const effectiveHours = laborCategory.hours * (laborCategory.ftePercentage / 100);

    // Calculate clearance premium
    const clearancePremium = this.calculateClearancePremium(laborCategory.clearanceLevel);
    
    // Calculate clearance adjusted rate
    const clearanceAdjustedRate = laborCategory.baseRate * (1 + clearancePremium);

    // Calculate burdened rate with compounding OH, G&A, and Fee
    const burdenedRate = clearanceAdjustedRate * 
      (1 + settings.overheadRate) * 
      (1 + settings.gaRate) * 
      (1 + settings.feeRate);

    // Calculate individual burden components
    const overheadAmount = clearanceAdjustedRate * settings.overheadRate * effectiveHours;
    const gaAmount = clearanceAdjustedRate * (1 + settings.overheadRate) * settings.gaRate * effectiveHours;
    const feeAmount = clearanceAdjustedRate * (1 + settings.overheadRate) * (1 + settings.gaRate) * settings.feeRate * effectiveHours;

    // Calculate total cost
    const totalCost = burdenedRate * effectiveHours;

    return {
      id: laborCategory.id || '',
      title: laborCategory.title,
      baseRate: laborCategory.baseRate,
      hours: laborCategory.hours,
      ftePercentage: laborCategory.ftePercentage,
      effectiveHours,
      clearanceLevel: laborCategory.clearanceLevel,
      location: laborCategory.location,
      clearancePremium,
      clearanceAdjustedRate,
      overheadAmount,
      overheadRate: settings.overheadRate,
      gaAmount,
      gaRate: settings.gaRate,
      feeAmount,
      feeRate: settings.feeRate,
      totalCost,
      burdenedRate,
    };
  }

  /**
   * Calculate other direct cost with tax
   */
  public static calculateOtherDirectCost(odc: OtherDirectCostInput): OtherDirectCostResult {
    const taxAmount = odc.taxable ? odc.amount * odc.taxRate : 0;
    const totalAmount = odc.amount + taxAmount;

    return {
      id: odc.id || '',
      description: odc.description,
      amount: odc.amount,
      category: odc.category,
      taxable: odc.taxable,
      taxAmount,
      totalAmount,
      taxRate: odc.taxRate,
    };
  }

  /**
   * Calculate clearance premium percentage
   */
  public static calculateClearancePremium(clearanceLevel: ClearanceLevel): number {
    switch (clearanceLevel) {
      case 'Public Trust': return 0.05; // 5%
      case 'Secret': return 0.10; // 10%
      case 'Top Secret': return 0.20; // 20%
      case 'None':
      default: return 0;
    }
  }

  /**
   * Compare multiple scenarios
   */
  public static compareScenarios(scenarios: ScenarioInput[]): ScenarioComparison {
    if (scenarios.length < 2) {
      throw new Error('At least 2 scenarios required for comparison');
    }

    const results = scenarios.map(scenario => ({
      name: scenario.name,
      result: this.calculateProject(scenario),
    }));

    // Use first scenario as baseline
    const baseline = results[0];
    if (!baseline) {
      throw new Error('No baseline scenario found');
    }
    
    const comparisons = results.slice(1).map(scenario => {
      const laborVariance = scenario.result.totals.totalLaborCost - baseline.result.totals.totalLaborCost;
      const odcVariance = scenario.result.totals.totalODCCost - baseline.result.totals.totalODCCost;
      const totalVariance = scenario.result.totals.totalProjectCost - baseline.result.totals.totalProjectCost;
      
      const laborVariancePercent = baseline.result.totals.totalLaborCost > 0 
        ? (laborVariance / baseline.result.totals.totalLaborCost) * 100 
        : 0;
      
      const totalVariancePercent = baseline.result.totals.totalProjectCost > 0 
        ? (totalVariance / baseline.result.totals.totalProjectCost) * 100 
        : 0;

      return {
        scenarioName: scenario.name,
        laborVariance,
        laborVariancePercent,
        odcVariance,
        totalVariance,
        totalVariancePercent,
        settings: scenario.result.settings,
      };
    });

    return {
      baseline: baseline.result,
      comparisons,
      comparedAt: new Date().toISOString(),
    };
  }

  /**
   * Validate calculation input
   */
  public static validateCalculationInput(input: CalculationInput): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate settings
    errors.push(...this.validateSettings(input.settings));

    // Validate labor categories
    input.laborCategories.forEach((lc, index) => {
      errors.push(...this.validateLaborCategory(lc, index));
    });

    // Validate other direct costs
    input.otherDirectCosts.forEach((odc, index) => {
      errors.push(...this.validateOtherDirectCost(odc, index));
    });

    return errors;
  }

  /**
   * Validate pricing settings
   */
  public static validateSettings(settings: PricingSettings): ValidationError[] {
    const errors: ValidationError[] = [];

    if (settings.overheadRate < 0 || settings.overheadRate > 2) {
      errors.push({
        field: 'overheadRate',
        message: 'Overhead rate must be between 0% and 200%',
        value: settings.overheadRate,
      });
    }

    if (settings.gaRate < 0 || settings.gaRate > 2) {
      errors.push({
        field: 'gaRate',
        message: 'G&A rate must be between 0% and 200%',
        value: settings.gaRate,
      });
    }

    if (settings.feeRate < 0 || settings.feeRate > 1) {
      errors.push({
        field: 'feeRate',
        message: 'Fee rate must be between 0% and 100%',
        value: settings.feeRate,
      });
    }

    if (!settings.contractType || !['FFP', 'T&M', 'CPFF'].includes(settings.contractType)) {
      errors.push({
        field: 'contractType',
        message: 'Contract type must be FFP, T&M, or CPFF',
        value: settings.contractType,
      });
    }

    if (!settings.periodOfPerformance?.startDate || !settings.periodOfPerformance?.endDate) {
      errors.push({
        field: 'periodOfPerformance',
        message: 'Period of performance dates are required',
        value: settings.periodOfPerformance,
      });
    }

    if (settings.periodOfPerformance?.startDate && settings.periodOfPerformance?.endDate) {
      const startDate = new Date(settings.periodOfPerformance.startDate);
      const endDate = new Date(settings.periodOfPerformance.endDate);

      if (startDate >= endDate) {
        errors.push({
          field: 'periodOfPerformance',
          message: 'Start date must be before end date',
          value: settings.periodOfPerformance,
        });
      }
    }

    return errors;
  }

  /**
   * Validate labor category
   */
  public static validateLaborCategory(lc: LaborCategoryInput, index: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const prefix = `laborCategories[${index}]`;

    if (!lc.title || lc.title.trim().length === 0) {
      errors.push({
        field: `${prefix}.title`,
        message: 'Labor category title is required',
        value: lc.title,
      });
    }

    if (lc.baseRate < 1 || lc.baseRate > 1000) {
      errors.push({
        field: `${prefix}.baseRate`,
        message: 'Base rate must be between $1 and $1000',
        value: lc.baseRate,
      });
    }

    if (lc.hours < 1 || lc.hours > 10000) {
      errors.push({
        field: `${prefix}.hours`,
        message: 'Hours must be between 1 and 10000',
        value: lc.hours,
      });
    }

    if (lc.ftePercentage < 0.01 || lc.ftePercentage > 100) {
      errors.push({
        field: `${prefix}.ftePercentage`,
        message: 'FTE percentage must be between 0.01% and 100%',
        value: lc.ftePercentage,
      });
    }

    if (!lc.clearanceLevel || !['None', 'Public Trust', 'Secret', 'Top Secret'].includes(lc.clearanceLevel)) {
      errors.push({
        field: `${prefix}.clearanceLevel`,
        message: 'Invalid clearance level',
        value: lc.clearanceLevel,
      });
    }

    if (!lc.location || !['Remote', 'On-site', 'Hybrid'].includes(lc.location)) {
      errors.push({
        field: `${prefix}.location`,
        message: 'Invalid location type',
        value: lc.location,
      });
    }

    return errors;
  }

  /**
   * Validate other direct cost
   */
  public static validateOtherDirectCost(odc: OtherDirectCostInput, index: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const prefix = `otherDirectCosts[${index}]`;

    if (!odc.description || odc.description.trim().length === 0) {
      errors.push({
        field: `${prefix}.description`,
        message: 'Description is required',
        value: odc.description,
      });
    }

    if (odc.amount < 0) {
      errors.push({
        field: `${prefix}.amount`,
        message: 'Amount must be non-negative',
        value: odc.amount,
      });
    }

    if (odc.taxRate < 0 || odc.taxRate > 1) {
      errors.push({
        field: `${prefix}.taxRate`,
        message: 'Tax rate must be between 0% and 100%',
        value: odc.taxRate,
      });
    }

    if (!odc.category || !['Travel', 'Equipment', 'Software', 'Other'].includes(odc.category)) {
      errors.push({
        field: `${prefix}.category`,
        message: 'Invalid category',
        value: odc.category,
      });
    }

    return errors;
  }

  /**
   * Generate Excel export data structure
   */
  public static generateExcelExportData(result: CalculationResult): any {
    return {
      projectInfo: {
        calculatedAt: result.calculatedAt,
        contractType: result.settings.contractType,
        periodOfPerformance: result.settings.periodOfPerformance,
      },
      settings: {
        overheadRate: result.settings.overheadRate,
        gaRate: result.settings.gaRate,
        feeRate: result.settings.feeRate,
      },
      laborCategories: result.laborCategories.map(lc => ({
        title: lc.title,
        baseRate: lc.baseRate,
        hours: lc.hours,
        ftePercentage: lc.ftePercentage,
        effectiveHours: lc.effectiveHours,
        clearanceLevel: lc.clearanceLevel,
        location: lc.location,
        clearancePremium: lc.clearancePremium,
        clearanceAdjustedRate: lc.clearanceAdjustedRate,
        overheadAmount: lc.overheadAmount,
        gaAmount: lc.gaAmount,
        feeAmount: lc.feeAmount,
        totalCost: lc.totalCost,
        burdenedRate: lc.burdenedRate,
      })),
      otherDirectCosts: result.otherDirectCosts.map(odc => ({
        description: odc.description,
        amount: odc.amount,
        category: odc.category,
        taxable: odc.taxable,
        taxAmount: odc.taxAmount,
        totalAmount: odc.totalAmount,
        taxRate: odc.taxRate,
      })),
      totals: result.totals,
    };
  }

  /**
   * Calculate burden rate for a given base rate and settings
   */
  public static calculateBurdenRate(
    baseRate: number, 
    clearanceLevel: ClearanceLevel, 
    settings: PricingSettings
  ): number {
    const clearancePremium = this.calculateClearancePremium(clearanceLevel);
    const clearanceAdjustedRate = baseRate * (1 + clearancePremium);
    
    return clearanceAdjustedRate * 
      (1 + settings.overheadRate) * 
      (1 + settings.gaRate) * 
      (1 + settings.feeRate);
  }

  /**
   * Calculate effective hours for labor category
   */
  public static calculateEffectiveHours(hours: number, ftePercentage: number): number {
    return hours * (ftePercentage / 100);
  }
}
