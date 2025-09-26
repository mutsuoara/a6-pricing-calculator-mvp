/**
 * LCAT Template Service
 * Handles business logic for labor category templates with vehicle-specific rates and A6 role mappings
 */

import { LaborCategoryTemplate, ContractVehicle, A6Role } from '../models';
import { LaborCategoryInput } from '../types/labor-category';

export interface LCATSearchFilters {
  searchTerm?: string;
  vehicleCode?: string;
  category?: string;
  experienceLevel?: string;
  clearanceLevel?: string;
  location?: string;
  a6RoleId?: string;
  isActive?: boolean;
}

export interface LCATSelectionResult {
  template: LaborCategoryTemplate;
  vehicleRate?: {
    baseRateMin: number;
    baseRateMax: number;
    typicalRate: number;
    notes?: string;
  };
  a6Roles: A6Role[];
  contractVehicle?: ContractVehicle;
}

export class LCATTemplateService {
  /**
   * Search LCAT templates with filters
   */
  public static async searchTemplates(
    tenantId: string,
    filters: LCATSearchFilters = {}
  ): Promise<LCATSelectionResult[]> {
    const { LaborCategoryTemplate, ContractVehicle, A6Role } = await import('../models');
    
    // Build where clause
    const whereClause: any = {
      tenantId,
      isActive: filters.isActive !== false, // Default to true if not specified
    };

    if (filters.category) {
      whereClause.category = filters.category;
    }

    if (filters.experienceLevel) {
      whereClause.experienceLevel = filters.experienceLevel;
    }

    if (filters.clearanceLevel) {
      whereClause.typicalClearanceLevel = filters.clearanceLevel;
    }

    if (filters.location) {
      whereClause.typicalLocation = filters.location;
    }

    // Get templates
    const templates = await LaborCategoryTemplate.findAll({
      where: whereClause,
    });

    // Filter by search term if provided
    let filteredTemplates = templates;
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredTemplates = templates.filter(template => 
        template.matchesSearchTerm(searchTerm)
      );
    }

    // Filter by A6 role if provided
    if (filters.a6RoleId) {
      filteredTemplates = filteredTemplates.filter(template =>
        template.a6RoleMappings.includes(filters.a6RoleId!)
      );
    }

    // Build results with vehicle rates and A6 roles
    const results: LCATSelectionResult[] = [];
    
    for (const template of filteredTemplates) {
      // Get A6 roles for this template
      const a6Roles = await A6Role.findAll({
        where: {
          id: template.a6RoleMappings,
          isActive: true,
        },
      });

      // Get vehicle rate if vehicle filter is applied
      let vehicleRate;
      let contractVehicle;
      
      if (filters.vehicleCode) {
        vehicleRate = template.getRateForVehicle(filters.vehicleCode);
        contractVehicle = await ContractVehicle.findOne({
          where: { code: filters.vehicleCode, isActive: true },
        });
      }

      results.push({
        template,
        vehicleRate,
        a6Roles,
        contractVehicle,
      });
    }

