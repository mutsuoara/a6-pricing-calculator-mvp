import { Model, DataTypes, Sequelize } from 'sequelize';

export interface RateValidationRuleAttributes {
  id: string;
  tenantId: string;
  companyRoleId?: string;
  contractVehicleId?: string;
  projectId?: string;
  minRate: number;
  maxRate: number;
  typicalRate: number;
  maxEscalationRate: number;
  minEscalationRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface RateValidationRuleCreationAttributes extends Omit<RateValidationRuleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class RateValidationRule extends Model<RateValidationRuleAttributes, RateValidationRuleCreationAttributes> implements RateValidationRuleAttributes {
  public id!: string;
  public tenantId!: string;
  public companyRoleId?: string;
  public contractVehicleId?: string;
  public projectId?: string;
  public minRate!: number;
  public maxRate!: number;
  public typicalRate!: number;
  public maxEscalationRate!: number;
  public minEscalationRate!: number;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: string;

  public static associate(models: any): void {
    // Define associations here if needed
  }
}

export const initRateValidationRule = (sequelize: Sequelize): typeof RateValidationRule => {
  RateValidationRule.init(
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
    },
    {
      sequelize,
      tableName: 'rate_validation_rules',
      timestamps: true,
      paranoid: false,
    }
  );

  return RateValidationRule;
};
