/**
 * Migration: Add Missing Contract Vehicle Fields
 * Adds escalationRate, startDate, endDate, and createdBy fields to contract_vehicles table
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Add missing fields to contract_vehicles table (with existence checks)
  
  try {
    await queryInterface.addColumn('contract_vehicles', 'escalationRate', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.03, // 3% default escalation rate
      comment: 'Annual escalation rate as decimal (0.03 = 3%)',
    });
  } catch (error: any) {
    if (error.message && !error.message.includes('already exists')) {
      throw error;
    }
    console.log('Column escalationRate already exists, skipping');
  }

  try {
    await queryInterface.addColumn('contract_vehicles', 'startDate', {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Contract start date',
    });
  } catch (error: any) {
    if (error.message && !error.message.includes('already exists')) {
      throw error;
    }
    console.log('Column startDate already exists, skipping');
  }

  try {
    await queryInterface.addColumn('contract_vehicles', 'endDate', {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Contract end date',
    });
  } catch (error: any) {
    if (error.message && !error.message.includes('already exists')) {
      throw error;
    }
    console.log('Column endDate already exists, skipping');
  }

  try {
    await queryInterface.addColumn('contract_vehicles', 'createdBy', {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'system',
      comment: 'User who created this contract vehicle',
    });
  } catch (error: any) {
    if (error.message && !error.message.includes('already exists')) {
      throw error;
    }
    console.log('Column createdBy already exists, skipping');
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeColumn('contract_vehicles', 'createdBy');
  await queryInterface.removeColumn('contract_vehicles', 'endDate');
  await queryInterface.removeColumn('contract_vehicles', 'startDate');
  await queryInterface.removeColumn('contract_vehicles', 'escalationRate');
};