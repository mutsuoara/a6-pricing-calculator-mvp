/**
 * ContractVehicle Model
 * Represents different contract vehicles (GSA MAS, 8(a), SBIR, etc.) with their specific rate structures
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';

export interface ContractVehicleAttributes {
  id: string;
  tenantId: string;
  name: string; // e.g., "GSA MAS", "8(a)", "SBIR"
  code: string; // e.g., "GSA_MAS", "8A", "SBIR"
  description: string;
  rateStructure: 'fixed' | 'burdened' | 'custom'; // How rates are structured
  maxOverheadRate: number; // Maximum allowed overhead rate for this vehicle
  maxGaRate: number; // Maximum allowed G&A rate for this vehicle
  maxFeeRate: number; // Maximum allowed fee rate for this vehicle
  complianceRequirements: string[]; // Array of compliance requirements
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ContractVehicleCreationAttributes extends Optional<ContractVehicleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class ContractVehicle extends Model<ContractVehicleAttributes, ContractVehicleCreationAttributes> implements ContractVehicleAttributes {
  public id!: string;
  public tenantId!: string;
  public name!: string;
  public code!: string;
  public description!: string;
  public rateStructure!: 'fixed' | 'burdened' | 'custom';
  public maxOverheadRate!: number;
  public maxGaRate!: number;
  public maxFeeRate!: number;
  public complianceRequirements!: string[];
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

  /**
   * Validate rate against vehicle limits
   */
  public validateRate(overheadRate: number, gaRate: number, feeRate: number): string[] {
    const errors: string[] = [];
    
    if (overheadRate > this.maxOverheadRate) {
      errors.push(`Overhead rate ${overheadRate}% exceeds vehicle limit of ${this.maxOverheadRate}%`);
    }
    
    if (gaRate > this.maxGaRate) {
      errors.push(`G&A rate ${gaRate}% exceeds vehicle limit of ${this.maxGaRate}%`);
    }
    
    if (feeRate > this.maxFeeRate) {
      errors.push(`Fee rate ${feeRate}% exceeds vehicle limit of ${this.maxFeeRate}%`);
    }
    
    return errors;
  }

  /**
   * Initialize the model
   */
  public static initModel(): void {
    ContractVehicle.init(
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
        code: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        rateStructure: {
          type: DataTypes.ENUM('fixed', 'burdened', 'custom'),
          allowNull: false,
          defaultValue: 'burdened',
        },
        maxOverheadRate: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 100,
        },
        maxGaRate: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 100,
        },
        maxFeeRate: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 100,
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
        tableName: 'contract_vehicles',
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            fields: ['tenantId'],
          },
          {
            fields: ['code'],
            unique: true,
          },
          {
            fields: ['isActive'],
          },
        ],
      }
    );
  }
}
