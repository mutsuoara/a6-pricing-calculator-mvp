/**
 * Mapping Types
 * Defines interfaces for the three-way mapping system: Contract Vehicle → Project → A6 Role
 */

export interface ContractVehicle {
  id: string;
  name: string;
  code: string; // e.g., "VA_SPRUCE", "GSA_MAS"
  description: string;
  startDate?: string;
  endDate?: string;
  escalationRate: number; // Annual escalation rate (e.g., 0.02 for 2%)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// A6Level interface removed - replaced with CompanyRole

export interface ProjectRole {
  id: string;
  name: string; // e.g., "Engineering Lead (KP)", "Lead Product Manager (KP)"
  description: string;
  typicalClearance: 'None' | 'Public Trust' | 'Secret' | 'Top Secret';
  typicalHours: number; // Default hours per year
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface LCAT {
  id: string;
  vehicle: string; // Contract vehicle (e.g., "VA SPRUCE", "GSA MAS", "8(a)", "SBIR")
  name: string; // e.g., "Software Engineer", "Product Manager"
  code: string; // e.g., "SWE", "PM"
  description: string;
  rate: number; // Generic rate field for any vehicle
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Keep SPRUCELCAT for backward compatibility, but it's now just an alias
export type SPRUCELCAT = LCAT;

export interface CompanyRole {
  id: string;
  name: string; // e.g., "Senior Software Engineer", "Lead Product Manager"
  practiceArea: string; // e.g., "Engineering", "Product", "Design", "Data Science"
  description: string;
  payBand: number; // Pay Band as dollar amount (e.g., 120000 for $120,000)
  rateIncrease: number; // Annual rate increase percentage (e.g., 0.03 for 3%)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ThreeWayMapping interface removed - simplified architecture

export interface RateValidationRule {
  id: string;
  companyRoleId: string; // References CompanyRole instead of A6Level
  contractVehicleId?: string; // Optional - if null, applies to all vehicles
  projectId?: string; // Optional - if null, applies to all projects
  
  minRate: number;
  maxRate: number;
  typicalRate: number;
  
  // Escalation rules
  maxEscalationRate: number;
  minEscalationRate: number;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  entityType: 'ContractVehicle' | 'ProjectRole' | 'SPRUCELCAT' | 'CompanyRole' | 'RateValidationRule';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT';
  userId: string;
  userName: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ImportTemplate {
  contractVehicles: ContractVehicle[];
  projectRoles: ProjectRole[];
  lcats: LCAT[];
  companyRoles: CompanyRole[];
  rateValidationRules: RateValidationRule[];
}

export interface EscalationCalculation {
  baseRate: number;
  escalationRate: number;
  startDate: string;
  endDate: string;
  calculatedRates: {
    year: number;
    rate: number;
    escalationAmount: number;
  }[];
  totalEscalation: number;
  finalRate: number;
}

// Enhanced Labor Category with all the new fields
export interface EnhancedLaborCategoryInput {
  id?: string;
  
  // Basic Information
  title: string;
  baseRate: number;
  hours: number;
  ftePercentage: number;
  clearanceLevel: 'None' | 'Public Trust' | 'Secret' | 'Top Secret';
  location: 'Remote' | 'On-site' | 'Hybrid';
  
  // Mapping Information
  contractVehicleId?: string;
  projectId?: string;
  spruceLCATId?: string;
  projectRoleId?: string;
  companyRoleId?: string; // References CompanyRole instead of A6Level
  
  // Named Individual
  namedIndividual?: string;
  
  // Rate Information
  spruceRate?: number;
  companyMinimumRate?: number; // Renamed from a6MinimumRate
  finalProposalRate?: number;
  maxSubcontractorRate?: number;
  finalSubcontractorRate?: number;
  
  // Prime/Sub Information
  primeOrSub: 'Prime' | 'Subcontractor';
  subcontractorCompany?: string;
  
  // Capacity
  capacity: number; // FTE percentage (1.0 = 100%)
  
  // Project-specific overrides
  projectEscalationRate?: number;
  projectStartDate?: string;
  projectEndDate?: string;
  
  // Validation
  rateOverrideReason?: string;
  requiresApproval?: boolean;
}

export interface EnhancedLaborCategoryResult extends EnhancedLaborCategoryInput {
  // Calculated fields
  effectiveHours: number;
  clearancePremium: number;
  clearanceAdjustedRate: number;
  overheadAmount: number;
  overheadRate: number;
  gaAmount: number;
  gaRate: number;
  feeAmount: number;
  feeRate: number;
  burdenedRate: number;
  totalCost: number;
  
  // Rate analysis
  finalRateDiscount?: number;
  rateComparison?: {
    spruceRate: number;
    companyMinimumRate: number; // Renamed from a6MinimumRate
    proposalRate: number;
    discountFromSpruce: number;
    aboveCompanyMinimum: boolean; // Renamed from aboveA6Minimum
  };
  
  // Escalation calculations
  escalationCalculation?: EscalationCalculation;
  
  // Validation results
  validationWarnings: string[];
  validationErrors: string[];
}

