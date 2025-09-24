/**
 * Database models initialization and associations
 */

import { DatabaseService } from '../config/database';
import { User } from './SimpleUser';

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
      User
    };
  }

  public static async closeConnection(): Promise<void> {
    const dbService = DatabaseService.getInstance();
    await dbService.disconnect();
  }
}

// Export models for use in other parts of the application
export { User };
export { DatabaseService } from '../config/database';
