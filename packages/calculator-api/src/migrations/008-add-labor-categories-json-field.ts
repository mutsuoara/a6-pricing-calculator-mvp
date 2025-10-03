/**
 * Migration 007: Add labor categories JSON field to pricing projects
 * This allows storing complex labor category data from the frontend as JSON
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.addColumn('pricing_projects', 'laborCategoriesData', {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeColumn('pricing_projects', 'laborCategoriesData');
};
