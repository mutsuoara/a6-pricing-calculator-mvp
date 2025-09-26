/**
 * A6Role Model
 * Represents Agile6 internal roles for mapping to LCATs
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';

export interface A6RoleAttributes {
  id: string;
  tenantId: string;
  name: string; // e.g., "Senior Software Engineer", "Project Manager"
  code: string; // e.g., "SSE", "PM"
  description: string;
  department: string; // e.g., "Engineering", "Management", "Operations"
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'director';
  careerPath: string[]; // Array of possible career progression paths
  requiredSkills: string[]; // Array of required skills/competencies
  typicalClearanceLevel: 'None' | 'Public Trust' | 'Secret' | 'Top Secret';
  typicalLocation: 'Remote' | 'On-site' | 'Hybrid';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface A6RoleCreationAttributes extends Optional<A6RoleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class A6Role extends Model<A6RoleAttributes, A6RoleCreationAttributes> implements A6RoleAttributes {
  public id!: string;
  public tenantId!: string;
  public name!: string;
  public code!: string;
  public description!: string;
  public department!: string;
  public level!: 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'director';
  public careerPath!: string[];
  public requiredSkills!: string[];
  public typicalClearanceLevel!: 'None' | 'Public Trust' | 'Secret' | 'Top Secret';
  public typicalLocation!: 'Remote' | 'On-site' | 'Hybrid';
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

  /**
   * Get career progression options
   */
  public getCareerProgression(): string[] {
    return this.careerPath;
  }

  /**
   * Check if role requires specific clearance level
   */
  public requiresClearanceLevel(requiredLevel: string): boolean {
    const clearanceLevels = ['None', 'Public Trust', 'Secret', 'Top Secret'];
    const requiredIndex = clearanceLevels.indexOf(requiredLevel);
    const typicalIndex = clearanceLevels.indexOf(this.typicalClearanceLevel);
    
    return typicalIndex >= requiredIndex;
  }

  /**
   * Initialize the model
   */
  public static initModel(): void {
    A6Role.init(
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
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        department: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        level: {
          type: DataTypes.ENUM('junior', 'mid', 'senior', 'lead', 'principal', 'director'),
          allowNull: false,
        },
        careerPath: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
        requiredSkills: {
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
        tableName: 'a6_roles',
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
            fields: ['department'],
          },
          {
            fields: ['level'],
          },
          {
            fields: ['isActive'],
          },
        ],
      }
    );
  }
}
