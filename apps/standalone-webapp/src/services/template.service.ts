/**
 * Template Service
 * Handles Excel template generation and import/export for LCAT mapping data
 */

import * as XLSX from 'xlsx';
import { ImportTemplate, ContractVehicle, A6Level, ProjectRole, SPRUCELCAT, CompanyRole, ThreeWayMapping, RateValidationRule } from '../types/mapping';

export class TemplateService {
  
  /**
   * Generate Excel template with all required sheets and headers
   */
  static generateTemplate(): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    // Contract Vehicles Sheet
    const contractVehiclesData = [
      ['ID', 'Name', 'Code', 'Description', 'Start Date', 'End Date', 'Escalation Rate (%)', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', 'VA SPRUCE', 'VA_SPRUCE', 'VA Software Product and User Experience Contract', '2024-01-01', '2028-12-31', '2.0', 'TRUE', '', '', ''],
      ['', 'GSA MAS', 'GSA_MAS', 'GSA Multiple Award Schedule', '2024-01-01', '2029-12-31', '1.5', 'TRUE', '', '', ''],
    ];
    const contractVehiclesSheet = XLSX.utils.aoa_to_sheet(contractVehiclesData);
    XLSX.utils.book_append_sheet(workbook, contractVehiclesSheet, 'Contract Vehicles');

    // A6 Levels Sheet
    const a6LevelsData = [
      ['ID', 'Name', 'Category', 'Level', 'Description', 'Min Rate', 'Max Rate', 'Typical Rate', 'Clearance Requirements', 'Location Requirements', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', 'Engineering V', 'Engineering', '5', 'Senior Engineering Lead', '180', '250', '200', 'Secret,Top Secret', 'On-site,Hybrid', 'TRUE', '', '', ''],
      ['', 'Engineering III', 'Engineering', '3', 'Mid-level Engineer', '120', '180', '150', 'None,Public Trust,Secret', 'Remote,On-site,Hybrid', 'TRUE', '', '', ''],
      ['', 'Product III', 'Product', '3', 'Senior Product Manager', '140', '200', '170', 'None,Public Trust,Secret', 'Remote,On-site,Hybrid', 'TRUE', '', '', ''],
    ];
    const a6LevelsSheet = XLSX.utils.aoa_to_sheet(a6LevelsData);
    XLSX.utils.book_append_sheet(workbook, a6LevelsSheet, 'A6 Levels');

    // Project Roles Sheet
    const projectRolesData = [
      ['ID', 'Name', 'Description', 'A6 Level ID', 'Typical Clearance', 'Typical Location', 'Typical Hours', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', 'Engineering Lead (KP)', 'Key Personnel Engineering Lead', '', 'Secret', 'On-site', '2080', 'TRUE', '', '', ''],
      ['', 'Lead Product Manager (KP)', 'Key Personnel Product Manager', '', 'Public Trust', 'Hybrid', '2080', 'TRUE', '', '', ''],
    ];
    const projectRolesSheet = XLSX.utils.aoa_to_sheet(projectRolesData);
    XLSX.utils.book_append_sheet(workbook, projectRolesSheet, 'Project Roles');

    // SPRUCE LCATs Sheet
    const spruceLCATsData = [
      ['ID', 'Name', 'Code', 'Description', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', 'Software Engineer', 'SWE', 'Software Engineering position', 'TRUE', '', '', ''],
      ['', 'Product Manager', 'PM', 'Product Management position', 'TRUE', '', '', ''],
    ];
    const spruceLCATsSheet = XLSX.utils.aoa_to_sheet(spruceLCATsData);
    XLSX.utils.book_append_sheet(workbook, spruceLCATsSheet, 'SPRUCE LCATs');

    // Company Roles Sheet
    const companyRolesData = [
      ['ID', 'Name', 'Practice Area', 'Description', 'Pay Band', 'Rate Increase (%)', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', 'Senior Software Engineer', 'Engineering', 'Senior level software engineering role', 'Band 5', '3.0', 'TRUE', '', '', ''],
      ['', 'Lead Product Manager', 'Product', 'Lead product management role', 'Senior Level', '2.5', 'TRUE', '', '', ''],
      ['', 'Principal Data Scientist', 'Data Science', 'Principal level data science role', 'Principal Level', '4.0', 'TRUE', '', '', ''],
      ['', 'Senior UX Designer', 'Design', 'Senior user experience design role', 'Band 4', '2.8', 'TRUE', '', '', ''],
    ];
    const companyRolesSheet = XLSX.utils.aoa_to_sheet(companyRolesData);
    XLSX.utils.book_append_sheet(workbook, companyRolesSheet, 'Company Roles');

    // Three-Way Mappings Sheet
    const threeWayMappingsData = [
      ['ID', 'Contract Vehicle ID', 'Project ID', 'SPRUCE LCAT ID', 'Project Role ID', 'A6 Level ID', 'SPRUCE Rate', 'A6 Minimum Rate', 'Max Subcontractor Rate', 'Project Escalation Rate (%)', 'Project Start Date', 'Project End Date', 'Allow Rate Override', 'Require Approval', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', '', 'cross-benefits', '', '', '', '256.31', '201.63', '149.26', '2.0', '2024-01-01', '2028-12-31', 'TRUE', 'FALSE', 'TRUE', '', '', ''],
    ];
    const threeWayMappingsSheet = XLSX.utils.aoa_to_sheet(threeWayMappingsData);
    XLSX.utils.book_append_sheet(workbook, threeWayMappingsSheet, 'Three-Way Mappings');

    // Rate Validation Rules Sheet
    const rateValidationRulesData = [
      ['ID', 'A6 Level ID', 'Contract Vehicle ID', 'Project ID', 'Min Rate', 'Max Rate', 'Typical Rate', 'Max Escalation Rate (%)', 'Min Escalation Rate (%)', 'Is Active', 'Created At', 'Updated At', 'Created By'],
      ['', '', '', '', '100', '300', '200', '5.0', '0.0', 'TRUE', '', '', ''],
    ];
    const rateValidationRulesSheet = XLSX.utils.aoa_to_sheet(rateValidationRulesData);
    XLSX.utils.book_append_sheet(workbook, rateValidationRulesSheet, 'Rate Validation Rules');

    // Instructions Sheet
    const instructionsData = [
      ['LCAT Mapping Template Instructions'],
      [''],
      ['This template contains 7 sheets for managing LCAT mappings:'],
      [''],
      ['1. Contract Vehicles: Define available contract vehicles (VA SPRUCE, GSA MAS, etc.)'],
      ['2. A6 Levels: Define A6 organizational levels with rate ranges'],
      ['3. Project Roles: Define specific project roles and their A6 level mappings'],
      ['4. SPRUCE LCATs: Define official labor category titles'],
      ['5. Company Roles: Define internal company roles with practice areas and pay bands'],
      ['6. Three-Way Mappings: Connect vehicles, projects, and roles'],
      ['7. Rate Validation Rules: Define rate validation criteria'],
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
            a6Levels: this.parseA6Levels(workbook),
            projectRoles: this.parseProjectRoles(workbook),
            spruceLCATs: this.parseSPRUCELCATs(workbook),
            companyRoles: this.parseCompanyRoles(workbook),
            threeWayMappings: this.parseThreeWayMappings(workbook),
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
    const headers = data[0];
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

  private static parseA6Levels(workbook: XLSX.WorkBook): A6Level[] {
    const sheet = workbook.Sheets['A6 Levels'];
    if (!sheet) return [];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const rows = data.slice(1);
    
    return rows
      .filter(row => row[1]) // Filter out empty rows
      .map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        category: row[2] as 'Engineering' | 'Product' | 'Experience' | 'Management',
        level: parseInt(row[3]) || 1,
        description: row[4] || '',
        rateRange: {
          min: parseFloat(row[5]) || 0,
          max: parseFloat(row[6]) || 0,
          typical: parseFloat(row[7]) || 0,
        },
        clearanceRequirements: (row[8] || '').split(',').map(s => s.trim()).filter(Boolean),
        locationRequirements: (row[9] || '').split(',').map(s => s.trim()).filter(Boolean),
        isActive: row[10] === 'TRUE' || row[10] === true,
        createdAt: row[11] || new Date().toISOString(),
        updatedAt: row[12] || new Date().toISOString(),
        createdBy: row[13] || 'import',
      }));
  }

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
        a6LevelId: row[3] || '',
        typicalClearance: row[4] as 'None' | 'Public Trust' | 'Secret' | 'Top Secret',
        typicalLocation: row[5] as 'Remote' | 'On-site' | 'Hybrid',
        typicalHours: parseInt(row[6]) || 2080,
        isActive: row[7] === 'TRUE' || row[7] === true,
        createdAt: row[8] || new Date().toISOString(),
        updatedAt: row[9] || new Date().toISOString(),
        createdBy: row[10] || 'import',
      }));
  }

