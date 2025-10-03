/**
 * PricingProject Model
 * Represents a pricing project with settings, labor categories, and other direct costs
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';
import { PricingSettings, ContractType } from '@pricing-calculator/types';
import { LaborCategory } from './LaborCategory';
import { OtherDirectCost } from './OtherDirectCost';

export interface PricingProjectAttributes {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  contractVehicle?: string;
  settings: PricingSettings;
  version: number;
  isTemplate: boolean;
  tags: string[];
  laborCategoriesData: any[]; // Store complex labor category data as JSON
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface PricingProjectCreationAttributes extends Optional<PricingProjectAttributes, 'id' | 'description' | 'version' | 'isTemplate' | 'tags' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class PricingProject extends Model<PricingProjectAttributes, PricingProjectCreationAttributes> implements PricingProjectAttributes {
  public id!: string;
  public tenantId!: string;
  public name!: string;
  public description?: string;
  public contractVehicle?: string;
  public settings!: PricingSettings;
  public version!: number;
  public isTemplate!: boolean;
  public tags!: string[];
  public laborCategoriesData!: any[]; // Store complex labor category data as JSON
  public createdBy!: string;
  public updatedBy!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

  // Associations
  // Note: Labor categories are stored as JSON data in laborCategoriesData field
  public otherDirectCosts?: OtherDirectCost[];

  /**
   * Get default pricing settings
   */
  public static getDefaultSettings(): PricingSettings {
    return {
      overheadRate: 0.30, // 30%
      gaRate: 0.15, // 15%
      feeRate: 0.10, // 10%
      contractType: 'FFP' as ContractType,
      periodOfPerformance: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      },
    };
  }

  /**
   * Validate pricing settings
   */
  public validateSettings(): string[] {
    const errors: string[] = [];

    if (this.settings.overheadRate < 0 || this.settings.overheadRate > 2) {
      errors.push('Overhead rate must be between 0% and 200%');
    }

    if (this.settings.gaRate < 0 || this.settings.gaRate > 2) {
      errors.push('G&A rate must be between 0% and 200%');
    }

    if (this.settings.feeRate < 0 || this.settings.feeRate > 1) {
      errors.push('Fee rate must be between 0% and 100%');
    }

    if (!this.settings.contractType || !['FFP', 'T&M', 'CPFF'].includes(this.settings.contractType)) {
      errors.push('Contract type must be FFP, T&M, or CPFF');
    }

    if (!this.settings.periodOfPerformance?.startDate || !this.settings.periodOfPerformance?.endDate) {
      errors.push('Period of performance dates are required');
    }

    if (this.settings.periodOfPerformance?.startDate && this.settings.periodOfPerformance?.endDate) {
      const startDate = new Date(this.settings.periodOfPerformance.startDate);
      const endDate = new Date(this.settings.periodOfPerformance.endDate);
      
      if (startDate >= endDate) {
        errors.push('Start date must be before end date');
      }
    }

    return errors;
  }

  /**
   * Validate the entire project
   */
  public validateBusinessRules(): string[] {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Project name is required');
    }

    if (!this.createdBy) {
      errors.push('Created by user ID is required');
    }

    if (!this.updatedBy) {
      errors.push('Updated by user ID is required');
    }

    // Validate settings
    errors.push(...this.validateSettings());

    return errors;
  }

  /**
   * Get all labor categories for this project
   */
  public async getLaborCategories(): Promise<LaborCategory[]> {
    const results = await LaborCategory.findAll({
      where: {
        projectId: this.id,
        tenantId: this.tenantId,
      },
    });
    return results as LaborCategory[];
  }

  /**
   * Get all other direct costs for this project
   */
  public async getOtherDirectCosts(): Promise<OtherDirectCost[]> {
    const results = await OtherDirectCost.findAll({
      where: {
        projectId: this.id,
        tenantId: this.tenantId,
      },
    });
    return results as OtherDirectCost[];
  }

  /**
   * Initialize the model
   */
  public static initModel(): void {
    PricingProject.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: () => uuidv4(),
          primaryKey: true,
        },
        tenantId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'tenantId',
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        contractVehicle: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        settings: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: PricingProject.getDefaultSettings(),
        },
        version: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        isTemplate: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'isTemplate',
        },
        tags: {
          type: DataTypes.ARRAY(DataTypes.TEXT),
          allowNull: false,
          defaultValue: [],
        },
        laborCategoriesData: {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: [],
        },
        createdBy: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'createdBy',
        },
        updatedBy: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'updatedBy',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'pricing_projects',
        timestamps: true,
        paranoid: true, // Enable soft deletes
        indexes: [
          {
            fields: ['tenantId'],
          },
          {
            fields: ['name'],
          },
          {
            fields: ['isTemplate'],
          },
          {
            fields: ['tenantId', 'isTemplate'],
          },
        ],
        hooks: {
          beforeSave: (project: PricingProject) => {
            // Validate before saving
            const errors = project.validateBusinessRules();
            if (errors.length > 0) {
              throw new Error(`Validation failed: ${errors.join(', ')}`);
            }
          },
        },
      }
    );
  }
}
