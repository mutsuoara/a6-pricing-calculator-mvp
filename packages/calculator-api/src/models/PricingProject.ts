/**
 * PricingProject Model
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { DatabaseService } from '../config/database';

interface PricingProjectAttributes {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  settings: any; // JSONB field for pricing settings
  laborCategories: any; // JSONB field for labor categories
  otherDirectCosts: any; // JSONB field for other direct costs
  version: number;
  isTemplate: boolean;
  tags: string[];
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface PricingProjectCreationAttributes extends Optional<PricingProjectAttributes, 'id' | 'description' | 'version' | 'isTemplate' | 'tags' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class PricingProject extends Model<PricingProjectAttributes, PricingProjectCreationAttributes> implements PricingProjectAttributes {
  public id!: string;
  public tenantId!: string;
  public name!: string;
  public description?: string;
  public settings!: any;
  public laborCategories!: any;
  public otherDirectCosts!: any;
  public version!: number;
  public isTemplate!: boolean;
  public tags!: string[];
  public createdBy!: string;
  public updatedBy!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

  static initModel() {
    PricingProject.init(
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
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        settings: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        laborCategories: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: [],
        },
        otherDirectCosts: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: [],
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
        },
        tags: {
          type: DataTypes.ARRAY(DataTypes.TEXT),
          allowNull: false,
          defaultValue: [],
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
        sequelize: DatabaseService.getInstance().getSequelize(),
        tableName: 'pricing_projects',
        timestamps: true,
        paranoid: true,
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
        ],
      }
    );
  }
}
