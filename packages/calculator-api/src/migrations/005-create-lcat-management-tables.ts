/**
 * Migration: Create LCAT Management Tables
 * Creates tables for the current LCAT management structure
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Create company_roles table
  await queryInterface.createTable('company_roles', {
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
    practiceArea: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Annual salary in dollars',
    },
    rateIncrease: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.03,
      comment: 'Annual rate increase as decimal (0.03 = 3%)',
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
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'system',
    },
  });

  // Create lcats table
  await queryInterface.createTable('lcats', {
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
    vehicle: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Contract vehicle (e.g., VA SPRUCE, GSA MAS, 8(a), SBIR)',
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
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Hourly rate in dollars',
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
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'system',
    },
  });

  // Create project_roles table
  await queryInterface.createTable('project_roles', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    typicalClearance: {
      type: DataTypes.ENUM('None', 'Public Trust', 'Secret', 'Top Secret'),
      allowNull: false,
      defaultValue: 'None',
    },
    typicalHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2080,
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
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'system',
    },
  });

  // Create rate_validation_rules table
  await queryInterface.createTable('rate_validation_rules', {
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
    companyRoleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'company_roles',
        key: 'id',
      },
    },
    contractVehicleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'contract_vehicles',
        key: 'id',
      },
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    minRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    maxRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    typicalRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    maxEscalationRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 10.0,
    },
    minEscalationRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
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
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'system',
    },
  });

  // Create indexes
  await queryInterface.addIndex('company_roles', ['tenantId']);
  await queryInterface.addIndex('company_roles', ['practiceArea']);
  await queryInterface.addIndex('company_roles', ['isActive']);

  await queryInterface.addIndex('lcats', ['tenantId']);
  await queryInterface.addIndex('lcats', ['vehicle']);
  await queryInterface.addIndex('lcats', ['code']);
  await queryInterface.addIndex('lcats', ['isActive']);

  await queryInterface.addIndex('project_roles', ['tenantId']);
  await queryInterface.addIndex('project_roles', ['isActive']);

  await queryInterface.addIndex('rate_validation_rules', ['tenantId']);
  await queryInterface.addIndex('rate_validation_rules', ['companyRoleId']);
  await queryInterface.addIndex('rate_validation_rules', ['contractVehicleId']);
  await queryInterface.addIndex('rate_validation_rules', ['isActive']);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('rate_validation_rules');
  await queryInterface.dropTable('project_roles');
  await queryInterface.dropTable('lcats');
  await queryInterface.dropTable('company_roles');
};
