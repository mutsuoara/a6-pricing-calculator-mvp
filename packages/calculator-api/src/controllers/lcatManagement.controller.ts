/**
 * LCAT Management Controller
 * Handles CRUD operations for LCAT management data
 */

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { CompanyRole, LCAT, ProjectRole, RateValidationRule, ContractVehicle } from '../models';

export class LCATManagementController {
  // Helper function to map clearance values
  private static mapClearanceValue(clearance: string): 'None' | 'Public Trust' | 'Secret' | 'Top Secret' {
    const clearanceMap: { [key: string]: 'None' | 'Public Trust' | 'Secret' | 'Top Secret' } = {
      'T2': 'Secret',
      'T3': 'Top Secret',
      'T1': 'Public Trust',
      'Public Trust': 'Public Trust',
      'Secret': 'Secret',
      'Top Secret': 'Top Secret',
      'None': 'None',
      '': 'None',
      'N/A': 'None',
      'Unclassified': 'None'
    };
    
    return clearanceMap[clearance] || 'None';
  }

  // Company Roles
  public static async getCompanyRoles(_req: Request, res: Response): Promise<void> {
    try {
      const companyRoles = await CompanyRole.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
      });
      res.json(companyRoles);
    } catch (error) {
      console.error('Error fetching company roles:', error);
      res.status(500).json({ error: 'Failed to fetch company roles' });
    }
  }

  public static async createCompanyRole(req: Request, res: Response): Promise<void> {
    try {
      const companyRole = await CompanyRole.create({
        ...req.body,
        tenantId: '00000000-0000-0000-0000-000000000000', // In real app, get from auth context
        createdBy: 'system' // In real app, get from auth context
      });
      res.status(201).json(companyRole);
    } catch (error) {
      console.error('Error creating company role:', error);
      res.status(500).json({ error: 'Failed to create company role', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public static async updateCompanyRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const [updated] = await CompanyRole.update(req.body, {
        where: { id }
      });
      
      if (updated) {
        const companyRole = await CompanyRole.findByPk(id);
        res.json(companyRole);
      } else {
        res.status(404).json({ error: 'Company role not found' });
      }
    } catch (error) {
      console.error('Error updating company role:', error);
      res.status(500).json({ error: 'Failed to update company role' });
    }
  }

  public static async deleteCompanyRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await CompanyRole.destroy({
        where: { id }
      });
      
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Company role not found' });
      }
    } catch (error) {
      console.error('Error deleting company role:', error);
      res.status(500).json({ error: 'Failed to delete company role' });
    }
  }

  // LCATs
  public static async getLCATs(_req: Request, res: Response): Promise<void> {
    try {
      const lcats = await LCAT.findAll({
        where: { isActive: true },
        order: [['vehicle', 'ASC'], ['name', 'ASC']]
      });
      res.json(lcats);
    } catch (error) {
      console.error('Error fetching LCATs:', error);
      res.status(500).json({ error: 'Failed to fetch LCATs' });
    }
  }

  public static async createLCAT(req: Request, res: Response): Promise<void> {
    try {
      const lcat = await LCAT.create({
        ...req.body,
        tenantId: '00000000-0000-0000-0000-000000000000', // In real app, get from auth context
        createdBy: 'system' // In real app, get from auth context
      });
      res.status(201).json(lcat);
    } catch (error) {
      console.error('Error creating LCAT:', error);
      res.status(500).json({ error: 'Failed to create LCAT' });
    }
  }

  public static async updateLCAT(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const [updated] = await LCAT.update(req.body, {
        where: { id }
      });
      
      if (updated) {
        const lcat = await LCAT.findByPk(id);
        res.json(lcat);
      } else {
        res.status(404).json({ error: 'LCAT not found' });
      }
    } catch (error) {
      console.error('Error updating LCAT:', error);
      res.status(500).json({ error: 'Failed to update LCAT' });
    }
  }

  public static async deleteLCAT(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await LCAT.destroy({
        where: { id }
      });
      
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'LCAT not found' });
      }
    } catch (error) {
      console.error('Error deleting LCAT:', error);
      res.status(500).json({ error: 'Failed to delete LCAT' });
    }
  }

  // Project Roles
  public static async getProjectRoles(_req: Request, res: Response): Promise<void> {
    try {
      const projectRoles = await ProjectRole.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
      });
      res.json(projectRoles);
    } catch (error) {
      console.error('Error fetching project roles:', error);
      res.status(500).json({ error: 'Failed to fetch project roles' });
    }
  }

  public static async createProjectRole(req: Request, res: Response): Promise<void> {
    try {
      const projectRole = await ProjectRole.create({
        ...req.body,
        tenantId: '00000000-0000-0000-0000-000000000000', // In real app, get from auth context
        createdBy: 'system' // In real app, get from auth context
      });
      res.status(201).json(projectRole);
    } catch (error) {
      console.error('Error creating project role:', error);
      res.status(500).json({ error: 'Failed to create project role' });
    }
  }

  public static async updateProjectRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const [updated] = await ProjectRole.update(req.body, {
        where: { id }
      });
      
      if (updated) {
        const projectRole = await ProjectRole.findByPk(id);
        res.json(projectRole);
      } else {
        res.status(404).json({ error: 'Project role not found' });
      }
    } catch (error) {
      console.error('Error updating project role:', error);
      res.status(500).json({ error: 'Failed to update project role' });
    }
  }

  public static async deleteProjectRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await ProjectRole.destroy({
        where: { id }
      });
      
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Project role not found' });
      }
    } catch (error) {
      console.error('Error deleting project role:', error);
      res.status(500).json({ error: 'Failed to delete project role' });
    }
  }

  // Rate Validation Rules
  public static async getRateValidationRules(_req: Request, res: Response): Promise<void> {
    try {
      const rules = await RateValidationRule.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']]
      });
      res.json(rules);
    } catch (error) {
      console.error('Error fetching rate validation rules:', error);
      res.status(500).json({ error: 'Failed to fetch rate validation rules' });
    }
  }

  public static async createRateValidationRule(req: Request, res: Response): Promise<void> {
    try {
      const rule = await RateValidationRule.create({
        ...req.body,
        tenantId: '00000000-0000-0000-0000-000000000000', // In real app, get from auth context
        createdBy: 'system' // In real app, get from auth context
      });
      res.status(201).json(rule);
    } catch (error) {
      console.error('Error creating rate validation rule:', error);
      res.status(500).json({ error: 'Failed to create rate validation rule' });
    }
  }

  public static async updateRateValidationRule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const [updated] = await RateValidationRule.update(req.body, {
        where: { id }
      });
      
      if (updated) {
        const rule = await RateValidationRule.findByPk(id);
        res.json(rule);
      } else {
        res.status(404).json({ error: 'Rate validation rule not found' });
      }
    } catch (error) {
      console.error('Error updating rate validation rule:', error);
      res.status(500).json({ error: 'Failed to update rate validation rule' });
    }
  }

  public static async deleteRateValidationRule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await RateValidationRule.destroy({
        where: { id }
      });
      
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Rate validation rule not found' });
      }
    } catch (error) {
      console.error('Error deleting rate validation rule:', error);
      res.status(500).json({ error: 'Failed to delete rate validation rule' });
    }
  }

  // Bulk import
  public static async bulkImport(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 Bulk import request received');
      console.log('Request headers:', req.headers);
      console.log('Request body keys:', Object.keys(req.body || {}));
      
      const { contractVehicles, companyRoles, lcats, projectRoles, rateValidationRules } = req.body;
      
      const results = {
        contractVehicles: [] as any[],
        companyRoles: [] as any[],
        lcats: [] as any[],
        projectRoles: [] as any[],
        rateValidationRules: [] as any[]
      };

      // Import Contract Vehicles
      if (contractVehicles && contractVehicles.length > 0) {
        for (const vehicle of contractVehicles) {
          const { id, createdAt, updatedAt, ...vehicleData } = vehicle;
          
          // Check if contract vehicle already exists by name or code
          const existingVehicle = await ContractVehicle.findOne({
            where: {
              [Op.or]: [
                { name: vehicleData.name },
                { code: vehicleData.code }
              ],
              tenantId: '00000000-0000-0000-0000-000000000000'
            }
          });

          let result;
          if (existingVehicle) {
            // Update existing vehicle
            await existingVehicle.update({
              ...vehicleData,
              updatedAt: new Date(),
              createdBy: 'import'
            });
            result = existingVehicle;
          } else {
            // Create new vehicle
            result = await ContractVehicle.create({
              ...vehicleData,
              tenantId: '00000000-0000-0000-0000-000000000000',
              createdBy: 'import'
            });
          }
          results.contractVehicles.push(result);
        }
      }

      // Import Company Roles
      if (companyRoles && companyRoles.length > 0) {
        for (const role of companyRoles) {
          const { id, createdAt, updatedAt, ...roleData } = role;
          const created = await CompanyRole.create({
            ...roleData,
            tenantId: '00000000-0000-0000-0000-000000000000',
            createdBy: 'import'
          });
          results.companyRoles.push(created);
        }
      }

      // Import LCATs
      if (lcats && lcats.length > 0) {
        for (const lcat of lcats) {
          const { id, createdAt, updatedAt, ...lcatData } = lcat;
          const created = await LCAT.create({
            ...lcatData,
            tenantId: '00000000-0000-0000-0000-000000000000',
            createdBy: 'import'
          });
          results.lcats.push(created);
        }
      }

      // Import Project Roles
      if (projectRoles && projectRoles.length > 0) {
        for (const role of projectRoles) {
          const { id, createdAt, updatedAt, ...roleData } = role;
          const created = await ProjectRole.create({
            ...roleData,
            typicalClearance: LCATManagementController.mapClearanceValue(roleData.typicalClearance || ''),
            tenantId: '00000000-0000-0000-0000-000000000000',
            createdBy: 'import'
          });
          results.projectRoles.push(created);
        }
      }

      // Import Rate Validation Rules
      if (rateValidationRules && rateValidationRules.length > 0) {
        for (const rule of rateValidationRules) {
          const { id, createdAt, updatedAt, ...ruleData } = rule;
          const created = await RateValidationRule.create({
            ...ruleData,
            tenantId: '00000000-0000-0000-0000-000000000000',
            createdBy: 'import'
          });
          results.rateValidationRules.push(created);
        }
      }

      res.json({
        message: 'Bulk import completed successfully',
        results
      });
    } catch (error) {
      console.error('Error during bulk import:', error);
      res.status(500).json({ 
        error: 'Failed to import data', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Contract Vehicles
  public static async getContractVehicles(_req: Request, res: Response): Promise<void> {
    try {
      const contractVehicles = await ContractVehicle.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
      });
      res.json(contractVehicles);
    } catch (error) {
      console.error('Error fetching contract vehicles:', error);
      res.status(500).json({ error: 'Failed to fetch contract vehicles' });
    }
  }

  public static async createContractVehicle(req: Request, res: Response): Promise<void> {
    try {
      const contractVehicle = await ContractVehicle.create({
        ...req.body,
        tenantId: '00000000-0000-0000-0000-000000000000', // In real app, get from auth context
        createdBy: 'system' // In real app, get from auth context
      });
      res.status(201).json(contractVehicle);
    } catch (error) {
      console.error('Error creating contract vehicle:', error);
      res.status(500).json({ error: 'Failed to create contract vehicle', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public static async updateContractVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const [updated] = await ContractVehicle.update(req.body, {
        where: { id },
        returning: true
      });
      
      if (updated === 0) {
        res.status(404).json({ error: 'Contract vehicle not found' });
        return;
      }
      
      res.json({ message: 'Contract vehicle updated successfully' });
    } catch (error) {
      console.error('Error updating contract vehicle:', error);
      res.status(500).json({ error: 'Failed to update contract vehicle', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public static async deleteContractVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await ContractVehicle.destroy({
        where: { id }
      });
      
      if (deleted === 0) {
        res.status(404).json({ error: 'Contract vehicle not found' });
        return;
      }
      
      res.json({ message: 'Contract vehicle deleted successfully' });
    } catch (error) {
      console.error('Error deleting contract vehicle:', error);
      res.status(500).json({ error: 'Failed to delete contract vehicle', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Clear All Data
  public static async clearAllData(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🗑️  Clearing all LCAT management data...');
      
      // Use truncate for more reliable clearing
      const sequelize = CompanyRole.sequelize!;
      
      // Clear all data from all tables using truncate with CASCADE to handle foreign keys
      await sequelize.query('TRUNCATE TABLE company_roles CASCADE');
      await sequelize.query('TRUNCATE TABLE lcats CASCADE');
      await sequelize.query('TRUNCATE TABLE project_roles CASCADE');
      await sequelize.query('TRUNCATE TABLE rate_validation_rules CASCADE');
      await sequelize.query('TRUNCATE TABLE contract_vehicles CASCADE');
      
      console.log('✅ All LCAT management data cleared successfully');
      
      res.json({
        message: 'All data cleared successfully',
        clearedTables: ['company_roles', 'lcats', 'project_roles', 'rate_validation_rules', 'contract_vehicles']
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
      res.status(500).json({ 
        error: 'Failed to clear all data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Template Download
  public static async downloadTemplate(_req: Request, res: Response): Promise<void> {
    try {
      // Generate a simple template with sample data
      const XLSX = require('xlsx');
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Contract Vehicles sheet
      const contractVehiclesData = [
        ['ID', 'Name', 'Description', 'Max Overhead Rate', 'Max G&A Rate', 'Max Fee Rate', 'Escalation Rate', 'Is Active', 'Created At', 'Updated At', 'Created By'],
        ['cv-1', 'VA SPRUCE', 'VA Software Product Research and Development Contract', '0.15', '0.10', '0.05', '0.03', 'TRUE', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', 'system'],
        ['cv-2', 'GSA MAS', 'GSA Multiple Award Schedule', '0.12', '0.08', '0.04', '0.025', 'TRUE', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', 'system']
      ];
      const contractVehiclesSheet = XLSX.utils.aoa_to_sheet(contractVehiclesData);
      XLSX.utils.book_append_sheet(workbook, contractVehiclesSheet, 'Contract Vehicles');
      
      // LCATs sheet
      const lcatsData = [
        ['ID', 'Vehicle', 'Name', 'Code', 'Description', 'Rate', 'Is Active', 'Created At', 'Updated At', 'Created By'],
        ['lcat-1', 'VA SPRUCE', 'Software Engineer', 'SWE', 'Software development and engineering', '125.50', 'TRUE', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', 'system'],
        ['lcat-2', 'GSA MAS', 'Product Manager', 'PM', 'Product management and strategy', '135.75', 'TRUE', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', 'system']
      ];
      const lcatsSheet = XLSX.utils.aoa_to_sheet(lcatsData);
      XLSX.utils.book_append_sheet(workbook, lcatsSheet, 'LCATs');
      
      // Project Roles sheet
      const projectRolesData = [
        ['ID', 'Name', 'Description', 'Typical Clearance', 'Typical Hours', 'Is Active', 'Created At', 'Updated At', 'Created By'],
        ['pr-1', 'Engineering Lead (KP)', 'Key Personnel Engineering Lead', 'Secret', '2080', 'TRUE', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', 'system'],
        ['pr-2', 'Lead Product Manager (KP)', 'Key Personnel Product Manager', 'Public Trust', '2080', 'TRUE', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', 'system']
      ];
      const projectRolesSheet = XLSX.utils.aoa_to_sheet(projectRolesData);
      XLSX.utils.book_append_sheet(workbook, projectRolesSheet, 'Project Roles');
      
      // Agile Six Roles sheet
      const companyRolesData = [
        ['ID', 'Name', 'Practice Area', 'Description', 'Pay Band (($dollar amount))', 'Rate Increase', 'Is Active', 'Created At', 'Updated At', 'Created By'],
        ['cr-1', 'Senior Software Engineer', 'Engineering', 'Senior level software engineering role with 5+ years experience', '120000', '0.03', 'TRUE', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', 'system'],
        ['cr-2', 'Lead Product Manager', 'Product', 'Lead product management role with strategic responsibilities', '130000', '0.03', 'TRUE', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', 'system']
      ];
      const companyRolesSheet = XLSX.utils.aoa_to_sheet(companyRolesData);
      XLSX.utils.book_append_sheet(workbook, companyRolesSheet, 'Agile Six Roles');
      
      // Rate Validation Rules sheet
      const rateValidationData = [
        ['ID', 'Company Role ID', 'Contract Vehicle ID', 'Project ID', 'Min Rate', 'Max Rate', 'Typical Rate', 'Max Escalation Rate', 'Min Escalation Rate', 'Is Active', 'Created At', 'Updated At', 'Created By'],
        ['rvr-1', 'cr-1', 'cv-1', '', '100.00', '150.00', '125.00', '0.05', '0.01', 'TRUE', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', 'system']
      ];
      const rateValidationSheet = XLSX.utils.aoa_to_sheet(rateValidationData);
      XLSX.utils.book_append_sheet(workbook, rateValidationSheet, 'Rate Validation Rules');
      
      // Instructions sheet
      const instructionsData = [
        ['Instructions for LCAT Mapping Template'],
        [''],
        ['This template contains 5 sheets:'],
        ['1. Contract Vehicles - Define available contract vehicles'],
        ['2. LCATs - Define Labor Categories for each vehicle'],
        ['3. Project Roles - Define roles within projects'],
        ['4. Agile Six Roles - Define company internal roles'],
        ['5. Rate Validation Rules - Define rate validation rules'],
        [''],
        ['To use this template:'],
        ['1. Fill in the data for each sheet'],
        ['2. Save the file'],
        ['3. Upload it using the Import Data button in the LCAT Management interface'],
        [''],
        ['Note: Do not modify the header rows or column structure.']
      ];
      const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
      
      // Generate buffer
      const templateBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Set response headers for file download
      const filename = `LCAT_Mapping_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', templateBuffer.length);
      
      // Send Excel file
      res.send(templateBuffer);
    } catch (error) {
      console.error('Template download error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate template',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
