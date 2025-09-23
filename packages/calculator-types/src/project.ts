/**
 * Project management and persistence types
 */

export interface PricingProject {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  settings: any; // Will be PricingSettings
  laborCategories: any[]; // Will be LaborCategory[]
  otherDirectCosts: any[]; // Will be OtherDirectCost[]
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
  isTemplate: boolean;
  tags: string[];
}

export interface ProjectTemplate {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  project: Omit<PricingProject, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'version'>;
  category: 'FFP' | 'T&M' | 'CPFF' | 'General';
  isPublic: boolean;
  createdAt: string;
  createdBy: string;
  usageCount: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  totalCost: number;
  totalHours: number;
  laborCategoryCount: number;
  lastModified: string;
  createdBy: string;
  isTemplate: boolean;
  tags: string[];
}

export interface ProjectSearchFilters {
  name?: string;
  tags?: string[];
  contractType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  createdBy?: string;
  isTemplate?: boolean;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: number;
  changes: string;
  createdAt: string;
  createdBy: string;
  data: PricingProject;
}
