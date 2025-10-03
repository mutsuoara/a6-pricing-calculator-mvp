/**
 * Database migration runner
 */

import { Sequelize } from 'sequelize';
import { DatabaseService } from '../config/database';
import { up as createTables } from './001-create-tables';
import { up as fixTenantIdColumns } from './002-fix-tenant-id-columns';
import { up as createPricingTables } from './003-create-pricing-tables';
import { up as createLcatManagementTables } from './005-create-lcat-management-tables';
import { up as addLaborCategoriesJsonField } from './008-add-labor-categories-json-field';
import { up as addContractVehicleField } from './009-add-contract-vehicle-field';

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
      
      // Run migration 001-create-tables
      const [results1] = await this.sequelize.query(
        "SELECT * FROM migrations WHERE name = '001-create-tables'"
      );
      
      if (results1.length === 0) {
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

      // Run migration 002-fix-tenant-id-columns
      const [results2] = await this.sequelize.query(
        "SELECT * FROM migrations WHERE name = '002-fix-tenant-id-columns'"
      );
      
      if (results2.length === 0) {
        console.log('📝 Running migration: 002-fix-tenant-id-columns');
        await fixTenantIdColumns(this.sequelize.getQueryInterface());
        
        // Record migration as completed
        await this.sequelize.query(
          "INSERT INTO migrations (name, executed_at) VALUES ('002-fix-tenant-id-columns', NOW())"
        );
        
        console.log('✅ Migration 002-fix-tenant-id-columns completed successfully');
      } else {
        console.log('⏭️  Migration 002-fix-tenant-id-columns already executed, skipping');
      }

      // Run migration 003-create-pricing-tables
      const [results3] = await this.sequelize.query(
        "SELECT * FROM migrations WHERE name = '003-create-pricing-tables'"
      );
      
      if (results3.length === 0) {
        console.log('📝 Running migration: 003-create-pricing-tables');
        await createPricingTables(this.sequelize.getQueryInterface());
        
        // Record migration as completed
        await this.sequelize.query(
          "INSERT INTO migrations (name, executed_at) VALUES ('003-create-pricing-tables', NOW())"
        );
        
        console.log('✅ Migration 003-create-pricing-tables completed successfully');
      } else {
        console.log('⏭️  Migration 003-create-pricing-tables already executed, skipping');
      }

      // Run migration 005-create-lcat-management-tables
      const [results5] = await this.sequelize.query(
        "SELECT * FROM migrations WHERE name = '005-create-lcat-management-tables'"
      );
      
      if (results5.length === 0) {
        console.log('📝 Running migration: 005-create-lcat-management-tables');
        await createLcatManagementTables(this.sequelize.getQueryInterface());
        
        // Record migration as completed
        await this.sequelize.query(
          "INSERT INTO migrations (name, executed_at) VALUES ('005-create-lcat-management-tables', NOW())"
        );
        
        console.log('✅ Migration 005-create-lcat-management-tables completed successfully');
      } else {
        console.log('⏭️  Migration 005-create-lcat-management-tables already executed, skipping');
      }

      // Run migration 008-add-labor-categories-json-field
      const [results8] = await this.sequelize.query(
        "SELECT * FROM migrations WHERE name = '008-add-labor-categories-json-field'"
      );
      
      if (results8.length === 0) {
        console.log('📝 Running migration: 008-add-labor-categories-json-field');
        await addLaborCategoriesJsonField(this.sequelize.getQueryInterface());
        
        // Record migration as completed
        await this.sequelize.query(
          "INSERT INTO migrations (name, executed_at) VALUES ('008-add-labor-categories-json-field', NOW())"
        );
        
        console.log('✅ Migration 008-add-labor-categories-json-field completed successfully');
      } else {
        console.log('⏭️  Migration 008-add-labor-categories-json-field already executed, skipping');
      }

      // Run migration 009-add-contract-vehicle-field
      const [results9] = await this.sequelize.query(
        "SELECT * FROM migrations WHERE name = '009-add-contract-vehicle-field'"
      );
      
      if (results9.length === 0) {
        console.log('📝 Running migration: 009-add-contract-vehicle-field');
        await addContractVehicleField(this.sequelize.getQueryInterface());
        
        // Record migration as completed
        await this.sequelize.query(
          "INSERT INTO migrations (name, executed_at) VALUES ('009-add-contract-vehicle-field', NOW())"
        );
        
        console.log('✅ Migration 009-add-contract-vehicle-field completed successfully');
      } else {
        console.log('⏭️  Migration 009-add-contract-vehicle-field already executed, skipping');
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
