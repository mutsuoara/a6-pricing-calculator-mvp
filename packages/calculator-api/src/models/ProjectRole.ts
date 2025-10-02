import { Model, DataTypes, Sequelize } from 'sequelize';

export interface ProjectRoleAttributes {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  typicalClearance: 'None' | 'Public Trust' | 'Secret' | 'Top Secret';
  typicalHours: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProjectRoleCreationAttributes extends Omit<ProjectRoleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class ProjectRole extends Model<ProjectRoleAttributes, ProjectRoleCreationAttributes> implements ProjectRoleAttributes {
  public id!: string;
  public tenantId!: string;
  public name!: string;
  public description?: string;
  public typicalClearance!: 'None' | 'Public Trust' | 'Secret' | 'Top Secret';
  public typicalHours!: number;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: string;

  public static associate(models: any): void {
    // Define associations here if needed
  }
}

export const initProjectRole = (sequelize: Sequelize): typeof ProjectRole => {
  ProjectRole.init(
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
    },
    {
      sequelize,
      tableName: 'project_roles',
      timestamps: true,
      paranoid: false,
    }
  );

  return ProjectRole;
};
