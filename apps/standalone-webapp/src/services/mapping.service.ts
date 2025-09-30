/**
 * Mapping Service
 * Handles three-way mapping operations and rate validation
 */

import * as XLSX from 'xlsx';
import {
  ContractVehicle,
  A6Level,
  ProjectRole,
  SPRUCELCAT,
  CompanyRole,
  ThreeWayMapping,
  RateValidationRule,
  AuditLog,
  ImportTemplate,
  EscalationCalculation,
  EnhancedLaborCategoryInput,
  EnhancedLaborCategoryResult,
} from '../types/mapping';

export class MappingService {
  private static baseUrl = '/api/mapping';

  // Contract Vehicle Management
  static async getContractVehicles(): Promise<ContractVehicle[]> {
    // Mock data for now - replace with actual API calls
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

  static async createContractVehicle(vehicle: Omit<ContractVehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractVehicle> {
    // Mock implementation
    const newVehicle: ContractVehicle = {
      ...vehicle,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newVehicle;
  }

  // A6 Level Management
  static async getA6Levels(): Promise<A6Level[]> {
    return [
      {
        id: '1',
        name: 'Engineering V',
        category: 'Engineering',
        level: 5,
        description: 'Senior Engineering Lead',
        rateRange: { min: 180, max: 250, typical: 200 },
        clearanceRequirements: ['Secret', 'Top Secret'],
        locationRequirements: ['On-site', 'Hybrid'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: '2',
        name: 'Engineering III',
        category: 'Engineering',
        level: 3,
        description: 'Mid-level Engineer',
        rateRange: { min: 120, max: 180, typical: 150 },
        clearanceRequirements: ['None', 'Public Trust', 'Secret'],
        locationRequirements: ['Remote', 'On-site', 'Hybrid'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: '3',
        name: 'Product III',
        category: 'Product',
        level: 3,
        description: 'Senior Product Manager',
        rateRange: { min: 140, max: 200, typical: 170 },
        clearanceRequirements: ['None', 'Public Trust', 'Secret'],
        locationRequirements: ['Remote', 'On-site', 'Hybrid'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
    ];
  }

  // Project Role Management
  static async getProjectRoles(): Promise<ProjectRole[]> {
    return [
      {
        id: '1',
        name: 'Engineering Lead (KP)',
        description: 'Key Personnel Engineering Lead',
        a6LevelId: '1',
        typicalClearance: 'Secret',
        typicalLocation: 'On-site',
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
        a6LevelId: '3',
        typicalClearance: 'Public Trust',
        typicalLocation: 'Hybrid',
        typicalHours: 2080,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
    ];
  }

  // SPRUCE LCAT Management
  static async getSPRUCELCATs(): Promise<SPRUCELCAT[]> {
    return [
      {
        id: '1',
        name: 'Software Engineer',
        code: 'SWE',
        description: 'Software Engineering position',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: '2',
        name: 'Product Manager',
        code: 'PM',
        description: 'Product Management position',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
    ];
  }

  // Company Role Management
  static async getCompanyRoles(): Promise<CompanyRole[]> {
    return [
      {
        id: '1',
        name: 'Senior Software Engineer',
        practiceArea: 'Engineering',
        description: 'Senior level software engineering role with 5+ years experience',
        payBand: 'Band 5',
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
        payBand: 'Senior Level',
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
        payBand: 'Principal Level',
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
        payBand: 'Band 4',
        rateIncrease: 0.028, // 2.8% annual increase
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
    ];
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

  static async deleteCompanyRole(id: string): Promise<void> {
    // In a real implementation, this would make an API call
    console.log('Deleting company role:', id);
  }

  // Three-Way Mapping Management
  static async getThreeWayMappings(projectId?: string): Promise<ThreeWayMapping[]> {
    return [
      {
        id: '1',
        contractVehicleId: '1', // VA SPRUCE
        projectId: 'cross-benefits',
        spruceLCATId: '1', // Software Engineer
        projectRoleId: '1', // Engineering Lead (KP)
        a6LevelId: '1', // Engineering V
        spruceRate: 256.31,
        a6MinimumRate: 201.63,
        maxSubcontractorRate: 149.26,
        allowRateOverride: true,
        requireApproval: false,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
    ];
  }

  // Rate Validation
  static async validateRate(
    a6LevelId: string,
    contractVehicleId: string,
    projectId: string,
    proposedRate: number
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const a6Levels = await this.getA6Levels();
    const a6Level = a6Levels.find(level => level.id === a6LevelId);
    
    if (!a6Level) {
      return { isValid: false, errors: ['A6 Level not found'], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    if (proposedRate < a6Level.rateRange.min) {
      errors.push(`Rate $${proposedRate} is below minimum $${a6Level.rateRange.min} for ${a6Level.name}`);
    }

    if (proposedRate > a6Level.rateRange.max) {
      warnings.push(`Rate $${proposedRate} exceeds typical maximum $${a6Level.rateRange.max} for ${a6Level.name}`);
    }

    if (proposedRate < a6Level.rateRange.typical * 0.9) {
      warnings.push(`Rate $${proposedRate} is significantly below typical rate $${a6Level.rateRange.typical}`);
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
      const yearDate = new Date(start.getFullYear() + year, start.getMonth(), start.getDate());
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
    // Get mapping data
    const mappings = await this.getThreeWayMappings(category.projectId);
    const mapping = mappings.find(m => 
      m.contractVehicleId === category.contractVehicleId &&
      m.projectRoleId === category.projectRoleId
    );

    // Calculate basic fields
    const effectiveHours = category.hours * category.capacity;
    const clearancePremium = this.getClearancePremium(category.clearanceLevel);
    const clearanceAdjustedRate = category.baseRate * (1 + clearancePremium);
    const overheadAmount = clearanceAdjustedRate * overheadRate;
    const gaAmount = (clearanceAdjustedRate + overheadAmount) * gaRate;
    const feeAmount = (clearanceAdjustedRate + overheadAmount + gaAmount) * feeRate;
    const burdenedRate = clearanceAdjustedRate + overheadAmount + gaAmount + feeAmount;
    const totalCost = burdenedRate * effectiveHours;

    // Rate analysis
    const rateComparison = mapping ? {
      spruceRate: mapping.spruceRate,
      a6MinimumRate: mapping.a6MinimumRate,
      proposalRate: category.baseRate,
      discountFromSpruce: mapping.spruceRate > 0 ? (mapping.spruceRate - category.baseRate) / mapping.spruceRate : 0,
      aboveA6Minimum: category.baseRate >= mapping.a6MinimumRate,
    } : undefined;

    // Escalation calculation
    const escalationCalculation = this.calculateEscalation(
      category.baseRate,
      category.projectEscalationRate || 0.02,
      projectStartDate,
      projectEndDate
    );

    // Validation
    const validation = await this.validateRate(
      category.a6LevelId || '',
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
      rateComparison,
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
      a6Levels: [],
      projectRoles: [],
      spruceLCATs: [],
      threeWayMappings: [],
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
