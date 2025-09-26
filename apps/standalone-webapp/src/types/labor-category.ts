/**
 * Labor Category Types
 * Defines interfaces for labor category input and management
 */

export interface LaborCategoryInput {
  id?: string;
  title: string;
  baseRate: number;
  hours: number;
  ftePercentage: number;
  clearanceLevel: 'None' | 'Public Trust' | 'Secret' | 'Top Secret';
  location: 'Remote' | 'On-site' | 'Hybrid';
}

export interface LaborCategoryResult {
  id?: string;
  title: string;
  baseRate: number;
  hours: number;
  ftePercentage: number;
  effectiveHours: number;
  clearanceLevel: 'None' | 'Public Trust' | 'Secret' | 'Top Secret';
  location: 'Remote' | 'On-site' | 'Hybrid';
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

export interface LaborCategorySummary {
  totalCategories: number;
  totalHours: number;
  totalEffectiveHours: number;
  totalBaseCost: number;
  totalBurdenedCost: number;
  averageBaseRate: number;
  averageBurdenedRate: number;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface LaborCategoryFormData {
  categories: LaborCategoryInput[];
  errors: Record<string, ValidationError[]>;
  summary: LaborCategorySummary;
}
