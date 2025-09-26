/**
 * Core pricing calculation types and interfaces
 */

export type ContractType = 'FFP' | 'T&M' | 'CPFF';

export type ClearanceLevel = 'None' | 'Public Trust' | 'Secret' | 'Top Secret';

export type LocationType = 'Remote' | 'On-site' | 'Hybrid';

export interface PricingSettings {
  projectId?: string;
  overheadRate: number; // 0-200% (0.0-2.0)
  gaRate: number; // 0-200% (0.0-2.0) 
  feeRate: number; // 0-100% (0.0-1.0)
  contractType: ContractType;
  periodOfPerformance: {
    startDate: string; // ISO date string
    endDate: string; // ISO date string
  };
}

export interface LaborCategory {
  id: string;
  title: string;
  baseRate: number; // $1-$1000
  hours: number; // 1-10000
  ftePercentage: number; // 0.01-100%
  clearanceLevel: ClearanceLevel;
  location: LocationType;
  effectiveHours: number; // calculated: hours * ftePercentage / 100
}

export interface OtherDirectCost {
  id: string;
  description: string;
  amount: number;
  category: 'Travel' | 'Equipment' | 'Software' | 'Other';
  taxable: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  severity: 'error' | 'warning' | 'info';
  canOverride?: boolean;
  overrideReason?: string;
}

export interface CalculationResult {
  projectId?: string;
  laborCategories: LaborCategoryResult[];
  otherDirectCosts: OtherDirectCostResult[];
  totals: {
    laborCost: number;
    odcCost: number;
    totalCost: number;
  };
  settings: PricingSettings;
  calculatedAt: string;
  validationWarnings?: ValidationError[];
}

export interface LaborCategoryResult {
  id: string;
  title: string;
  baseRate: number;
  hours: number;
  ftePercentage: number;
  effectiveHours: number;
  clearanceLevel: ClearanceLevel;
  location: LocationType;
  clearancePremium: number;
  clearanceAdjustedRate: number;
  overheadAmount: number;
  overheadRate: number;
  gaAmount: number;
  gaRate: number;
  feeAmount: number;
  feeRate: number;
  totalCost: number;
  burdenedRate: number;
}

export interface OtherDirectCostResult {
  id: string;
  description: string;
  amount: number;
  category: string;
  taxable: boolean;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
}

export interface ScenarioComparison {
  baseline: CalculationResult;
  comparisons: Array<{
    scenarioName: string;
    laborVariance: number;
    laborVariancePercent: number;
    odcVariance: number;
    totalVariance: number;
    totalVariancePercent: number;
    settings: PricingSettings;
  }>;
  comparedAt: string;
}

