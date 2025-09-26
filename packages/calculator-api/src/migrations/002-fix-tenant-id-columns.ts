/**
 * Fix tenantId column naming to match model definitions
 * Changes snake_case to camelCase for tenantId columns
 */

import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('🔄 Checking tenantId column naming...');

  // Helper function to safely rename column if it exists
  const safeRenameColumn = async (tableName: string, oldName: string, newName: string) => {
    try {
      const [columns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}' AND column_name = '${oldName}'`
      );
      
      if (columns.length > 0) {
        await queryInterface.renameColumn(tableName, oldName, newName);
        console.log(`✅ Renamed ${tableName}.${oldName} to ${newName}`);
        return true;
      } else {
        console.log(`⏭️  ${tableName}.${oldName} doesn't exist, skipping`);
        return false;
      }
    } catch (error) {
      console.log(`⚠️  Error renaming ${tableName}.${oldName}: ${error}`);
      return false;
    }
  };

  // Fix users table columns
  await safeRenameColumn('users', 'tenant_id', 'tenantId');
  await safeRenameColumn('users', 'google_id', 'googleId');
  await safeRenameColumn('users', 'is_active', 'isActive');
  await safeRenameColumn('users', 'last_login_at', 'lastLoginAt');
  await safeRenameColumn('users', 'created_at', 'createdAt');
  await safeRenameColumn('users', 'updated_at', 'updatedAt');
  await safeRenameColumn('users', 'deleted_at', 'deletedAt');

  // Fix pricing_projects table columns
  await safeRenameColumn('pricing_projects', 'tenant_id', 'tenantId');
  await safeRenameColumn('pricing_projects', 'labor_categories', 'laborCategories');
  await safeRenameColumn('pricing_projects', 'other_direct_costs', 'otherDirectCosts');
  await safeRenameColumn('pricing_projects', 'is_template', 'isTemplate');
  await safeRenameColumn('pricing_projects', 'created_by', 'createdBy');
  await safeRenameColumn('pricing_projects', 'updated_by', 'updatedBy');
  await safeRenameColumn('pricing_projects', 'created_at', 'createdAt');
  await safeRenameColumn('pricing_projects', 'updated_at', 'updatedAt');
  await safeRenameColumn('pricing_projects', 'deleted_at', 'deletedAt');

  // Fix audit_logs table columns
  await safeRenameColumn('audit_logs', 'tenant_id', 'tenantId');
  await safeRenameColumn('audit_logs', 'user_id', 'userId');
  await safeRenameColumn('audit_logs', 'resource_type', 'resourceType');
  await safeRenameColumn('audit_logs', 'resource_id', 'resourceId');
  await safeRenameColumn('audit_logs', 'ip_address', 'ipAddress');
  await safeRenameColumn('audit_logs', 'user_agent', 'userAgent');
  await safeRenameColumn('audit_logs', 'error_message', 'errorMessage');
  await safeRenameColumn('audit_logs', 'created_at', 'createdAt');
  await safeRenameColumn('audit_logs', 'updated_at', 'updatedAt');

  console.log('🎉 All tenantId column naming fixed successfully');
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('🔄 Reverting tenantId column naming...');

  // Helper function to safely rename column if it exists
  const safeRenameColumn = async (tableName: string, oldName: string, newName: string) => {
    try {
      const [columns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}' AND column_name = '${oldName}'`
      );
      
      if (columns.length > 0) {
        await queryInterface.renameColumn(tableName, oldName, newName);
        console.log(`✅ Reverted ${tableName}.${oldName} to ${newName}`);
        return true;
      } else {
        console.log(`⏭️  ${tableName}.${oldName} doesn't exist, skipping`);
        return false;
      }
    } catch (error) {
      console.log(`⚠️  Error reverting ${tableName}.${oldName}: ${error}`);
      return false;
    }
  };

  // Revert users table
  await safeRenameColumn('users', 'tenantId', 'tenant_id');
  await safeRenameColumn('users', 'googleId', 'google_id');
  await safeRenameColumn('users', 'isActive', 'is_active');
  await safeRenameColumn('users', 'lastLoginAt', 'last_login_at');
  await safeRenameColumn('users', 'createdAt', 'created_at');
  await safeRenameColumn('users', 'updatedAt', 'updated_at');
  await safeRenameColumn('users', 'deletedAt', 'deleted_at');

  // Revert pricing_projects table
  await safeRenameColumn('pricing_projects', 'tenantId', 'tenant_id');
  await safeRenameColumn('pricing_projects', 'laborCategories', 'labor_categories');
  await safeRenameColumn('pricing_projects', 'otherDirectCosts', 'other_direct_costs');
  await safeRenameColumn('pricing_projects', 'isTemplate', 'is_template');
  await safeRenameColumn('pricing_projects', 'createdBy', 'created_by');
  await safeRenameColumn('pricing_projects', 'updatedBy', 'updated_by');
  await safeRenameColumn('pricing_projects', 'createdAt', 'created_at');
  await safeRenameColumn('pricing_projects', 'updatedAt', 'updated_at');
  await safeRenameColumn('pricing_projects', 'deletedAt', 'deleted_at');

  // Revert audit_logs table
  await safeRenameColumn('audit_logs', 'tenantId', 'tenant_id');
  await safeRenameColumn('audit_logs', 'userId', 'user_id');
  await safeRenameColumn('audit_logs', 'resourceType', 'resource_type');
  await safeRenameColumn('audit_logs', 'resourceId', 'resource_id');
  await safeRenameColumn('audit_logs', 'ipAddress', 'ip_address');
  await safeRenameColumn('audit_logs', 'userAgent', 'user_agent');
  await safeRenameColumn('audit_logs', 'errorMessage', 'error_message');
  await safeRenameColumn('audit_logs', 'createdAt', 'created_at');
  await safeRenameColumn('audit_logs', 'updatedAt', 'updated_at');

  console.log('✅ Reverted all column naming changes');
};
