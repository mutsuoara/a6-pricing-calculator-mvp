/**
 * SystemSettings Model
 * Represents global system-wide settings for the pricing calculator
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';

export interface SystemSettingsAttributes {
  id: string;
  tenantId: string;
  wrapRate: number;
  minimumProfitRate: number;
  version: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface SystemSettingsCreationAttributes extends Optional<SystemSettingsAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class SystemSettings extends Model<SystemSettingsAttributes, SystemSettingsCreationAttributes> implements SystemSettingsAttributes {
  public id!: string;
  public tenantId!: string;
  public wrapRate!: number;
  public minimumProfitRate!: number;
  public version!: number;
  public createdBy!: string;
  public updatedBy!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

  /**
   * Get default system settings
   */
  public static getDefaultSettings(): Partial<SystemSettingsAttributes> {
    return {
      wrapRate: 87.5,
      minimumProfitRate: 7.53,
      version: 1,
    };
  }

  /**
   * Calculate wrap amount for a given annual salary
   */
  public calculateWrapAmount(annualSalary: number): number {
    const annualSalaryNum = typeof annualSalary === 'string' ? parseFloat(annualSalary) : annualSalary;
    const result = Math.round((this.wrapRate * annualSalaryNum / 100) * 100) / 100;
    return result;
  }

  /**
   * Calculate minimum profit amount for given annual salary and wrap amount
   */
  public calculateMinimumProfitAmount(annualSalary: number, wrapAmount: number): number {
    const annualSalaryNum = typeof annualSalary === 'string' ? parseFloat(annualSalary) : annualSalary;
    const wrapAmountNum = typeof wrapAmount === 'string' ? parseFloat(wrapAmount) : wrapAmount;
    
    const totalCost = annualSalaryNum + wrapAmountNum;
    const result = Math.round((this.minimumProfitRate * totalCost / 100) * 100) / 100;
    
    return result;
  }

  /**
   * Validate business rules
   */
  public validateBusinessRules(): string[] {
    const errors: string[] = [];

    if (this.wrapRate < 0 || this.wrapRate > 1000) {
      errors.push('Wrap rate must be between 0 and 1000');
    }

    if (this.minimumProfitRate < 0 || this.minimumProfitRate > 100) {
      errors.push('Minimum profit rate must be between 0 and 100');
    }

    return errors;
  }

  /**
   * Initialize the model
   */
  public static initModel(): void {
    SystemSettings.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        tenantId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        wrapRate: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 87.5,
          validate: {
            min: 0,
            max: 1000,
          },
        },
        minimumProfitRate: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 7.53,
          validate: {
            min: 0,
            max: 100,
          },
        },
        version: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        createdBy: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        updatedBy: {
          type: DataTypes.UUID,
          allowNull: false,
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
        tableName: 'system_settings',
        timestamps: true,
        paranoid: true, // Enable soft deletes
        indexes: [
          {
            fields: ['tenantId'],
            unique: true, // One settings record per tenant
          },
        ],
        hooks: {
          beforeSave: (settings: SystemSettings) => {
            // Validate before saving
            const errors = settings.validateBusinessRules();
            if (errors.length > 0) {
              throw new Error(`Validation failed: ${errors.join(', ')}`);
            }
          },
        },
      }
    );
  }
}
