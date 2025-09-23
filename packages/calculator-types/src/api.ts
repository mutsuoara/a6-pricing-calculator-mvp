/**
 * API request/response types and error handling
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

// Project API types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  settings: any; // Will be PricingSettings
  laborCategories: any[]; // Will be LaborCategory[]
  otherDirectCosts: any[]; // Will be OtherDirectCost[]
  tags?: string[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  settings?: any; // Will be PricingSettings
  laborCategories?: any[]; // Will be LaborCategory[]
  otherDirectCosts?: any[]; // Will be OtherDirectCost[]
  tags?: string[];
}

export interface ProjectListResponse {
  projects: any[]; // Will be ProjectSummary[]
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Calculation API types
export interface CalculateRequest {
  settings: any; // Will be PricingSettings
  laborCategories: any[]; // Will be LaborCategory[]
  otherDirectCosts?: any[]; // Will be OtherDirectCost[]
}

export interface CalculateResponse {
  result: any; // Will be CalculationResult
  calculationTime: number;
  timestamp: string;
}

// Export API types
export interface ExportRequest {
  projectId: string;
  format: 'excel' | 'pdf' | 'csv';
  includeBreakdown?: boolean;
  includeFormulas?: boolean;
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  expiresAt: string;
}

// Template API types
export interface CreateTemplateRequest {
  name: string;
  description: string;
  projectId: string;
  category: string;
  isPublic?: boolean;
}

export interface TemplateListResponse {
  templates: any[]; // Will be ProjectTemplate[]
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
