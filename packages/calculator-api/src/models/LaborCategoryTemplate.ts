/**
 * LaborCategoryTemplate Model
 * Represents pre-populated labor category templates with vehicle-specific rates and A6 role mappings
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';
import { ClearanceLevel, LocationType } from '@pricing-calculator/types';

export interface LaborCategoryTemplateAttributes {
  id: string;
  tenantId: string;
  title: string; // e.g., "Senior Software Engineer"
  description: string;
  category: 'Technical' | 'Management' | 'Administrative' | 'Support' | 'Other';
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  
  // Vehicle-specific rate data
  vehicleRates: Record<string, {
    baseRateMin: number;
    baseRateMax: number;
    typicalRate: number;
    notes?: string;
  }>;
  
  // A6 role mappings
  a6RoleMappings: string[]; // Array of A6Role IDs
  
  // Typical defaults
  typicalClearanceLevel: ClearanceLevel;
  typicalLocation: LocationType;
  typicalHours: number; // Typical hours per year (e.g., 2080)
  
  // Metadata
  tags: string[]; // Searchable tags
  complianceRequirements: string[]; // Vehicle-specific compliance requirements
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface LaborCategoryTemplateCreationAttributes extends Optional<LaborCategoryTemplateAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class LaborCategoryTemplate extends Model<LaborCategoryTemplateAttributes, LaborCategoryTemplateCreationAttributes> implements LaborCategoryTemplateAttributes {
  public id!: string;
  public tenantId!: string;
  public title!: string;
  public description!: string;
  public category!: 'Technical' | 'Management' | 'Administrative' | 'Support' | 'Other';
  public experienceLevel!: 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  public vehicleRates!: Record<string, {
    baseRateMin: number;
    baseRateMax: number;
    typicalRate: number;
    notes?: string;
  }>;
  public a6RoleMappings!: string[];
  public typicalClearanceLevel!: ClearanceLevel;
  public typicalLocation!: LocationType;
  public typicalHours!: number;
  public tags!: string[];
  public complianceRequirements!: string[];
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

  /**
   * Get rate for specific vehicle
   */
  public getRateForVehicle(vehicleCode: string): { baseRateMin: number; baseRateMax: number; typicalRate: number; notes?: string } | null {
    return this.vehicleRates[vehicleCode] || null;
  }

  /**
   * Get all available vehicles for this LCAT
   */
  public getAvailableVehicles(): string[] {
    return Object.keys(this.vehicleRates);
  }

  /**
   * Check if LCAT is available for specific vehicle
   */
  public isAvailableForVehicle(vehicleCode: string): boolean {
    return vehicleCode in this.vehicleRates;
  }

  /**
   * Get typical rate for vehicle (falls back to average if not specified)
   */
  public getTypicalRateForVehicle(vehicleCode: string): number {
    const vehicleRate = this.getRateForVehicle(vehicleCode);
    if (vehicleRate) {
      return vehicleRate.typicalRate;
    }
    
    // Fallback to average of all available rates
    const rates = Object.values(this.vehicleRates);
    if (rates.length === 0) return 0;
    
    const totalTypical = rates.reduce((sum, rate) => sum + rate.typicalRate, 0);
    return totalTypical / rates.length;
  }

  /**
   * Search tags for matching terms
   */
  public matchesSearchTerm(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return (
      this.title.toLowerCase().includes(term) ||
      this.description.toLowerCase().includes(term) ||
      this.tags.some(tag => tag.toLowerCase().includes(term)) ||
      this.category.toLowerCase().includes(term) ||
      this.experienceLevel.toLowerCase().includes(term)
    );
  }

  /**
   * Initialize the model
   */
  public static initModel(): void {
    LaborCategoryTemplate.init(
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
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        category: {
          type: DataTypes.ENUM('Technical', 'Management', 'Administrative', 'Support', 'Other'),
          allowNull: false,
        },
        experienceLevel: {
          type: DataTypes.ENUM('junior', 'mid', 'senior', 'lead', 'principal'),
          allowNull: false,
        },
        vehicleRates: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: {},
        },
        a6RoleMappings: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
        typicalClearanceLevel: {
          type: DataTypes.ENUM('None', 'Public Trust', 'Secret', 'Top Secret'),
          allowNull: false,
          defaultValue: 'None',
        },
        typicalLocation: {
          type: DataTypes.ENUM('Remote', 'On-site', 'Hybrid'),
          allowNull: false,
          defaultValue: 'On-site',
        },
        typicalHours: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 2080,
        },
        tags: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
        complianceRequirements: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
        tableName: 'labor_category_templates',
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            fields: ['tenantId'],
          },
          {
            fields: ['title'],
          },
          {
            fields: ['category'],
          },
          {
            fields: ['experienceLevel'],
          },
          {
            fields: ['isActive'],
          },
          {
            fields: ['typicalClearanceLevel'],
          },
          {
            fields: ['typicalLocation'],
          },
        ],
      }
    );
  }
}
