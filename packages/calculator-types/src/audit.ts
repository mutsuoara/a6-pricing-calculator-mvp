/**
 * Audit logging and security types
 */

export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'PROJECT_CREATE' 
  | 'PROJECT_UPDATE' 
  | 'PROJECT_DELETE' 
  | 'PROJECT_VIEW' 
  | 'CALCULATION_PERFORMED' 
  | 'EXPORT_GENERATED' 
  | 'TEMPLATE_CREATE' 
  | 'TEMPLATE_UPDATE' 
  | 'TEMPLATE_DELETE' 
  | 'USER_ROLE_CHANGE' 
  | 'SETTINGS_UPDATE';

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditQuery {
  tenantId: string;
  userId?: string;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SecurityEvent {
  id: string;
  tenantId: string;
  eventType: 'AUTHENTICATION_FAILURE' | 'AUTHORIZATION_FAILURE' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}
