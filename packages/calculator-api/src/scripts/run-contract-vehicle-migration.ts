#!/usr/bin/env tsx

/**
 * Run Contract Vehicle Migration Script
 * Manually runs the contract vehicle fields migration
 */

import { Sequelize } from 'sequelize';
import { up as migrateUp } from '../migrations/006-add-missing-contract-vehicle-fields';

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
    console.log('🔄 Running contract vehicle fields migration...');
    
    // Check if escalationRate column exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contract_vehicles' 
      AND column_name IN ('escalationRate', 'startDate', 'endDate', 'createdBy')
    `);
    
    console.log('Current columns:', results);
    
    const existingColumns = results.map((row: any) => row.column_name);
    const missingColumns = ['escalationRate', 'startDate', 'endDate', 'createdBy'].filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('🔄 Adding missing columns:', missingColumns);
      await migrateUp(sequelize.getQueryInterface());
      console.log('✅ Migration completed successfully');
    } else {
      console.log('✅ All columns already exist, no migration needed');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigration();
