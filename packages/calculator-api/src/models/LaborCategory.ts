/**
 * LaborCategory Model
 * Represents individual labor categories within a pricing project
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';
import { ClearanceLevel, LocationType } from '@pricing-calculator/types';

export interface LaborCategoryAttributes {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  baseRate: number; // $1-$1000
  hours: number; // 1-10000
  ftePercentage: number; // 0.01-100%
  clearanceLevel: ClearanceLevel;
  location: LocationType;
  effectiveHours: number; // calculated: hours * ftePercentage / 100
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface LaborCategoryCreationAttributes extends Optional<LaborCategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'effectiveHours'> {}

export class LaborCategory extends Model<LaborCategoryAttributes, LaborCategoryCreationAttributes> implements LaborCategoryAttributes {
  public id!: string;
  public tenantId!: string;
  public projectId!: string;
  public title!: string;
  public baseRate!: number;
  public hours!: number;
  public ftePercentage!: number;
  public clearanceLevel!: ClearanceLevel;
  public location!: LocationType;
  public effectiveHours!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

  /**
   * Calculate effective hours based on FTE percentage
   */
  public calculateEffectiveHours(): number {
    return (this.hours * this.ftePercentage) / 100;
  }

  /**
   * Calculate clearance premium based on clearance level
   */
  public getClearancePremium(): number {
    const premiums: Record<ClearanceLevel, number> = {
      'None': 0,
      'Public Trust': 0.05,
      'Secret': 0.10,
      'Top Secret': 0.20
    };
    return premiums[this.clearanceLevel];
  }

  /**
   * Calculate clearance-adjusted rate
   */
  public getClearanceAdjustedRate(): number {
    return this.baseRate * (1 + this.getClearancePremium());
  }

  /**
   * Calculate burdened rate with all overhead, G&A, and fee
   */
  public calculateBurdenedRate(overheadRate: number, gaRate: number, feeRate: number): number {
    const clearanceAdjustedRate = this.getClearanceAdjustedRate();
    return clearanceAdjustedRate * (1 + overheadRate) * (1 + gaRate) * (1 + feeRate);
  }

  /**
   * Calculate total cost for this labor category
   */
  public calculateTotalCost(overheadRate: number, gaRate: number, feeRate: number): number {
    const burdenedRate = this.calculateBurdenedRate(overheadRate, gaRate, feeRate);
    return burdenedRate * this.effectiveHours;
  }

  /**
   * Validate business rules
   */
  public validateBusinessRules(): string[] {
    const errors: string[] = [];

    if (this.baseRate < 1 || this.baseRate > 1000) {
      errors.push('Base rate must be between $1 and $1000');
    }

    if (this.hours < 1 || this.hours > 10000) {
      errors.push('Hours must be between 1 and 10000');
    }

    if (this.ftePercentage < 0.01 || this.ftePercentage > 100) {
      errors.push('FTE percentage must be between 0.01% and 100%');
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    return errors;
  }

  /**
   * Initialize the model
   */
  public static initModel(): void {
    LaborCategory.init(
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
        projectId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'projectId',
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        baseRate: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            min: 1,
            max: 1000,
          },
        },
        hours: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 10000,
          },
        },
        ftePercentage: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          validate: {
            min: 0.01,
            max: 100,
          },
        },
        clearanceLevel: {
          type: DataTypes.ENUM('None', 'Public Trust', 'Secret', 'Top Secret'),
          allowNull: false,
          defaultValue: 'None',
        },
        location: {
          type: DataTypes.ENUM('Remote', 'On-site', 'Hybrid'),
          allowNull: false,
          defaultValue: 'On-site',
        },
        effectiveHours: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
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
        tableName: 'labor_categories',
        timestamps: true,
        paranoid: true, // Enable soft deletes
        indexes: [
          {
            fields: ['tenantId'],
          },
          {
            fields: ['projectId'],
          },
          {
            fields: ['tenantId', 'projectId'],
          },
        ],
        hooks: {
          beforeSave: (laborCategory: LaborCategory) => {
            // Calculate effective hours before saving
            const hours = Number(laborCategory.hours);
            const ftePercentage = Number(laborCategory.ftePercentage);
            laborCategory.effectiveHours = (hours * ftePercentage) / 100;
          },
        },
      }
    );
  }
}
