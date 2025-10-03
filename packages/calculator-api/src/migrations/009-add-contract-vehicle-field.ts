import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.addColumn('pricing_projects', 'contractVehicle', {
    type: DataTypes.STRING,
    allowNull: true,
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeColumn('pricing_projects', 'contractVehicle');
};
