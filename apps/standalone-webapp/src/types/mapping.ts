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

export interface A6Level {
  id: string;
  name: string; // e.g., "Engineering V", "Product III"
  category: 'Engineering' | 'Product' | 'Experience' | 'Management';
  level: number; // 1-5 for Engineering, 1-3 for Product, etc.
  description: string;
  rateRange: {
    min: number;
    max: number;
    typical: number;
  };
  clearanceRequirements: string[];
  locationRequirements: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProjectRole {
  id: string;
  name: string; // e.g., "Engineering Lead (KP)", "Lead Product Manager (KP)"
  description: string;
  a6LevelId: string;
  typicalClearance: 'None' | 'Public Trust' | 'Secret' | 'Top Secret';
  typicalLocation: 'Remote' | 'On-site' | 'Hybrid';
  typicalHours: number; // Default hours per year
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SPRUCELCAT {
  id: string;
  name: string; // e.g., "Software Engineer", "Product Manager"
  code: string; // e.g., "SWE", "PM"
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CompanyRole {
  id: string;
  name: string; // e.g., "Senior Software Engineer", "Lead Product Manager"
  practiceArea: string; // e.g., "Engineering", "Product", "Design", "Data Science"
  description: string;
  payBand: string; // e.g., "Band 5", "Senior Level", "Principal Level"
  rateIncrease: number; // Annual rate increase percentage (e.g., 0.03 for 3%)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ThreeWayMapping {
  id: string;
  contractVehicleId: string;
  projectId: string;
  spruceLCATId: string;
  projectRoleId: string;
  a6LevelId: string;
  
  // Rate information
  spruceRate: number;
  a6MinimumRate: number;
  maxSubcontractorRate?: number;
  
  // Project-specific overrides
  projectEscalationRate?: number;
  projectStartDate?: string;
  projectEndDate?: string;
  
  // Validation rules
  allowRateOverride: boolean;
  requireApproval: boolean;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RateValidationRule {
  id: string;
  a6LevelId: string;
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
  entityType: 'ContractVehicle' | 'A6Level' | 'ProjectRole' | 'SPRUCELCAT' | 'CompanyRole' | 'ThreeWayMapping' | 'RateValidationRule';
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
  a6Levels: A6Level[];
  projectRoles: ProjectRole[];
  spruceLCATs: SPRUCELCAT[];
  companyRoles: CompanyRole[];
  threeWayMappings: ThreeWayMapping[];
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
  a6LevelId?: string;
  
  // Named Individual
  namedIndividual?: string;
  
  // Rate Information
  spruceRate?: number;
  a6MinimumRate?: number;
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
    a6MinimumRate: number;
    proposalRate: number;
    discountFromSpruce: number;
    aboveA6Minimum: boolean;
  };
  
  // Escalation calculations
  escalationCalculation?: EscalationCalculation;
  
  // Validation results
  validationWarnings: string[];
  validationErrors: string[];
}

