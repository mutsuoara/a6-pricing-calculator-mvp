/**
 * Template Service
 * Handles Excel template generation and import/export for LCAT mapping data
 */

import * as XLSX from 'xlsx';
import { ImportTemplate, ContractVehicle, ProjectRole, LCAT, CompanyRole, RateValidationRule } from '../types/mapping';
import { companyConfigService } from '../config/company.config';

export class TemplateService {
  
  /**
   * Generate Excel template with all required sheets and headers
   */
  static generateTemplate(): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    // Contract Vehicles Sheet (1st position)
    const contractVehiclesData = [
      ['ID', 'Name', 'Code', 'Description', 'Start Date', 'End Date', 'Escalation Rate (%)', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', 'VA SPRUCE', 'VA_SPRUCE', 'VA Software Product and User Experience Contract', '2024-01-01', '2028-12-31', '2.0', 'TRUE', '', '', ''],
      ['', 'GSA MAS', 'GSA_MAS', 'GSA Multiple Award Schedule', '2024-01-01', '2029-12-31', '1.5', 'TRUE', '', '', ''],
    ];
    const contractVehiclesSheet = XLSX.utils.aoa_to_sheet(contractVehiclesData);
    XLSX.utils.book_append_sheet(workbook, contractVehiclesSheet, 'Contract Vehicles');

    // LCATs Sheet (2nd position)
    const lcatsData = [
      ['ID', 'Vehicle', 'Name', 'Code', 'Description', 'Rate', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', 'VA SPRUCE', 'Software Engineer', 'SWE', 'Software Engineering position', '256.31', 'TRUE', '', '', ''],
      ['', 'VA SPRUCE', 'Product Manager', 'PM', 'Product Management position', '324.16', 'TRUE', '', '', ''],
      ['', 'GSA MAS', 'Software Engineer', 'SWE', 'Software Engineering position', '245.50', 'TRUE', '', '', ''],
      ['', 'GSA MAS', 'Product Manager', 'PM', 'Product Management position', '310.25', 'TRUE', '', '', ''],
    ];
    const lcatsSheet = XLSX.utils.aoa_to_sheet(lcatsData);
    XLSX.utils.book_append_sheet(workbook, lcatsSheet, 'LCATs');

    // Project Roles Sheet (3rd position)
    const projectRolesData = [
      ['ID', 'Name', 'Description', 'Typical Clearance', 'Typical Hours', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', 'Engineering Lead (KP)', 'Key Personnel Engineering Lead', 'Secret', '2080', 'TRUE', '', '', ''],
      ['', 'Lead Product Manager (KP)', 'Key Personnel Product Manager', 'Public Trust', '2080', 'TRUE', '', '', ''],
    ];
    const projectRolesSheet = XLSX.utils.aoa_to_sheet(projectRolesData);
    XLSX.utils.book_append_sheet(workbook, projectRolesSheet, 'Project Roles');

    // Agile Six Roles Sheet (4th position)
    const companyConfig = companyConfigService.getConfig();
    const companyRolesData = [
      ['ID', 'Name', 'Practice Area', 'Description', 'Pay Band (($dollar amount))', 'Rate Increase', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', `Senior Software Engineer at ${companyConfig.name}`, 'Engineering', `Senior level software engineering role at ${companyConfig.name}`, '120000', '3.0', 'TRUE', '', '', ''],
      ['', `Lead Product Manager at ${companyConfig.name}`, 'Product', `Lead product management role at ${companyConfig.name}`, '110000', '2.5', 'TRUE', '', '', ''],
      ['', `Principal Data Scientist at ${companyConfig.name}`, 'Data Science', `Principal level data science role at ${companyConfig.name}`, '130000', '4.0', 'TRUE', '', '', ''],
      ['', `Senior UX Designer at ${companyConfig.name}`, 'Design', `Senior user experience design role at ${companyConfig.name}`, '105000', '2.8', 'TRUE', '', '', ''],
    ];
    const companyRolesSheet = XLSX.utils.aoa_to_sheet(companyRolesData);
    XLSX.utils.book_append_sheet(workbook, companyRolesSheet, 'Agile Six Roles');

    // Three-Way Mappings sheet removed - simplified architecture

    // Rate Validation Rules Sheet
    const rateValidationRulesData = [
      ['ID', 'Company Role ID', 'Contract Vehicle ID', 'Project ID', 'Min Rate', 'Max Rate', 'Typical Rate', 'Max Escalation Rate (%)', 'Min Escalation Rate (%)', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', '', '', '', '100', '300', '200', '5.0', '0.0', 'TRUE', '', '', ''],
    ];
    const rateValidationRulesSheet = XLSX.utils.aoa_to_sheet(rateValidationRulesData);
    XLSX.utils.book_append_sheet(workbook, rateValidationRulesSheet, 'Rate Validation Rules');

    // Instructions Sheet
    const instructionsData = [
      ['LCAT Mapping Template Instructions'],
      [''],
      ['This template contains 5 sheets for managing LCAT mappings:'],
      [''],
      ['1. Contract Vehicles: Define available contract vehicles (VA SPRUCE, GSA MAS, etc.)'],
      ['2. LCATs: Define labor category titles with rates for all contract vehicles'],
      ['3. Project Roles: Define specific project roles with clearance and hours'],
      ['4. Agile Six Roles: Define internal company roles with practice areas and pay bands (dollar amounts)'],
      ['5. Rate Validation Rules: Define rate validation criteria'],
      [''],
      ['IMPORTANT NOTES:'],
      ['- Leave ID fields empty for new records (they will be auto-generated)'],
      ['- Use exact values for dropdown fields (see reference sheets)'],
      ['- Dates should be in YYYY-MM-DD format'],
      ['- Boolean values should be TRUE or FALSE'],
      ['- Comma-separated values for multi-select fields'],
      ['- Do not modify the header rows'],
      [''],
      ['REFERENCE VALUES:'],
      ['Clearance Levels: None, Public Trust, Secret, Top Secret'],
      ['Locations: Remote, On-site, Hybrid'],
      ['Categories: Engineering, Product, Experience, Management'],
      ['Contract Types: FFP, T&M, CPFF'],
      ['Practice Areas: Engineering, Product, Design, Data Science, Management, Operations'],
      ['Pay Bands: Band 1-5, Junior Level, Mid Level, Senior Level, Principal Level, Executive Level'],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    return workbook;
  }

  /**
   * Parse Excel file and extract mapping data
   */
  static parseTemplate(file: File): Promise<ImportTemplate> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
    const template: ImportTemplate = {
      contractVehicles: this.parseContractVehicles(workbook),
      projectRoles: this.parseProjectRoles(workbook),
      lcats: this.parseLCATs(workbook),
      companyRoles: this.parseCompanyRoles(workbook),
      rateValidationRules: this.parseRateValidationRules(workbook),
    };
          
          resolve(template);
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private static parseContractVehicles(workbook: XLSX.WorkBook): ContractVehicle[] {
    const sheet = workbook.Sheets['Contract Vehicles'];
    if (!sheet) return [];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    // headers removed - not used in simplified architecture
    const rows = data.slice(1);
    
    return rows
      .filter(row => row[1]) // Filter out empty rows
      .map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        code: row[2] || '',
        description: row[3] || '',
        startDate: row[4] || undefined,
        endDate: row[5] || undefined,
        escalationRate: (row[6] || 0) / 100, // Convert percentage to decimal
        isActive: row[7] === 'TRUE' || row[7] === true,
        createdAt: row[8] || new Date().toISOString(),
        updatedAt: row[9] || new Date().toISOString(),
        createdBy: row[10] || 'import',
      }));
  }

  // parseA6Levels method removed - replaced with Company Roles

  private static parseProjectRoles(workbook: XLSX.WorkBook): ProjectRole[] {
    const sheet = workbook.Sheets['Project Roles'];
    if (!sheet) return [];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const rows = data.slice(1);
    
    return rows
      .filter(row => row[1]) // Filter out empty rows
      .map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        description: row[2] || '',
        typicalClearance: row[3] as 'None' | 'Public Trust' | 'Secret' | 'Top Secret',
        typicalHours: parseInt(row[4]) || 2080,
        isActive: row[5] === 'TRUE' || row[5] === true,
        createdAt: row[6] || new Date().toISOString(),
        updatedAt: row[7] || new Date().toISOString(),
        createdBy: row[8] || 'import',
      }));
  }

  private static parseLCATs(workbook: XLSX.WorkBook): LCAT[] {
    const sheet = workbook.Sheets['LCATs'];
    if (!sheet) return [];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const rows = data.slice(1);
    
    return rows
      .filter(row => row[2]) // Filter out empty rows (must have name)
      .map(row => ({
        id: row[0] || '',
        vehicle: row[1] || '',
        name: row[2] || '',
        code: row[3] || '',
        description: row[4] || '',
        rate: parseFloat(row[5]) || 0,
        isActive: row[6] === 'TRUE' || row[6] === true,
        createdAt: row[7] || new Date().toISOString(),
        updatedAt: row[8] || new Date().toISOString(),
        createdBy: row[9] || 'import',
      }));
  }

  private static parseCompanyRoles(workbook: XLSX.WorkBook): CompanyRole[] {
    const sheet = workbook.Sheets['Agile Six Roles'];
    if (!sheet) return [];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const rows = data.slice(1);
    
    return rows
      .filter(row => row[1]) // Filter out empty rows
      .map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        practiceArea: row[2] || '',
        description: row[3] || '',
        payBand: parseFloat(row[4]) || 0, // Parse as dollar amount
        rateIncrease: parseFloat(row[5]) || 0, // Parse as decimal (not percentage)
        isActive: row[6] === 'TRUE' || row[6] === true,
        createdAt: row[7] || new Date().toISOString(),
        updatedAt: row[8] || new Date().toISOString(),
        createdBy: row[9] || 'import',
      }));
  }

  // parseThreeWayMappings method removed - simplified architecture

  private static parseRateValidationRules(workbook: XLSX.WorkBook): RateValidationRule[] {
    const sheet = workbook.Sheets['Rate Validation Rules'];
    if (!sheet) return [];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const rows = data.slice(1);
    
    return rows
      .filter(row => row[1]) // Filter out empty rows (must have Company Role ID)
      .map(row => ({
        id: row[0] || '',
        companyRoleId: row[1] || '',
        contractVehicleId: row[2] || undefined,
        projectId: row[3] || undefined,
        minRate: parseFloat(row[4]) || 0,
        maxRate: parseFloat(row[5]) || 0,
        typicalRate: parseFloat(row[6]) || 0,
        maxEscalationRate: row[7] ? parseFloat(row[7]) / 100 : 0.05,
        minEscalationRate: row[8] ? parseFloat(row[8]) / 100 : 0,
        isActive: row[9] === 'TRUE' || row[9] === true,
        createdAt: row[10] || new Date().toISOString(),
        updatedAt: row[11] || new Date().toISOString(),
        createdBy: row[12] || 'import',
      }));
  }

  /**
   * Export template data to Excel
   */
  static exportTemplate(template: ImportTemplate): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    // Export each section to its own sheet
    if (template.contractVehicles.length > 0) {
      const contractVehiclesSheet = XLSX.utils.json_to_sheet(template.contractVehicles);
      XLSX.utils.book_append_sheet(workbook, contractVehiclesSheet, 'Contract Vehicles');
    }

    // A6 Levels sheet removed - replaced with Company Roles

    if (template.projectRoles.length > 0) {
      const projectRolesSheet = XLSX.utils.json_to_sheet(template.projectRoles);
      XLSX.utils.book_append_sheet(workbook, projectRolesSheet, 'Project Roles');
    }

    if (template.lcats.length > 0) {
      const lcatsSheet = XLSX.utils.json_to_sheet(template.lcats);
      XLSX.utils.book_append_sheet(workbook, lcatsSheet, 'LCATs');
    }

    if (template.companyRoles.length > 0) {
      const companyRolesSheet = XLSX.utils.json_to_sheet(template.companyRoles);
      XLSX.utils.book_append_sheet(workbook, companyRolesSheet, companyConfigService.getLabels().companyRoles);
    }

    // Three-Way Mappings sheet removed - simplified architecture

    if (template.rateValidationRules.length > 0) {
      const rateValidationRulesSheet = XLSX.utils.json_to_sheet(template.rateValidationRules);
      XLSX.utils.book_append_sheet(workbook, rateValidationRulesSheet, 'Rate Validation Rules');
    }

    return workbook;
  }

  /**
   * Download template as Excel file
   */
  static downloadTemplate(): void {
    const workbook = this.generateTemplate();
    const fileName = `LCAT_Mapping_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Download current data as Excel file
   */
  static downloadData(template: ImportTemplate): void {
    const workbook = this.exportTemplate(template);
    const fileName = `LCAT_Mapping_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  }
}

