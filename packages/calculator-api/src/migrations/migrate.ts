/**
 * Database migration runner
 */

import { Sequelize } from 'sequelize';
import { DatabaseService } from '../config/database';
import { up as createTables } from './001-create-tables';

export class MigrationRunner {
  private static sequelize: Sequelize;

  public static async initialize(): Promise<void> {
    const dbService = DatabaseService.getInstance();
    await dbService.connect();
    this.sequelize = dbService.getSequelize();
  }

  public static async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Running database migrations...');
      
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      
      // Check if migration has already been run
      const [results] = await this.sequelize.query(
        "SELECT * FROM migrations WHERE name = '001-create-tables'"
      );
      
      if (results.length === 0) {
        console.log('📝 Running migration: 001-create-tables');
        await createTables(this.sequelize.getQueryInterface());
        
        // Record migration as completed
        await this.sequelize.query(
          "INSERT INTO migrations (name, executed_at) VALUES ('001-create-tables', NOW())"
        );
        
        console.log('✅ Migration 001-create-tables completed successfully');
      } else {
        console.log('⏭️  Migration 001-create-tables already executed, skipping');
      }
      
      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  private static async createMigrationsTable(): Promise<void> {
    await this.sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  }

  public static async close(): Promise<void> {
    const dbService = DatabaseService.getInstance();
    await dbService.disconnect();
  }
}
