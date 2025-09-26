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
  severity: 'error' | 'warning' | 'info';
  canOverride?: boolean;
  overrideReason?: string;
}

export interface ScenarioInput {
  name: string;
  settings: PricingSettings;
  laborCategories: LaborCategoryInput[];
  otherDirectCosts: OtherDirectCostInput[];
}

export interface OverridePermissions {
  canOverrideRates: boolean;
  canOverrideContractLimits: boolean;
  canOverrideValidation: boolean;
  userRole: string;
  reason?: string;
}

export interface ValidationContext {
  contractVehicle?: string;
  permissions?: OverridePermissions;
  allowOverrides?: boolean;
}

export class PricingCalculationService {
  
  /**
   * Get contract vehicle rate limits
   */
  private static getContractVehicleLimits(contractVehicle: string): { maxOverheadRate: number; maxGaRate: number; maxFeeRate: number } | null {
    const limits: Record<string, { maxOverheadRate: number; maxGaRate: number; maxFeeRate: number }> = {
      'GSA MAS': { maxOverheadRate: 0.40, maxGaRate: 0.15, maxFeeRate: 0.10 },
      'VA SPRUCE': { maxOverheadRate: 0.35, maxGaRate: 0.12, maxFeeRate: 0.08 },
      'OPM (GSA)': { maxOverheadRate: 0.38, maxGaRate: 0.14, maxFeeRate: 0.09 },
      'HHS SWIFT (GSA)': { maxOverheadRate: 0.42, maxGaRate: 0.16, maxFeeRate: 0.11 },
      '8(a)': { maxOverheadRate: 0.35, maxGaRate: 0.12, maxFeeRate: 0.08 },
      'SBIR': { maxOverheadRate: 0.25, maxGaRate: 0.10, maxFeeRate: 0.05 },
      'IDIQ': { maxOverheadRate: 0.50, maxGaRate: 0.20, maxFeeRate: 0.15 },
    };
    
    return limits[contractVehicle] || null;
  }
  
  /**
   * Validate calculation input with override support
   */
  public static validateWithOverrides(input: CalculationInput, context?: ValidationContext): { 
    errors: ValidationError[]; 
    warnings: ValidationError[]; 
    canProceed: boolean; 
  } {
    const allErrors = this.validateCalculationInput(input, context);
    
    const errors = allErrors.filter(e => e.severity === 'error');
    const warnings = allErrors.filter(e => e.severity === 'warning' || e.severity === 'info');
    
    // Can proceed if there are no errors, or if all errors can be overridden and user has permission
    const canProceed = errors.length === 0 || 
      (context?.permissions?.canOverrideValidation === true && 
       errors.every(e => e.canOverride === true));
    
    return { errors, warnings, canProceed };
  }

