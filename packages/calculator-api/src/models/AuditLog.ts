/**
 * AuditLog Model
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../config/database';
import { AuditAction } from '@pricing-calculator/types';

interface AuditLogAttributes {
  id: string;
  tenantId: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details: any; // JSONB for additional details
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'resourceId' | 'details' | 'success' | 'errorMessage' | 'createdAt' | 'updatedAt'> {}

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: string;
  public tenantId!: string;
  public userId!: string;
  public action!: AuditAction;
  public resourceType!: string;
  public resourceId?: string;
  public details!: any;
  public ipAddress!: string;
  public userAgent!: string;
  public success!: boolean;
  public errorMessage?: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  static initModel() {
    AuditLog.init(
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
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        action: {
          type: DataTypes.ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CALCULATE', 'EXPORT'),
          allowNull: false,
        },
        resourceType: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        resourceId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        details: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        ipAddress: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        userAgent: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        success: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        errorMessage: {
          type: DataTypes.TEXT,
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
      },
      {
        sequelize: DatabaseService.getInstance().getSequelize(),
        tableName: 'audit_logs',
        timestamps: true,
        paranoid: false, // Audit logs should not be soft-deleted
        indexes: [
          {
            fields: ['tenantId'],
          },
          {
            fields: ['userId'],
          },
          {
            fields: ['action'],
          },
          {
            fields: ['resourceType', 'resourceId'],
          },
        ],
      }
    );
  }

  static async logUserAction(
    tenantId: string,
    userId: string,
    action: AuditAction,
    resourceType: string,
    resourceId: string | null,
    details: object,
    ipAddress: string,
    userAgent: string,
    success: boolean = true,
    errorMessage: string | null = null
  ): Promise<AuditLog> {
    const auditData: any = {
      id: uuidv4(),
      tenantId,
      userId,
      action,
      resourceType,
      details,
      ipAddress,
      userAgent,
      success,
    };

    if (resourceId) {
      auditData.resourceId = resourceId;
    }

    if (errorMessage) {
      auditData.errorMessage = errorMessage;
    }

    return AuditLog.create(auditData);
  }
}
