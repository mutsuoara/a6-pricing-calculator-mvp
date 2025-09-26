/**
 * Export Routes
 * Handles Excel and PDF export functionality
 */

import express from 'express';
import { ExcelExportService, ExcelExportOptions } from '../services/excel-export.service';
import { PricingCalculationService } from '../services/pricing-calculation.service';
import { CalculationInput } from '@pricing-calculator/types';

const router = express.Router();

/**
 * Export calculation results to Excel
 * POST /api/export/excel
 */
router.post('/excel', async (req, res) => {
  try {
    const { calculationInput, options = {} } = req.body;
    
    if (!calculationInput) {
      return res.status(400).json({
        success: false,
        error: 'Calculation input is required'
      });
    }
    
    // Perform calculation
    const calculationResult = PricingCalculationService.calculateProject(calculationInput);
    
    // Export to Excel
    const excelBuffer = await ExcelExportService.exportToExcel(calculationResult, options);
    
    // Set response headers for file download
    const filename = `pricing-calculation-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    // Send Excel file
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export to Excel',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Export calculation results to Excel with specific template
 * POST /api/export/excel/:template
 */
router.post('/excel/:template', async (req, res) => {
  try {
    const { template } = req.params;
    const { calculationInput, options = {} } = req.body;
    
    if (!calculationInput) {
      return res.status(400).json({
        success: false,
        error: 'Calculation input is required'
      });
    }
    
    // Validate template
    const validTemplates = ['basic', 'va-spruce', 'gsa-mas'];
    if (!validTemplates.includes(template)) {
      return res.status(400).json({
        success: false,
        error: `Invalid template. Must be one of: ${validTemplates.join(', ')}`
      });
    }
    
    // Perform calculation
    const calculationResult = PricingCalculationService.calculateProject(calculationInput);
    
    // Set template in options
    const exportOptions: ExcelExportOptions = {
      ...options,
      template: template as 'basic' | 'va-spruce' | 'gsa-mas'
    };
    
    // Export to Excel
    const excelBuffer = await ExcelExportService.exportToExcel(calculationResult, exportOptions);
    
    // Set response headers for file download
    const filename = `pricing-calculation-${template}-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    // Send Excel file
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export to Excel',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get available export templates
 * GET /api/export/templates
 */
router.get('/templates', (req, res) => {
  try {
    const templates = [
      {
        id: 'basic',
        name: 'Basic Template',
        description: 'Standard pricing calculation export with project details and cost breakdown'
      },
      {
        id: 'va-spruce',
        name: 'VA SPRUCE Template',
        description: 'Export format matching VA SPRUCE spreadsheet requirements'
      },
      {
        id: 'gsa-mas',
        name: 'GSA MAS Template',
        description: 'Export format for GSA Multiple Award Schedule contracts'
      }
    ];
    
    res.json({
      success: true,
      data: templates
    });
    
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get export templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