  private static parseSPRUCELCATs(workbook: XLSX.WorkBook): SPRUCELCAT[] {
    const sheet = workbook.Sheets['SPRUCE LCATs'];
    if (!sheet) return [];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const rows = data.slice(1);
    
    return rows
      .filter(row => row[1]) // Filter out empty rows
      .map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        code: row[2] || '',
        description: row[3] || '',
        isActive: row[4] === 'TRUE' || row[4] === true,
        createdAt: row[5] || new Date().toISOString(),
        updatedAt: row[6] || new Date().toISOString(),
        createdBy: row[7] || 'import',
      }));
  }

  private static parseCompanyRoles(workbook: XLSX.WorkBook): CompanyRole[] {
    const sheet = workbook.Sheets['Company Roles'];
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
        payBand: row[4] || '',
        rateIncrease: (row[5] || 0) / 100, // Convert percentage to decimal
        isActive: row[6] === 'TRUE' || row[6] === true,
        createdAt: row[7] || new Date().toISOString(),
        updatedAt: row[8] || new Date().toISOString(),
        createdBy: row[9] || 'import',
      }));
  }

  private static parseThreeWayMappings(workbook: XLSX.WorkBook): ThreeWayMapping[] {
    const sheet = workbook.Sheets['Three-Way Mappings'];
    if (!sheet) return [];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const rows = data.slice(1);
    
    return rows
      .filter(row => row[2]) // Filter out empty rows (must have project ID)
      .map(row => ({
        id: row[0] || '',
        contractVehicleId: row[1] || '',
        projectId: row[2] || '',
        spruceLCATId: row[3] || '',
        projectRoleId: row[4] || '',
        a6LevelId: row[5] || '',
        spruceRate: parseFloat(row[6]) || 0,
        a6MinimumRate: parseFloat(row[7]) || 0,
        maxSubcontractorRate: parseFloat(row[8]) || undefined,
        projectEscalationRate: row[9] ? parseFloat(row[9]) / 100 : undefined,
        projectStartDate: row[10] || undefined,
        projectEndDate: row[11] || undefined,
        allowRateOverride: row[12] === 'TRUE' || row[12] === true,
        requireApproval: row[13] === 'TRUE' || row[13] === true,
        isActive: row[14] === 'TRUE' || row[14] === true,
        createdAt: row[15] || new Date().toISOString(),
        updatedAt: row[16] || new Date().toISOString(),
        createdBy: row[17] || 'import',
      }));
  }

  private static parseRateValidationRules(workbook: XLSX.WorkBook): RateValidationRule[] {
    const sheet = workbook.Sheets['Rate Validation Rules'];
    if (!sheet) return [];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const rows = data.slice(1);
    
    return rows
      .filter(row => row[1]) // Filter out empty rows (must have A6 Level ID)
      .map(row => ({
        id: row[0] || '',
        a6LevelId: row[1] || '',
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

    if (template.a6Levels.length > 0) {
      const a6LevelsSheet = XLSX.utils.json_to_sheet(template.a6Levels);
      XLSX.utils.book_append_sheet(workbook, a6LevelsSheet, 'A6 Levels');
    }

    if (template.projectRoles.length > 0) {
      const projectRolesSheet = XLSX.utils.json_to_sheet(template.projectRoles);
      XLSX.utils.book_append_sheet(workbook, projectRolesSheet, 'Project Roles');
    }

    if (template.spruceLCATs.length > 0) {
      const spruceLCATsSheet = XLSX.utils.json_to_sheet(template.spruceLCATs);
      XLSX.utils.book_append_sheet(workbook, spruceLCATsSheet, 'SPRUCE LCATs');
    }

    if (template.companyRoles.length > 0) {
      const companyRolesSheet = XLSX.utils.json_to_sheet(template.companyRoles);
      XLSX.utils.book_append_sheet(workbook, companyRolesSheet, 'Company Roles');
    }

    if (template.threeWayMappings.length > 0) {
      const threeWayMappingsSheet = XLSX.utils.json_to_sheet(template.threeWayMappings);
      XLSX.utils.book_append_sheet(workbook, threeWayMappingsSheet, 'Three-Way Mappings');
    }

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

