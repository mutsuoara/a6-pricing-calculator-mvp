/**
 * Simplified User model for initial database setup
 */

import { DataTypes, Model, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { DatabaseService } from '../config/database';
import { UserRole } from '@pricing-calculator/types';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: string;
  declare tenantId: string;
  declare googleId: string;
  declare email: string;
  declare name: string;
  declare role: UserRole;
  declare isActive: boolean;
  declare lastLoginAt?: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt?: Date;

  static initModel() {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        tenantId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        googleId: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM('User', 'BD', 'Finance', 'Contracts', 'Admin'),
          allowNull: false,
          defaultValue: 'User',
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        lastLoginAt: {
          type: DataTypes.DATE,
          allowNull: true,
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
        }
      },
      {
        sequelize: DatabaseService.getInstance().getSequelize(),
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
        timestamps: true
      }
    );
  }

  // Instance methods
  public isAdmin(): boolean {
    return this.role === 'Admin';
  }

  public canAccessFinance(): boolean {
    return ['Admin', 'Finance'].includes(this.role);
  }

  public canAccessContracts(): boolean {
    return ['Admin', 'Contracts'].includes(this.role);
  }

  public canAccessBD(): boolean {
    return ['Admin', 'BD'].includes(this.role);
  }

  public updateLastLogin(): void {
    this.lastLoginAt = new Date();
  }
}
