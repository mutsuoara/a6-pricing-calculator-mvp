/**
 * Migration: Create LCAT Template Tables
 * Creates tables for contract vehicles, A6 roles, and labor category templates
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Create contract_vehicles table
  await queryInterface.createTable('contract_vehicles', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
  });

  // Create indexes for contract_vehicles
  await queryInterface.addIndex('contract_vehicles', ['tenantId']);
  await queryInterface.addIndex('contract_vehicles', ['code'], { unique: true });
  await queryInterface.addIndex('contract_vehicles', ['isActive']);

  // Create a6_roles table
  await queryInterface.createTable('a6_roles', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
  });

  // Create indexes for a6_roles
  await queryInterface.addIndex('a6_roles', ['tenantId']);
  await queryInterface.addIndex('a6_roles', ['code'], { unique: true });
  await queryInterface.addIndex('a6_roles', ['department']);
  await queryInterface.addIndex('a6_roles', ['level']);
  await queryInterface.addIndex('a6_roles', ['isActive']);

  // Create labor_category_templates table
  await queryInterface.createTable('labor_category_templates', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
  });

  // Create indexes for labor_category_templates
  await queryInterface.addIndex('labor_category_templates', ['tenantId']);
  await queryInterface.addIndex('labor_category_templates', ['title']);
  await queryInterface.addIndex('labor_category_templates', ['category']);
  await queryInterface.addIndex('labor_category_templates', ['experienceLevel']);
  await queryInterface.addIndex('labor_category_templates', ['isActive']);
  await queryInterface.addIndex('labor_category_templates', ['typicalClearanceLevel']);
  await queryInterface.addIndex('labor_category_templates', ['typicalLocation']);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('labor_category_templates');
  await queryInterface.dropTable('a6_roles');
  await queryInterface.dropTable('contract_vehicles');
};
