/**
 * Fix tenantId column naming to match model definitions
 * Changes snake_case to camelCase for tenantId columns
 */

import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('🔄 Checking tenantId column naming...');

  // Check if columns need to be renamed (they might already be correct)
  const [usersColumns] = await queryInterface.sequelize.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('tenant_id', 'tenantId')"
  );

  // Fix users table - rename tenant_id to tenantId if needed
  if (usersColumns.some((col: any) => col.column_name === 'tenant_id')) {
    await queryInterface.renameColumn('users', 'tenant_id', 'tenantId');
    console.log('✅ Fixed users.tenantId column');
  } else {
    console.log('⏭️  users.tenantId column already correct');
  }

  // Check pricing_projects table
  const [pricingColumns] = await queryInterface.sequelize.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'pricing_projects' AND column_name IN ('tenant_id', 'tenantId')"
  );

  if (pricingColumns.some((col: any) => col.column_name === 'tenant_id')) {
    await queryInterface.renameColumn('pricing_projects', 'tenant_id', 'tenantId');
    console.log('✅ Fixed pricing_projects.tenantId column');
  } else {
    console.log('⏭️  pricing_projects.tenantId column already correct');
  }

  // Check audit_logs table
  const [auditColumns] = await queryInterface.sequelize.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name IN ('tenant_id', 'tenantId')"
  );

  if (auditColumns.some((col: any) => col.column_name === 'tenant_id')) {
    await queryInterface.renameColumn('audit_logs', 'tenant_id', 'tenantId');
    console.log('✅ Fixed audit_logs.tenantId column');
  } else {
    console.log('⏭️  audit_logs.tenantId column already correct');
  }

  // Also fix other camelCase columns in pricing_projects
  await queryInterface.renameColumn('pricing_projects', 'labor_categories', 'laborCategories');
  await queryInterface.renameColumn('pricing_projects', 'other_direct_costs', 'otherDirectCosts');
  await queryInterface.renameColumn('pricing_projects', 'is_template', 'isTemplate');
  await queryInterface.renameColumn('pricing_projects', 'created_by', 'createdBy');
  await queryInterface.renameColumn('pricing_projects', 'updated_by', 'updatedBy');
  await queryInterface.renameColumn('pricing_projects', 'created_at', 'createdAt');
  await queryInterface.renameColumn('pricing_projects', 'updated_at', 'updatedAt');
  await queryInterface.renameColumn('pricing_projects', 'deleted_at', 'deletedAt');
  console.log('✅ Fixed pricing_projects camelCase columns');

  // Fix other camelCase columns in users
  await queryInterface.renameColumn('users', 'google_id', 'googleId');
  await queryInterface.renameColumn('users', 'is_active', 'isActive');
  await queryInterface.renameColumn('users', 'last_login_at', 'lastLoginAt');
  await queryInterface.renameColumn('users', 'created_at', 'createdAt');
  await queryInterface.renameColumn('users', 'updated_at', 'updatedAt');
  await queryInterface.renameColumn('users', 'deleted_at', 'deletedAt');
  console.log('✅ Fixed users camelCase columns');

  // Fix other camelCase columns in audit_logs
  await queryInterface.renameColumn('audit_logs', 'user_id', 'userId');
  await queryInterface.renameColumn('audit_logs', 'resource_type', 'resourceType');
  await queryInterface.renameColumn('audit_logs', 'resource_id', 'resourceId');
  await queryInterface.renameColumn('audit_logs', 'ip_address', 'ipAddress');
  await queryInterface.renameColumn('audit_logs', 'user_agent', 'userAgent');
  await queryInterface.renameColumn('audit_logs', 'error_message', 'errorMessage');
  await queryInterface.renameColumn('audit_logs', 'created_at', 'createdAt');
  await queryInterface.renameColumn('audit_logs', 'updated_at', 'updatedAt');
  console.log('✅ Fixed audit_logs camelCase columns');

  console.log('🎉 All tenantId column naming fixed successfully');
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('🔄 Reverting tenantId column naming...');

  // Revert users table
  await queryInterface.renameColumn('users', 'tenantId', 'tenant_id');
  await queryInterface.renameColumn('users', 'googleId', 'google_id');
  await queryInterface.renameColumn('users', 'isActive', 'is_active');
  await queryInterface.renameColumn('users', 'lastLoginAt', 'last_login_at');
  await queryInterface.renameColumn('users', 'createdAt', 'created_at');
  await queryInterface.renameColumn('users', 'updatedAt', 'updated_at');
  await queryInterface.renameColumn('users', 'deletedAt', 'deleted_at');

  // Revert pricing_projects table
  await queryInterface.renameColumn('pricing_projects', 'tenantId', 'tenant_id');
  await queryInterface.renameColumn('pricing_projects', 'laborCategories', 'labor_categories');
  await queryInterface.renameColumn('pricing_projects', 'otherDirectCosts', 'other_direct_costs');
  await queryInterface.renameColumn('pricing_projects', 'isTemplate', 'is_template');
  await queryInterface.renameColumn('pricing_projects', 'createdBy', 'created_by');
  await queryInterface.renameColumn('pricing_projects', 'updatedBy', 'updated_by');
  await queryInterface.renameColumn('pricing_projects', 'createdAt', 'created_at');
  await queryInterface.renameColumn('pricing_projects', 'updatedAt', 'updated_at');
  await queryInterface.renameColumn('pricing_projects', 'deletedAt', 'deleted_at');

  // Revert audit_logs table
  await queryInterface.renameColumn('audit_logs', 'tenantId', 'tenant_id');
  await queryInterface.renameColumn('audit_logs', 'userId', 'user_id');
  await queryInterface.renameColumn('audit_logs', 'resourceType', 'resource_type');
  await queryInterface.renameColumn('audit_logs', 'resourceId', 'resource_id');
  await queryInterface.renameColumn('audit_logs', 'ipAddress', 'ip_address');
  await queryInterface.renameColumn('audit_logs', 'userAgent', 'user_agent');
  await queryInterface.renameColumn('audit_logs', 'errorMessage', 'error_message');
  await queryInterface.renameColumn('audit_logs', 'createdAt', 'created_at');
  await queryInterface.renameColumn('audit_logs', 'updatedAt', 'updated_at');

  console.log('✅ Reverted all column naming changes');
};