  /**
   * Calculate complete pricing for a project with validation context
   */
  public static calculateProjectWithContext(input: CalculationInput, context?: ValidationContext): CalculationResult {
    // Validate inputs with override support
    const validation = this.validateWithOverrides(input, context);
    
    if (!validation.canProceed) {
      const errorMessages = validation.errors.map(e => e.message).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    
    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Validation warnings:', validation.warnings.map(w => w.message));
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
    const totalLaborCost = laborResults.reduce((sum, result) => sum + result.totalCost, 0);
    const totalODCCost = odcResults.reduce((sum, result) => sum + result.totalAmount, 0);
    const totalProjectCost = totalLaborCost + totalODCCost;

    return {
      projectId: input.settings.projectId || '',
      settings: input.settings,
      laborCategories: laborResults,
      otherDirectCosts: odcResults,
      totals: {
        laborCost: totalLaborCost,
        odcCost: totalODCCost,
        totalCost: totalProjectCost,
      },
      calculatedAt: new Date().toISOString(),
      validationWarnings: validation.warnings,
    };
  }
  
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

    return {
      projectId: input.settings.projectId || '',
      laborCategories: laborResults,
      otherDirectCosts: odcResults,
      totals: {
        laborCost: totalLaborCost,
        odcCost: totalODCCost,
        totalCost: totalProjectCost,
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
      const laborVariance = scenario.result.totals.laborCost - baseline.result.totals.laborCost;
      const odcVariance = scenario.result.totals.odcCost - baseline.result.totals.odcCost;
      const totalVariance = scenario.result.totals.totalCost - baseline.result.totals.totalCost;
      
      const laborVariancePercent = baseline.result.totals.laborCost > 0 
        ? (laborVariance / baseline.result.totals.laborCost) * 100 
        : 0;
      
      const totalVariancePercent = baseline.result.totals.totalCost > 0 
        ? (totalVariance / baseline.result.totals.totalCost) * 100 
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
   * Validate calculation input with optional override support
   */
  public static validateCalculationInput(input: CalculationInput, context?: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate settings
    errors.push(...this.validateSettings(input.settings, context));

    // Validate labor categories
    input.laborCategories.forEach((lc, index) => {
      errors.push(...this.validateLaborCategory(lc, index, context));
    });

    // Validate other direct costs
    input.otherDirectCosts.forEach((odc, index) => {
      errors.push(...this.validateOtherDirectCost(odc, index, context));
    });

    return errors;
  }

  /**
   * Validate pricing settings with contract vehicle limits and override support
   */
  public static validateSettings(settings: PricingSettings, context?: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];

    // Basic range validation (always enforced)
    if (settings.overheadRate < 0) {
      errors.push({
        field: 'overheadRate',
        message: 'Overhead rate cannot be negative',
        value: settings.overheadRate,
        severity: 'error',
        canOverride: false,
      });
    }

    if (settings.gaRate < 0) {
      errors.push({
        field: 'gaRate',
        message: 'G&A rate cannot be negative',
        value: settings.gaRate,
        severity: 'error',
        canOverride: false,
      });
    }

    if (settings.feeRate < 0) {
      errors.push({
        field: 'feeRate',
        message: 'Fee rate cannot be negative',
        value: settings.feeRate,
        severity: 'error',
        canOverride: false,
      });
    }

    // Contract vehicle specific validation
    if (context?.contractVehicle) {
      const contractLimits = this.getContractVehicleLimits(context.contractVehicle);
      
      if (contractLimits) {
        // Check overhead rate against contract limits
        if (settings.overheadRate > contractLimits.maxOverheadRate) {
          const canOverride = context.permissions?.canOverrideContractLimits || false;
          const error: ValidationError = {
            field: 'overheadRate',
            message: `Overhead rate (${(settings.overheadRate * 100).toFixed(1)}%) exceeds ${context.contractVehicle} limit (${contractLimits.maxOverheadRate}%)`,
            value: settings.overheadRate,
            severity: canOverride ? 'warning' : 'error',
            canOverride,
          };
          if (canOverride) {
            error.overrideReason = 'Contract vehicle limit exceeded';
          }
          errors.push(error);
        }

        // Check G&A rate against contract limits
        if (settings.gaRate > contractLimits.maxGaRate) {
          const canOverride = context.permissions?.canOverrideContractLimits || false;
          const error: ValidationError = {
            field: 'gaRate',
            message: `G&A rate (${(settings.gaRate * 100).toFixed(1)}%) exceeds ${context.contractVehicle} limit (${contractLimits.maxGaRate}%)`,
            value: settings.gaRate,
            severity: canOverride ? 'warning' : 'error',
            canOverride,
          };
          if (canOverride) {
            error.overrideReason = 'Contract vehicle limit exceeded';
          }
          errors.push(error);
        }

        // Check fee rate against contract limits
        if (settings.feeRate > contractLimits.maxFeeRate) {
          const canOverride = context.permissions?.canOverrideContractLimits || false;
          const error: ValidationError = {
            field: 'feeRate',
            message: `Fee rate (${(settings.feeRate * 100).toFixed(1)}%) exceeds ${context.contractVehicle} limit (${contractLimits.maxFeeRate}%)`,
            value: settings.feeRate,
            severity: canOverride ? 'warning' : 'error',
            canOverride,
          };
          if (canOverride) {
            error.overrideReason = 'Contract vehicle limit exceeded';
          }
          errors.push(error);
        }
      }
    } else {
      // Fallback to general limits when no contract vehicle specified
      if (settings.overheadRate > 1) { // 100%
        errors.push({
          field: 'overheadRate',
          message: 'Overhead rate exceeds 100% - consider selecting a contract vehicle for specific limits',
          value: settings.overheadRate,
          severity: 'warning',
          canOverride: true,
          overrideReason: 'General rate limit exceeded',
        });
      }

      if (settings.gaRate > 0.5) { // 50%
        errors.push({
          field: 'gaRate',
          message: 'G&A rate exceeds 50% - consider selecting a contract vehicle for specific limits',
          value: settings.gaRate,
          severity: 'warning',
          canOverride: true,
          overrideReason: 'General rate limit exceeded',
        });
      }

      if (settings.feeRate > 0.2) { // 20%
        errors.push({
          field: 'feeRate',
          message: 'Fee rate exceeds 20% - consider selecting a contract vehicle for specific limits',
          value: settings.feeRate,
          severity: 'warning',
          canOverride: true,
          overrideReason: 'General rate limit exceeded',
        });
      }
    }

    // Contract type validation
    if (!settings.contractType || !['FFP', 'T&M', 'CPFF'].includes(settings.contractType)) {
      errors.push({
        field: 'contractType',
        message: 'Contract type must be FFP, T&M, or CPFF',
        value: settings.contractType,
        severity: 'error',
        canOverride: false,
      });
    }

    // Period of performance validation
    if (!settings.periodOfPerformance?.startDate || !settings.periodOfPerformance?.endDate) {
      errors.push({
        field: 'periodOfPerformance',
        message: 'Period of performance dates are required',
        value: settings.periodOfPerformance,
        severity: 'error',
        canOverride: false,
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
          severity: 'error',
          canOverride: false,
        });
      }
    }

    return errors;
  }

  /**
   * Validate labor category
   */
  public static validateLaborCategory(lc: LaborCategoryInput, index: number, context?: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];
    const prefix = `laborCategories[${index}]`;

    if (!lc.title || lc.title.trim().length === 0) {
      errors.push({
        field: `${prefix}.title`,
        message: 'Labor category title is required',
        value: lc.title,
        severity: 'error',
        canOverride: false,
      });
    }

    if (lc.baseRate < 1 || lc.baseRate > 1000) {
      const canOverride = context?.permissions?.canOverrideValidation || false;
      const error: ValidationError = {
        field: `${prefix}.baseRate`,
        message: 'Base rate must be between $1 and $1000',
        value: lc.baseRate,
        severity: canOverride ? 'warning' : 'error',
        canOverride,
      };
      if (canOverride) {
        error.overrideReason = 'Rate limit exceeded';
      }
      errors.push(error);
    }

    if (lc.hours < 1 || lc.hours > 10000) {
      const canOverride = context?.permissions?.canOverrideValidation || false;
      const error: ValidationError = {
        field: `${prefix}.hours`,
        message: 'Hours must be between 1 and 10000',
        value: lc.hours,
        severity: canOverride ? 'warning' : 'error',
        canOverride,
      };
      if (canOverride) {
        error.overrideReason = 'Hours limit exceeded';
      }
      errors.push(error);
    }

    if (lc.ftePercentage < 0.01 || lc.ftePercentage > 100) {
      errors.push({
        field: `${prefix}.ftePercentage`,
        message: 'FTE percentage must be between 0.01% and 100%',
        value: lc.ftePercentage,
        severity: 'error',
        canOverride: false,
      });
    }

    if (!lc.clearanceLevel || !['None', 'Public Trust', 'Secret', 'Top Secret'].includes(lc.clearanceLevel)) {
      errors.push({
        field: `${prefix}.clearanceLevel`,
        message: 'Invalid clearance level',
        value: lc.clearanceLevel,
        severity: 'error',
        canOverride: false,
      });
    }

    if (!lc.location || !['Remote', 'On-site', 'Hybrid'].includes(lc.location)) {
      errors.push({
        field: `${prefix}.location`,
        message: 'Invalid location type',
        value: lc.location,
        severity: 'error',
        canOverride: false,
      });
    }

    return errors;
  }

  /**
   * Validate other direct cost
   */
  public static validateOtherDirectCost(odc: OtherDirectCostInput, index: number, _context?: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];
    const prefix = `otherDirectCosts[${index}]`;

    if (!odc.description || odc.description.trim().length === 0) {
      errors.push({
        field: `${prefix}.description`,
        message: 'Description is required',
        value: odc.description,
        severity: 'error',
        canOverride: false,
      });
    }

    if (odc.amount < 0) {
      errors.push({
        field: `${prefix}.amount`,
        message: 'Amount must be non-negative',
        value: odc.amount,
        severity: 'error',
        canOverride: false,
      });
    }

    if (odc.taxRate < 0 || odc.taxRate > 1) {
      errors.push({
        field: `${prefix}.taxRate`,
        message: 'Tax rate must be between 0% and 100%',
        value: odc.taxRate,
        severity: 'error',
        canOverride: false,
      });
    }

    if (!odc.category || !['Travel', 'Equipment', 'Software', 'Other'].includes(odc.category)) {
      errors.push({
        field: `${prefix}.category`,
        message: 'Invalid category',
        value: odc.category,
        severity: 'error',
        canOverride: false,
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
