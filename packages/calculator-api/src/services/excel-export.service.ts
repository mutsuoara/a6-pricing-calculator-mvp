/**
 * Excel Export Service
 * Handles exporting pricing calculations to Excel format
 */

import ExcelJS from 'exceljs';
import { CalculationResult, PricingSettings, LaborCategoryResult, OtherDirectCostResult } from '@pricing-calculator/types';

export interface ExcelExportOptions {
  projectName?: string;
  contractVehicle?: string;
  includeFormulas?: boolean;
  template?: 'basic' | 'va-spruce' | 'gsa-mas';
}

export class ExcelExportService {
  /**
   * Export calculation results to Excel format
   */
  static async exportToExcel(
    calculationResult: CalculationResult,
    options: ExcelExportOptions = {}
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = 'Agile6 Pricing Calculator';
    workbook.lastModifiedBy = 'Agile6 Pricing Calculator';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Create main calculation sheet
    const mainSheet = workbook.addWorksheet('Pricing Calculation');
    this.addMainCalculationSheet(mainSheet, calculationResult, options);
    
    // Create labor categories sheet
    const laborSheet = workbook.addWorksheet('Labor Categories');
    this.addLaborCategoriesSheet(laborSheet, calculationResult.laborCategories);
    
    // Create ODC sheet if there are other direct costs
    if (calculationResult.otherDirectCosts && calculationResult.otherDirectCosts.length > 0) {
      const odcSheet = workbook.addWorksheet('Other Direct Costs');
      this.addOtherDirectCostsSheet(odcSheet, calculationResult.otherDirectCosts);
    }
    
    // Create summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    this.addSummarySheet(summarySheet, calculationResult, options);
    
    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
  
  /**
   * Add main calculation sheet with project details and totals
   */
  private static addMainCalculationSheet(
    worksheet: ExcelJS.Worksheet,
    result: CalculationResult,
    options: ExcelExportOptions
  ): void {
    // Set column widths
    worksheet.getColumn('A').width = 25;
    worksheet.getColumn('B').width = 20;
    worksheet.getColumn('C').width = 15;
    worksheet.getColumn('D').width = 15;
    
    // Project header
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = options.projectName || 'Pricing Calculation';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Contract vehicle
    if (options.contractVehicle) {
      worksheet.mergeCells('A2:D2');
      worksheet.getCell('A2').value = `Contract Vehicle: ${options.contractVehicle}`;
      worksheet.getCell('A2').font = { bold: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center' };
    }
    
    // Calculation date
    worksheet.mergeCells('A3:D3');
    worksheet.getCell('A3').value = `Calculated: ${new Date(result.calculatedAt).toLocaleDateString()}`;
    worksheet.getCell('A3').alignment = { horizontal: 'center' };
    
    // Empty row
    worksheet.getRow(4).height = 10;
    
    // Project settings
    worksheet.getCell('A5').value = 'Project Settings';
    worksheet.getCell('A5').font = { bold: true, size: 14 };
    
    const settings = result.settings;
    worksheet.getCell('A6').value = 'Overhead Rate:';
    worksheet.getCell('B6').value = `${(settings.overheadRate * 100).toFixed(1)}%`;
    
    worksheet.getCell('A7').value = 'G&A Rate:';
    worksheet.getCell('B7').value = `${(settings.gaRate * 100).toFixed(1)}%`;
    
    worksheet.getCell('A8').value = 'Fee Rate:';
    worksheet.getCell('B8').value = `${(settings.feeRate * 100).toFixed(1)}%`;
    
    worksheet.getCell('A9').value = 'Contract Type:';
    worksheet.getCell('B9').value = settings.contractType;
    
    worksheet.getCell('A10').value = 'Location Type:';
    worksheet.getCell('B10').value = settings.locationType;
    
    // Empty row
    worksheet.getRow(11).height = 10;
    
    // Cost summary
    worksheet.getCell('A12').value = 'Cost Summary';
    worksheet.getCell('A12').font = { bold: true, size: 14 };
    
    worksheet.getCell('A13').value = 'Total Labor Cost:';
    worksheet.getCell('B13').value = result.totals.laborCost;
    worksheet.getCell('B13').numFmt = '$#,##0.00';
    
    worksheet.getCell('A14').value = 'Total ODC Cost:';
    worksheet.getCell('B14').value = result.totals.odcCost;
    worksheet.getCell('B14').numFmt = '$#,##0.00';
    
    worksheet.getCell('A15').value = 'Total Project Cost:';
    worksheet.getCell('B15').value = result.totals.totalCost;
    worksheet.getCell('B15').font = { bold: true };
    worksheet.getCell('B15').numFmt = '$#,##0.00';
    
    worksheet.getCell('A16').value = 'Total Effective Hours:';
    worksheet.getCell('B16').value = result.totals.totalEffectiveHours;
    worksheet.getCell('B16').numFmt = '#,##0';
    
    worksheet.getCell('A17').value = 'Average Burdened Rate:';
    worksheet.getCell('B17').value = result.totals.averageBurdenedRate;
    worksheet.getCell('B17').numFmt = '$#,##0.00';
    
    // Add borders to summary section
    const summaryRange = 'A12:B17';
    worksheet.getCell(summaryRange).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }
  
  /**
   * Add labor categories sheet with detailed breakdown
   */
  private static addLaborCategoriesSheet(
    worksheet: ExcelJS.Worksheet,
    laborCategories: LaborCategoryResult[]
  ): void {
    // Set column widths
    worksheet.getColumn('A').width = 30;
    worksheet.getColumn('B').width = 15;
    worksheet.getColumn('C').width = 15;
    worksheet.getColumn('D').width = 15;
    worksheet.getColumn('E').width = 15;
    worksheet.getColumn('F').width = 15;
    worksheet.getColumn('G').width = 15;
    worksheet.getColumn('H').width = 15;
    worksheet.getColumn('I').width = 15;
    
    // Headers
    const headers = [
      'Title',
      'Base Rate',
      'Hours',
      'FTE %',
      'Effective Hours',
      'Clearance Premium',
      'Burdened Rate',
      'Total Cost',
      'Clearance Level'
    ];
    
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(1, index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Data rows
    laborCategories.forEach((lc, rowIndex) => {
      const row = rowIndex + 2;
      
      worksheet.getCell(row, 1).value = lc.title;
      worksheet.getCell(row, 2).value = lc.baseRate;
      worksheet.getCell(row, 2).numFmt = '$#,##0.00';
      worksheet.getCell(row, 3).value = lc.hours;
      worksheet.getCell(row, 4).value = lc.ftePercentage;
      worksheet.getCell(row, 4).numFmt = '0.0%';
      worksheet.getCell(row, 5).value = lc.effectiveHours;
      worksheet.getCell(row, 5).numFmt = '#,##0';
      worksheet.getCell(row, 6).value = lc.clearancePremium;
      worksheet.getCell(row, 6).numFmt = '0.0%';
      worksheet.getCell(row, 7).value = lc.burdenedRate;
      worksheet.getCell(row, 7).numFmt = '$#,##0.00';
      worksheet.getCell(row, 8).value = lc.totalCost;
      worksheet.getCell(row, 8).numFmt = '$#,##0.00';
      worksheet.getCell(row, 9).value = lc.clearanceLevel;
      
      // Add borders to data rows
      for (let col = 1; col <= 9; col++) {
        worksheet.getCell(row, col).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });
    
    // Add total row
    const totalRow = laborCategories.length + 2;
    worksheet.getCell(totalRow, 1).value = 'TOTAL';
    worksheet.getCell(totalRow, 1).font = { bold: true };
    
    // Sum formulas for totals
    worksheet.getCell(totalRow, 2).value = { formula: `SUM(B2:B${totalRow - 1})` };
    worksheet.getCell(totalRow, 2).numFmt = '$#,##0.00';
    worksheet.getCell(totalRow, 5).value = { formula: `SUM(E2:E${totalRow - 1})` };
    worksheet.getCell(totalRow, 5).numFmt = '#,##0';
    worksheet.getCell(totalRow, 8).value = { formula: `SUM(H2:H${totalRow - 1})` };
    worksheet.getCell(totalRow, 8).numFmt = '$#,##0.00';
    worksheet.getCell(totalRow, 8).font = { bold: true };
    
    // Add borders to total row
    for (let col = 1; col <= 9; col++) {
      worksheet.getCell(totalRow, col).border = {
        top: { style: 'medium' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }
  
  /**
   * Add other direct costs sheet
   */
  private static addOtherDirectCostsSheet(
    worksheet: ExcelJS.Worksheet,
    otherDirectCosts: OtherDirectCostResult[]
  ): void {
    // Set column widths
    worksheet.getColumn('A').width = 30;
    worksheet.getColumn('B').width = 15;
    worksheet.getColumn('C').width = 15;
    worksheet.getColumn('D').width = 15;
    worksheet.getColumn('E').width = 15;
    worksheet.getColumn('F').width = 20;
    
    // Headers
    const headers = [
      'Description',
      'Amount',
      'Tax Rate',
      'Tax Amount',
      'Total Amount',
      'Category'
    ];
    
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(1, index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Data rows
    otherDirectCosts.forEach((odc, rowIndex) => {
      const row = rowIndex + 2;
      
      worksheet.getCell(row, 1).value = odc.description;
      worksheet.getCell(row, 2).value = odc.amount;
      worksheet.getCell(row, 2).numFmt = '$#,##0.00';
      worksheet.getCell(row, 3).value = odc.taxRate;
      worksheet.getCell(row, 3).numFmt = '0.0%';
      worksheet.getCell(row, 4).value = odc.taxAmount || 0;
      worksheet.getCell(row, 4).numFmt = '$#,##0.00';
      worksheet.getCell(row, 5).value = odc.totalAmount || 0;
      worksheet.getCell(row, 5).numFmt = '$#,##0.00';
      worksheet.getCell(row, 6).value = odc.category;
      
      // Add borders to data rows
      for (let col = 1; col <= 6; col++) {
        worksheet.getCell(row, col).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });
    
    // Add total row
    const totalRow = otherDirectCosts.length + 2;
    worksheet.getCell(totalRow, 1).value = 'TOTAL';
    worksheet.getCell(totalRow, 1).font = { bold: true };
    
    // Sum formulas for totals
    worksheet.getCell(totalRow, 2).value = { formula: `SUM(B2:B${totalRow - 1})` };
    worksheet.getCell(totalRow, 2).numFmt = '$#,##0.00';
    worksheet.getCell(totalRow, 4).value = { formula: `SUM(D2:D${totalRow - 1})` };
    worksheet.getCell(totalRow, 4).numFmt = '$#,##0.00';
    worksheet.getCell(totalRow, 5).value = { formula: `SUM(E2:E${totalRow - 1})` };
    worksheet.getCell(totalRow, 5).numFmt = '$#,##0.00';
    worksheet.getCell(totalRow, 5).font = { bold: true };
    
    // Add borders to total row
    for (let col = 1; col <= 6; col++) {
      worksheet.getCell(totalRow, col).border = {
        top: { style: 'medium' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }
  
  /**
   * Add summary sheet with key metrics
   */
  private static addSummarySheet(
    worksheet: ExcelJS.Worksheet,
    result: CalculationResult,
    options: ExcelExportOptions
  ): void {
    // Set column widths
    worksheet.getColumn('A').width = 25;
    worksheet.getColumn('B').width = 20;
    
    // Title
    worksheet.getCell('A1').value = 'Pricing Summary';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    
    // Project details
    worksheet.getCell('A3').value = 'Project Name:';
    worksheet.getCell('B3').value = options.projectName || 'Unnamed Project';
    
    worksheet.getCell('A4').value = 'Contract Vehicle:';
    worksheet.getCell('B4').value = options.contractVehicle || 'Not specified';
    
    worksheet.getCell('A5').value = 'Calculation Date:';
    worksheet.getCell('B5').value = new Date(result.calculatedAt).toLocaleDateString();
    
    // Empty row
    worksheet.getRow(6).height = 10;
    
    // Cost breakdown
    worksheet.getCell('A7').value = 'Cost Breakdown';
    worksheet.getCell('A7').font = { bold: true, size: 14 };
    
    worksheet.getCell('A8').value = 'Labor Categories:';
    worksheet.getCell('B8').value = result.laborCategories.length;
    
    worksheet.getCell('A9').value = 'Total Labor Cost:';
    worksheet.getCell('B9').value = result.totals.laborCost;
    worksheet.getCell('B9').numFmt = '$#,##0.00';
    
    worksheet.getCell('A10').value = 'Other Direct Costs:';
    worksheet.getCell('B10').value = result.otherDirectCosts?.length || 0;
    
    worksheet.getCell('A11').value = 'Total ODC Cost:';
    worksheet.getCell('B11').value = result.totals.odcCost;
    worksheet.getCell('B11').numFmt = '$#,##0.00';
    
    worksheet.getCell('A12').value = 'Total Project Cost:';
    worksheet.getCell('B12').value = result.totals.totalCost;
    worksheet.getCell('B12').font = { bold: true };
    worksheet.getCell('B12').numFmt = '$#,##0.00';
    
    // Empty row
    worksheet.getRow(13).height = 10;
    
    // Labor metrics
    worksheet.getCell('A14').value = 'Labor Metrics';
    worksheet.getCell('A14').font = { bold: true, size: 14 };
    
    worksheet.getCell('A15').value = 'Total Hours:';
    worksheet.getCell('B15').value = result.totals.totalEffectiveHours;
    worksheet.getCell('B15').numFmt = '#,##0';
    
    worksheet.getCell('A16').value = 'Average Burdened Rate:';
    worksheet.getCell('B16').value = result.totals.averageBurdenedRate;
    worksheet.getCell('B16').numFmt = '$#,##0.00';
    
    // Settings
    worksheet.getCell('A18').value = 'Project Settings';
    worksheet.getCell('A18').font = { bold: true, size: 14 };
    
    const settings = result.settings;
    worksheet.getCell('A19').value = 'Overhead Rate:';
    worksheet.getCell('B19').value = `${(settings.overheadRate * 100).toFixed(1)}%`;
    
    worksheet.getCell('A20').value = 'G&A Rate:';
    worksheet.getCell('B20').value = `${(settings.gaRate * 100).toFixed(1)}%`;
    
    worksheet.getCell('A21').value = 'Fee Rate:';
    worksheet.getCell('B21').value = `${(settings.feeRate * 100).toFixed(1)}%`;
    
    worksheet.getCell('A22').value = 'Contract Type:';
    worksheet.getCell('B22').value = settings.contractType;
    
    worksheet.getCell('A23').value = 'Location Type:';
    worksheet.getCell('B23').value = settings.locationType;
  }
}
