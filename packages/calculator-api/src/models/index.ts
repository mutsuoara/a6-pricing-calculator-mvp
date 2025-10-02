/**
 * Database models initialization and associations
 */

import { DatabaseService } from '../config/database';
import { User } from './SimpleUser';
import { PricingProject } from './PricingProject';
import { LaborCategory } from './LaborCategory';
import { OtherDirectCost } from './OtherDirectCost';
import { AuditLog } from './AuditLog';
import { ContractVehicle } from './ContractVehicle';
import { A6Role } from './A6Role';
import { LaborCategoryTemplate } from './LaborCategoryTemplate';
import { CompanyRole, initCompanyRole } from './CompanyRole';
import { LCAT, initLCAT } from './LCAT';
import { ProjectRole, initProjectRole } from './ProjectRole';
import { RateValidationRule, initRateValidationRule } from './RateValidationRule';

export class ModelManager {
  private static initialized = false;

  public static async initializeModels(): Promise<void> {
    if (ModelManager.initialized) {
      return;
    }

    try {
      // Initialize database connection
      const dbService = DatabaseService.getInstance();
      await dbService.connect();

      // Initialize all models
      User.initModel();
      PricingProject.initModel();
      LaborCategory.initModel();
      OtherDirectCost.initModel();
      AuditLog.initModel();
      ContractVehicle.initModel();
      A6Role.initModel();
      LaborCategoryTemplate.initModel();
      
      // Initialize LCAT Management models
      const sequelize = dbService.getSequelize();
      initCompanyRole(sequelize);
      initLCAT(sequelize);
      initProjectRole(sequelize);
      initRateValidationRule(sequelize);

      // Set up associations
      PricingProject.hasMany(LaborCategory, {
        foreignKey: 'projectId',
        as: 'laborCategories',
        onDelete: 'CASCADE',
      });

      LaborCategory.belongsTo(PricingProject, {
        foreignKey: 'projectId',
        as: 'project',
      });

      PricingProject.hasMany(OtherDirectCost, {
        foreignKey: 'projectId',
        as: 'otherDirectCosts',
        onDelete: 'CASCADE',
      });

      OtherDirectCost.belongsTo(PricingProject, {
        foreignKey: 'projectId',
        as: 'project',
      });

      // LCAT Template associations - using JSON storage instead of many-to-many

      // Sync database (create tables if they don't exist)
      await dbService.sync();

      ModelManager.initialized = true;
      console.log('✅ All database models initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database models:', error);
      throw error;
    }
  }

  public static getModels() {
    return {
      User,
      PricingProject,
      LaborCategory,
      OtherDirectCost,
      AuditLog,
      ContractVehicle,
      A6Role,
      LaborCategoryTemplate,
      CompanyRole,
      LCAT,
      ProjectRole,
      RateValidationRule
    };
  }

  public static async closeConnection(): Promise<void> {
    const dbService = DatabaseService.getInstance();
    await dbService.disconnect();
  }
}

// Export models for use in other parts of the application
export { User, PricingProject, LaborCategory, OtherDirectCost, AuditLog, ContractVehicle, A6Role, LaborCategoryTemplate, CompanyRole, LCAT, ProjectRole, RateValidationRule };
export { DatabaseService } from '../config/database';
