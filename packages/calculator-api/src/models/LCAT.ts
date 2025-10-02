import { Model, DataTypes, Sequelize } from 'sequelize';

export interface LCATAttributes {
  id: string;
  tenantId: string;
  vehicle: string;
  name: string;
  code: string;
  description?: string;
  rate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface LCATCreationAttributes extends Omit<LCATAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class LCAT extends Model<LCATAttributes, LCATCreationAttributes> implements LCATAttributes {
  public id!: string;
  public tenantId!: string;
  public vehicle!: string;
  public name!: string;
  public code!: string;
  public description?: string;
  public rate!: number;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: string;

  public static associate(models: any): void {
    // Define associations here if needed
  }
}

export const initLCAT = (sequelize: Sequelize): typeof LCAT => {
  LCAT.init(
    {
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
    },
    {
      sequelize,
      tableName: 'lcats',
      timestamps: true,
      paranoid: false,
    }
  );

  return LCAT;
};
