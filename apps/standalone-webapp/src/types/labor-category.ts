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
  // LCAT Integration fields
  lcatId?: string;
  lcatName?: string;
  lcatCode?: string;
  lcatDescription?: string;
  lcatRate?: number;
  vehicle?: string;
  // Project Role fields
  projectRoleId?: string;
  projectRoleName?: string;
  projectRoleDescription?: string;
  // Company Role fields
  companyRoleId: string;
  companyRoleName: string;
  companyRoleRate: number;
  // Final Rate with metadata
  finalRate: number;
  finalRateMetadata: {
    source: 'lcat' | 'company' | 'manual';
    reason?: string;
    timestamp?: string;
    userId?: string;
  };
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
  severity: 'error' | 'warning' | 'info';
  canOverride?: boolean;
  overrideReason?: string;
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

export interface LaborCategoryFormData {
  categories: LaborCategoryInput[];
  errors: Record<string, ValidationError[]>;
  summary: LaborCategorySummary;
}
