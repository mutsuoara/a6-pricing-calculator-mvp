/**
 * Database Reset Script
 * Drops all tables and recreates them from scratch
 */

import { DatabaseService } from '../config/database';

async function resetDatabase() {
  try {
    console.log('🗑️  Resetting database...');
    
    const dbService = DatabaseService.getInstance();
    await dbService.connect();
    
    const sequelize = dbService.getSequelize();
    
    // Drop all tables and clear migrations table
    console.log('📝 Dropping all tables...');
    
    // First, try to drop the migrations table specifically
    try {
      await sequelize.query('DROP TABLE IF EXISTS migrations CASCADE;');
      console.log('✅ Migrations table dropped');
    } catch (error) {
      console.log('ℹ️  Migrations table may not exist, continuing...');
    }
    
    // Also try to drop system_settings table specifically since it's causing issues
    try {
      await sequelize.query('DROP TABLE IF EXISTS system_settings CASCADE;');
      console.log('✅ System settings table dropped');
    } catch (error) {
      console.log('ℹ️  System settings table may not exist, continuing...');
    }
    
    // Drop all other tables
    await sequelize.dropAllSchemas({ cascade: true });
    
    // Also try to drop any remaining tables
    try {
      await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
      console.log('✅ Public schema recreated');
    } catch (error) {
      console.log('ℹ️  Schema reset not needed or not supported');
    }
    
    console.log('✅ Database reset completed successfully');
    console.log('🔄 You can now run migrations to recreate the schema');
    
    await dbService.disconnect();
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

// Run the reset if this script is executed directly
if (require.main === module) {
  resetDatabase();
}

export { resetDatabase };
