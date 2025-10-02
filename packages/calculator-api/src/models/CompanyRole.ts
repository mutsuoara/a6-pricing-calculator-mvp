import { Model, DataTypes, Sequelize } from 'sequelize';

export interface CompanyRoleAttributes {
  id: string;
  tenantId: string;
  name: string;
  practiceArea: string;
  description?: string;
  rate: number;
  rateIncrease: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CompanyRoleCreationAttributes extends Omit<CompanyRoleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class CompanyRole extends Model<CompanyRoleAttributes, CompanyRoleCreationAttributes> implements CompanyRoleAttributes {
  public id!: string;
  public tenantId!: string;
  public name!: string;
  public practiceArea!: string;
  public description?: string;
  public rate!: number;
  public rateIncrease!: number;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: string;

  public static associate(models: any): void {
    // Define associations here if needed
  }
}

export const initCompanyRole = (sequelize: Sequelize): typeof CompanyRole => {
  CompanyRole.init(
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
    },
    {
      sequelize,
      tableName: 'company_roles',
      timestamps: true,
      paranoid: false,
    }
  );

  return CompanyRole;
};