    return results;
  }

  /**
   * Get LCAT template by ID with vehicle and A6 role details
   */
  public static async getTemplateById(
    tenantId: string,
    templateId: string,
    vehicleCode?: string
  ): Promise<LCATSelectionResult | null> {
    const { LaborCategoryTemplate, ContractVehicle, A6Role } = await import('../models');
    
    const template = await LaborCategoryTemplate.findOne({
      where: { id: templateId, tenantId, isActive: true },
    });

    if (!template) {
      return null;
    }

    // Get A6 roles
    const a6Roles = await A6Role.findAll({
      where: {
        id: template.a6RoleMappings,
        isActive: true,
      },
    });

    // Get vehicle rate if specified
    let vehicleRate;
    let contractVehicle;
    
    if (vehicleCode) {
      vehicleRate = template.getRateForVehicle(vehicleCode);
      contractVehicle = await ContractVehicle.findOne({
        where: { code: vehicleCode, isActive: true },
      });
    }

    return {
      template,
      vehicleRate,
      a6Roles,
      contractVehicle,
    };
  }

  /**
   * Convert LCAT template to LaborCategoryInput
   */
  public static convertTemplateToLaborCategory(
    template: LaborCategoryTemplate,
    vehicleCode?: string,
    customOverrides?: Partial<LaborCategoryInput>
  ): LaborCategoryInput {
    // Get typical rate for vehicle or fallback to average
    const baseRate = vehicleCode 
      ? template.getTypicalRateForVehicle(vehicleCode)
      : template.getTypicalRateForVehicle(template.getAvailableVehicles()[0] || '');

    return {
      id: Date.now().toString(), // Generate temporary ID
      title: template.title,
      baseRate: customOverrides?.baseRate || baseRate,
      hours: customOverrides?.hours || template.typicalHours,
      ftePercentage: customOverrides?.ftePercentage || 100,
      clearanceLevel: customOverrides?.clearanceLevel || template.typicalClearanceLevel,
      location: customOverrides?.location || template.typicalLocation,
    };
  }

  /**
   * Get available contract vehicles
   */
  public static async getContractVehicles(tenantId: string): Promise<ContractVehicle[]> {
    const { ContractVehicle } = await import('../models');
    
    return await ContractVehicle.findAll({
      where: { tenantId, isActive: true },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Get available A6 roles
   */
  public static async getA6Roles(tenantId: string): Promise<A6Role[]> {
    const { A6Role } = await import('../models');
    
    return await A6Role.findAll({
      where: { tenantId, isActive: true },
      order: [['department', 'ASC'], ['level', 'ASC'], ['name', 'ASC']],
    });
  }

  /**
   * Validate LCAT template data
   */
  public static validateTemplateData(data: any): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.category || !['Technical', 'Management', 'Administrative', 'Support', 'Other'].includes(data.category)) {
      errors.push('Valid category is required');
    }

    if (!data.experienceLevel || !['junior', 'mid', 'senior', 'lead', 'principal'].includes(data.experienceLevel)) {
      errors.push('Valid experience level is required');
    }

    if (!data.vehicleRates || typeof data.vehicleRates !== 'object') {
      errors.push('Vehicle rates are required');
    }

    if (!data.a6RoleMappings || !Array.isArray(data.a6RoleMappings)) {
      errors.push('A6 role mappings are required');
    }

    if (data.typicalHours && (data.typicalHours < 1 || data.typicalHours > 10000)) {
      errors.push('Typical hours must be between 1 and 10000');
    }

    return errors;
  }

  /**
   * Create new LCAT template
   */
  public static async createTemplate(
    tenantId: string,
    data: any
  ): Promise<LaborCategoryTemplate> {
    const { LaborCategoryTemplate } = await import('../models');
    
    const errors = this.validateTemplateData(data);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    return await LaborCategoryTemplate.create({
      tenantId,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      category: data.category,
      experienceLevel: data.experienceLevel,
      vehicleRates: data.vehicleRates,
      a6RoleMappings: data.a6RoleMappings,
      typicalClearanceLevel: data.typicalClearanceLevel || 'None',
      typicalLocation: data.typicalLocation || 'On-site',
      typicalHours: data.typicalHours || 2080,
      tags: data.tags || [],
      complianceRequirements: data.complianceRequirements || [],
      isActive: data.isActive !== false,
    });
  }

  /**
   * Update LCAT template
   */
  public static async updateTemplate(
    tenantId: string,
    templateId: string,
    data: any
  ): Promise<LaborCategoryTemplate> {
    const { LaborCategoryTemplate } = await import('../models');
    
    const template = await LaborCategoryTemplate.findOne({
      where: { id: templateId, tenantId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const errors = this.validateTemplateData(data);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    await template.update({
      title: data.title?.trim() || template.title,
      description: data.description?.trim() || template.description,
      category: data.category || template.category,
      experienceLevel: data.experienceLevel || template.experienceLevel,
      vehicleRates: data.vehicleRates || template.vehicleRates,
      a6RoleMappings: data.a6RoleMappings || template.a6RoleMappings,
      typicalClearanceLevel: data.typicalClearanceLevel || template.typicalClearanceLevel,
      typicalLocation: data.typicalLocation || template.typicalLocation,
      typicalHours: data.typicalHours || template.typicalHours,
      tags: data.tags || template.tags,
      complianceRequirements: data.complianceRequirements || template.complianceRequirements,
      isActive: data.isActive !== undefined ? data.isActive : template.isActive,
    });

    return template;
  }

  /**
   * Delete LCAT template (soft delete)
   */
  public static async deleteTemplate(
    tenantId: string,
    templateId: string
  ): Promise<boolean> {
    const { LaborCategoryTemplate } = await import('../models');
    
    const template = await LaborCategoryTemplate.findOne({
      where: { id: templateId, tenantId },
    });

    if (!template) {
      return false;
    }

    await template.destroy();
    return true;
  }
}
