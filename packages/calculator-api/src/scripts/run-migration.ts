#!/usr/bin/env tsx

/**
 * Run Migration Script
 * Manually runs the LCAT management migration
 */

import { Sequelize } from 'sequelize';
import { up as migrateUp } from '../migrations/005-create-lcat-management-tables';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pricing_calculator',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  logging: console.log,
});

async function runMigration() {
  try {
    console.log('🔄 Running LCAT management migration...');
    
    // Check if company_roles table exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'company_roles' 
      AND column_name IN ('rate', 'payBand')
    `);
    
    console.log('Current columns:', results);
    
    // If payBand exists but rate doesn't, we need to migrate
    const hasPayBand = results.some((row: any) => row.column_name === 'payBand');
    const hasRate = results.some((row: any) => row.column_name === 'rate');
    
    if (hasPayBand && !hasRate) {
      console.log('🔄 Migrating payBand to rate column...');
      
      // Add rate column
      await sequelize.query(`
        ALTER TABLE company_roles 
        ADD COLUMN rate DECIMAL(10,2) NOT NULL DEFAULT 0
      `);
      
      // Copy data from payBand to rate
      await sequelize.query(`
        UPDATE company_roles 
        SET rate = "payBand"
      `);
      
      // Drop payBand column
      await sequelize.query(`
        ALTER TABLE company_roles 
        DROP COLUMN "payBand"
      `);
      
      console.log('✅ Migration completed successfully');
    } else if (hasRate) {
      console.log('✅ Rate column already exists, no migration needed');
    } else {
      console.log('🔄 Running full migration...');
      await migrateUp(sequelize.getQueryInterface());
      console.log('✅ Full migration completed successfully');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigration();
