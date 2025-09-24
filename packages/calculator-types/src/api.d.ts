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
export interface CreateProjectRequest {
    name: string;
    description?: string;
    settings: any;
    laborCategories: any[];
    otherDirectCosts: any[];
    tags?: string[];
}
export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    settings?: any;
    laborCategories?: any[];
    otherDirectCosts?: any[];
    tags?: string[];
}
export interface ProjectListResponse {
    projects: any[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
export interface CalculateRequest {
    settings: any;
    laborCategories: any[];
    otherDirectCosts?: any[];
}
export interface CalculateResponse {
    result: any;
    calculationTime: number;
    timestamp: string;
}
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
export interface CreateTemplateRequest {
    name: string;
    description: string;
    projectId: string;
    category: string;
    isPublic?: boolean;
}
export interface TemplateListResponse {
    templates: any[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
//# sourceMappingURL=api.d.ts.map