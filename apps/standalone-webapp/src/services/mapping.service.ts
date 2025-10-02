/**
 * Mapping Service
 * Handles three-way mapping operations and rate validation
 */

import * as XLSX from 'xlsx';
import {
  ContractVehicle,
  ProjectRole,
  LCAT,
  CompanyRole,
  AuditLog,
  ImportTemplate,
  EscalationCalculation,
  EnhancedLaborCategoryInput,
  EnhancedLaborCategoryResult,
} from '../types/mapping';

export class MappingService {
  private static baseUrl = 'http://localhost:3001/api/lcat-management';

  // Contract Vehicle Management
  static async getContractVehicles(): Promise<ContractVehicle[]> {
    try {
      const response = await fetch(`${this.baseUrl}/contract-vehicles`);
      if (!response.ok) throw new Error('Failed to fetch contract vehicles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contract vehicles:', error);
      // Fallback to mock data
      return [
        {
          id: '1',
          name: 'VA SPRUCE',
          code: 'VA_SPRUCE',
          description: 'VA Software Product and User Experience Contract',
          startDate: '2024-01-01',
          endDate: '2028-12-31',
          escalationRate: 0.02, // 2% annual escalation
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
        {
          id: '2',
          name: 'GSA MAS',
          code: 'GSA_MAS',
          description: 'GSA Multiple Award Schedule',
          startDate: '2024-01-01',
          endDate: '2029-12-31',
          escalationRate: 0.015, // 1.5% annual escalation
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];
    }
  }

  static async createContractVehicle(vehicle: Omit<ContractVehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractVehicle> {
    try {
      const response = await fetch(`${this.baseUrl}/contract-vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicle),
      });
      
      if (!response.ok) throw new Error('Failed to create contract vehicle');
      return await response.json();
    } catch (error) {
      console.error('Error creating contract vehicle:', error);
      throw error;
    }
  }

  static async updateContractVehicle(id: string, vehicle: Omit<ContractVehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractVehicle> {
    try {
      const response = await fetch(`${this.baseUrl}/contract-vehicles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicle),
      });
      
      if (!response.ok) throw new Error('Failed to update contract vehicle');
      return await response.json();
    } catch (error) {
      console.error('Error updating contract vehicle:', error);
      throw error;
    }
  }

  // A6 Level Management removed - replaced with Company Roles

  // Project Role Management
  static async getProjectRoles(): Promise<ProjectRole[]> {
    try {
      const response = await fetch(`${this.baseUrl}/project-roles`);
      if (!response.ok) throw new Error('Failed to fetch project roles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching project roles:', error);
      // Fallback to mock data
      return [
        {
          id: '1',
          name: 'Engineering Lead (KP)',
          description: 'Key Personnel Engineering Lead',
          typicalClearance: 'Secret',
          typicalHours: 2080,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
        {
          id: '2',
          name: 'Lead Product Manager (KP)',
          description: 'Key Personnel Product Manager',
          typicalClearance: 'Public Trust',
          typicalHours: 2080,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];
    }
  }

  static async createProjectRole(role: Omit<ProjectRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectRole> {
    try {
      const response = await fetch(`${this.baseUrl}/project-roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(role),
      });
      
      if (!response.ok) throw new Error('Failed to create project role');
      return await response.json();
    } catch (error) {
      console.error('Error creating project role:', error);
      throw error;
    }
  }

  static async updateProjectRole(id: string, role: Omit<ProjectRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectRole> {
    try {
      const response = await fetch(`${this.baseUrl}/project-roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(role),
      });
      
      if (!response.ok) throw new Error('Failed to update project role');
      return await response.json();
    } catch (error) {
      console.error('Error updating project role:', error);
      throw error;
    }
  }

  // LCAT Management
  static async getLCATs(): Promise<LCAT[]> {
    try {
      const response = await fetch(`${this.baseUrl}/lcats`);
      if (!response.ok) throw new Error('Failed to fetch LCATs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching LCATs:', error);
      // Fallback to mock data
      return [
        {
          id: '1',
          vehicle: 'VA SPRUCE',
          name: 'Software Engineer',
          code: 'SWE',
          description: 'Software Engineering position',
          rate: 256.31,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
        {
          id: '2',
          vehicle: 'VA SPRUCE',
          name: 'Product Manager',
          code: 'PM',
          description: 'Product Management position',
          rate: 324.16,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
        {
          id: '3',
          vehicle: 'GSA MAS',
          name: 'Software Engineer',
          code: 'SWE',
          description: 'Software Engineering position',
          rate: 245.50,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
        {
          id: '4',
          vehicle: 'GSA MAS',
          name: 'Product Manager',
          code: 'PM',
          description: 'Product Management position',
          rate: 310.25,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];
    }
  }

  // Backward compatibility
  static async getSPRUCELCATs(): Promise<LCAT[]> {
    return this.getLCATs();
  }

  static async createLCAT(lcat: Omit<LCAT, 'id' | 'createdAt' | 'updatedAt'>): Promise<LCAT> {
    try {
      const response = await fetch(`${this.baseUrl}/lcats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lcat),
      });
      
      if (!response.ok) throw new Error('Failed to create LCAT');
      return await response.json();
    } catch (error) {
      console.error('Error creating LCAT:', error);
      throw error;
    }
  }

  static async updateLCAT(id: string, lcat: Omit<LCAT, 'id' | 'createdAt' | 'updatedAt'>): Promise<LCAT> {
    try {
      const response = await fetch(`${this.baseUrl}/lcats/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lcat),
      });
      
      if (!response.ok) throw new Error('Failed to update LCAT');
      return await response.json();
    } catch (error) {
      console.error('Error updating LCAT:', error);
      throw error;
    }
  }

  // Company Role Management
  static async getCompanyRoles(): Promise<CompanyRole[]> {
    try {
      const response = await fetch(`${this.baseUrl}/company-roles`);
      if (!response.ok) throw new Error('Failed to fetch company roles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching company roles:', error);
      // Fallback to mock data
      return [
        {
          id: '1',
          name: 'Senior Software Engineer',
          practiceArea: 'Engineering',
          description: 'Senior level software engineering role with 5+ years experience',
          rate: 120000, // $120,000
          rateIncrease: 0.03, // 3% annual increase
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
        {
          id: '2',
          name: 'Lead Product Manager',
          practiceArea: 'Product',
          description: 'Lead product management role with strategic responsibilities',
          rate: 110000, // $110,000
          rateIncrease: 0.025, // 2.5% annual increase
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
        {
          id: '3',
          name: 'Principal Data Scientist',
          practiceArea: 'Data Science',
          description: 'Principal level data science role with advanced analytics expertise',
          rate: 130000, // $130,000
          rateIncrease: 0.04, // 4% annual increase
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
        {
          id: '4',
          name: 'Senior UX Designer',
          practiceArea: 'Design',
          description: 'Senior user experience design role with leadership responsibilities',
          rate: 105000, // $105,000
          rateIncrease: 0.028, // 2.8% annual increase
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];
    }
  }

  static async createCompanyRole(role: Omit<CompanyRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyRole> {
    const newRole: CompanyRole = {
      ...role,
      id: `cr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In a real implementation, this would make an API call
    console.log('Creating company role:', newRole);
    return newRole;
  }

  static async updateCompanyRole(id: string, updates: Partial<CompanyRole>): Promise<CompanyRole> {
    const existingRole = await this.getCompanyRoles().then(roles => roles.find(r => r.id === id));
    if (!existingRole) {
      throw new Error('Company role not found');
    }

    const updatedRole: CompanyRole = {
      ...existingRole,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    // In a real implementation, this would make an API call
    console.log('Updating company role:', updatedRole);
    return updatedRole;
  }


  // Three-Way Mapping Management removed - simplified architecture

  // Rate Validation
  static async validateRate(
    companyRoleId: string,
    _contractVehicleId: string,
    _projectId: string,
    proposedRate: number
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const companyRoles = await this.getCompanyRoles();
    const companyRole = companyRoles.find(role => role.id === companyRoleId);
    
    if (!companyRole) {
      return { isValid: false, errors: ['Company Role not found'], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Note: Company roles don't have rate ranges - this would need to be implemented
    // based on the specific company's rate structure
    if (proposedRate < 50) {
      errors.push(`Rate $${proposedRate} is below minimum $50 for ${companyRole.name}`);
    }

    if (proposedRate > 500) {
      warnings.push(`Rate $${proposedRate} exceeds typical maximum $500 for ${companyRole.name}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Escalation Calculation
  static calculateEscalation(
    baseRate: number,
    escalationRate: number,
    startDate: string,
    endDate: string
  ): EscalationCalculation {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = end.getFullYear() - start.getFullYear();
    
    const calculatedRates = [];
    let currentRate = baseRate;
    
    for (let year = 0; year <= years; year++) {
      // yearDate removed - not used in simplified architecture
      const escalationAmount = year === 0 ? 0 : currentRate * escalationRate;
      currentRate = year === 0 ? baseRate : currentRate * (1 + escalationRate);
      
      calculatedRates.push({
        year: start.getFullYear() + year,
        rate: currentRate,
        escalationAmount,
      });
    }
    
    const totalEscalation = currentRate - baseRate;
    
    return {
      baseRate,
      escalationRate,
      startDate,
      endDate,
      calculatedRates,
      totalEscalation,
      finalRate: currentRate,
    };
  }

  // Enhanced Labor Category Processing
  static async processEnhancedLaborCategory(
    category: EnhancedLaborCategoryInput,
    projectStartDate: string,
    projectEndDate: string,
    overheadRate: number,
    gaRate: number,
    feeRate: number
  ): Promise<EnhancedLaborCategoryResult> {
    // Mapping data removed - simplified architecture

    // Calculate basic fields
    const effectiveHours = category.hours * category.capacity;
    const clearancePremium = this.getClearancePremium(category.clearanceLevel);
    const clearanceAdjustedRate = category.baseRate * (1 + clearancePremium);
    const overheadAmount = clearanceAdjustedRate * overheadRate;
    const gaAmount = (clearanceAdjustedRate + overheadAmount) * gaRate;
    const feeAmount = (clearanceAdjustedRate + overheadAmount + gaAmount) * feeRate;
    const burdenedRate = clearanceAdjustedRate + overheadAmount + gaAmount + feeAmount;
    const totalCost = burdenedRate * effectiveHours;

    // Rate analysis - simplified without mapping data
    // rateComparison is optional and will be undefined by default

    // Escalation calculation
    const escalationCalculation = this.calculateEscalation(
      category.baseRate,
      category.projectEscalationRate || 0.02,
      projectStartDate,
      projectEndDate
    );

    // Validation
    const validation = await this.validateRate(
      category.companyRoleId || '',
      category.contractVehicleId || '',
      category.projectId || '',
      category.baseRate
    );

    return {
      ...category,
      effectiveHours,
      clearancePremium,
      clearanceAdjustedRate,
      overheadAmount,
      overheadRate: overheadRate,
      gaAmount,
      gaRate: gaRate,
      feeAmount,
      feeRate: feeRate,
      burdenedRate,
      totalCost,
      escalationCalculation,
      validationWarnings: validation.warnings,
      validationErrors: validation.errors,
    };
  }

  private static getClearancePremium(clearanceLevel: string): number {
    switch (clearanceLevel) {
      case 'Top Secret': return 0.20;
      case 'Secret': return 0.10;
      case 'Public Trust': return 0.05;
      default: return 0;
    }
  }

  // Import/Export
  static generateImportTemplate(): ImportTemplate {
    return {
      contractVehicles: [],
      projectRoles: [],
      lcats: [],
      companyRoles: [],
      rateValidationRules: [],
    };
  }

  static async exportToExcel(template: ImportTemplate): Promise<Blob> {
    const { TemplateService } = await import('./template.service');
    const workbook = TemplateService.exportTemplate(template);
    
    // Convert workbook to blob
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  static async importFromExcel(file: File): Promise<ImportTemplate> {
    const { TemplateService } = await import('./template.service');
    return TemplateService.parseTemplate(file);
  }

  // Bulk import to database
  static async bulkImportToDatabase(template: ImportTemplate): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/bulk-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      if (!response.ok) throw new Error('Failed to import data to database');
      return await response.json();
    } catch (error) {
      console.error('Error importing data to database:', error);
      throw error;
    }
  }

  // Clear all data from database
  static async clearAllData(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/clear-all`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to clear all data from database');
      return await response.json();
    } catch (error) {
      console.error('Error clearing all data from database:', error);
      throw error;
    }
  }

  // Delete methods
  static async deleteContractVehicle(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/contract-vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete contract vehicle');
    } catch (error) {
      console.error('Error deleting contract vehicle:', error);
      throw error;
    }
  }

  static async deleteLCAT(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/lcats/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete LCAT');
    } catch (error) {
      console.error('Error deleting LCAT:', error);
      throw error;
    }
  }

  static async deleteProjectRole(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/project-roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete project role');
    } catch (error) {
      console.error('Error deleting project role:', error);
      throw error;
    }
  }

  static async deleteCompanyRole(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/company-roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete company role');
    } catch (error) {
      console.error('Error deleting company role:', error);
      throw error;
    }
  }

  // Audit Logging
  static async logAuditEvent(
    entityType: AuditLog['entityType'],
    entityId: string,
    action: AuditLog['action'],
    userId: string,
    userName: string,
    changes: AuditLog['changes']
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: Date.now().toString(),
      entityType,
      entityId,
      action,
      userId,
      userName,
      changes,
      timestamp: new Date().toISOString(),
    };
    
    // In a real implementation, this would save to the database
    console.log('Audit log:', auditLog);
  }
}