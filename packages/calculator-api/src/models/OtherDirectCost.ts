/**
 * OtherDirectCost Model
 * Represents other direct costs (ODC) within a pricing project
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';

export type ODCategory = 'Travel' | 'Equipment' | 'Software' | 'Other';

export interface OtherDirectCostAttributes {
  id: string;
  tenantId: string;
  projectId: string;
  description: string;
  amount: number;
  category: ODCategory;
  taxable: boolean;
  taxRate: number; // Default tax rate for taxable items
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface OtherDirectCostCreationAttributes extends Optional<OtherDirectCostAttributes, 'id' | 'createdAt' | 'updatedAt' | 'taxRate'> {}

export class OtherDirectCost extends Model<OtherDirectCostAttributes, OtherDirectCostCreationAttributes> implements OtherDirectCostAttributes {
  public id!: string;
  public tenantId!: string;
  public projectId!: string;
  public description!: string;
  public amount!: number;
  public category!: ODCategory;
  public taxable!: boolean;
  public taxRate!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

  /**
   * Calculate tax amount for this ODC item
   */
  public calculateTaxAmount(): number {
    if (!this.taxable) {
      return 0;
    }
    return this.amount * this.taxRate;
  }

  /**
   * Calculate total amount including tax
   */
  public calculateTotalAmount(): number {
    return this.amount + this.calculateTaxAmount();
  }

  /**
   * Validate business rules
   */
  public validateBusinessRules(): string[] {
    const errors: string[] = [];

    if (this.amount < 0) {
      errors.push('Amount must be non-negative');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (this.taxRate < 0 || this.taxRate > 1) {
      errors.push('Tax rate must be between 0 and 1 (0% to 100%)');
    }

    return errors;
  }

  /**
   * Initialize the model
   */
  public static initModel(): void {
    OtherDirectCost.init(
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
        description: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        amount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        category: {
          type: DataTypes.ENUM('Travel', 'Equipment', 'Software', 'Other'),
          allowNull: false,
          defaultValue: 'Other',
        },
        taxable: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        taxRate: {
          type: DataTypes.DECIMAL(5, 4),
          allowNull: false,
          defaultValue: 0.08, // Default 8% tax rate
          validate: {
            min: 0,
            max: 1,
          },
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
        tableName: 'other_direct_costs',
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
          {
            fields: ['category'],
          },
        ],
      }
    );
  }
}
