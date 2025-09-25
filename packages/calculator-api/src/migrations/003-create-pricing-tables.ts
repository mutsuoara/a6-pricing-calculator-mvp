/**
 * Create pricing calculation tables
 * Creates labor_categories and other_direct_costs tables
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('🔄 Creating pricing calculation tables...');

  // Create labor_categories table
  await queryInterface.createTable('labor_categories', {
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
      field: 'baseRate',
    },
    hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ftePercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'ftePercentage',
    },
    clearanceLevel: {
      type: DataTypes.ENUM('None', 'Public Trust', 'Secret', 'Top Secret'),
      allowNull: false,
      defaultValue: 'None',
      field: 'clearanceLevel',
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
      field: 'effectiveHours',
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

  // Create other_direct_costs table
  await queryInterface.createTable('other_direct_costs', {
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
      defaultValue: 0.08,
      field: 'taxRate',
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

  // Add indexes for performance
  await queryInterface.addIndex('labor_categories', ['tenantId']);
  await queryInterface.addIndex('labor_categories', ['projectId']);
  await queryInterface.addIndex('labor_categories', ['tenantId', 'projectId']);

  await queryInterface.addIndex('other_direct_costs', ['tenantId']);
  await queryInterface.addIndex('other_direct_costs', ['projectId']);
  await queryInterface.addIndex('other_direct_costs', ['tenantId', 'projectId']);
  await queryInterface.addIndex('other_direct_costs', ['category']);

  // Add foreign key constraints
  await queryInterface.addConstraint('labor_categories', {
    fields: ['projectId'],
    type: 'foreign key',
    name: 'fk_labor_categories_project',
    references: {
      table: 'pricing_projects',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('other_direct_costs', {
    fields: ['projectId'],
    type: 'foreign key',
    name: 'fk_other_direct_costs_project',
    references: {
      table: 'pricing_projects',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  console.log('✅ Pricing calculation tables created successfully');
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('⏪ Dropping pricing calculation tables...');

  // Drop foreign key constraints first
  await queryInterface.removeConstraint('labor_categories', 'fk_labor_categories_project');
  await queryInterface.removeConstraint('other_direct_costs', 'fk_other_direct_costs_project');

  // Drop tables
  await queryInterface.dropTable('labor_categories');
  await queryInterface.dropTable('other_direct_costs');

  console.log('✅ Pricing calculation tables dropped successfully');
};
