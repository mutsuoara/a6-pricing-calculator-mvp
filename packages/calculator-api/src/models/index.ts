/**
 * Database models initialization and associations
 */

import { DatabaseService } from '../config/database';
import { User } from './SimpleUser';
import { PricingProject } from './PricingProject';
import { LaborCategory } from './LaborCategory';
import { OtherDirectCost } from './OtherDirectCost';
import { AuditLog } from './AuditLog';

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
      AuditLog
    };
  }

  public static async closeConnection(): Promise<void> {
    const dbService = DatabaseService.getInstance();
    await dbService.disconnect();
  }
}

// Export models for use in other parts of the application
export { User, PricingProject, LaborCategory, OtherDirectCost, AuditLog };
export { DatabaseService } from '../config/database';
