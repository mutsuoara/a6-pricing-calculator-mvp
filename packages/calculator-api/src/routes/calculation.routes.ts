/**
 * Calculation routes
 * Provides endpoints for pricing calculations, scenario comparisons, and exports
 */

import express from 'express';
import { PricingCalculationService, CalculationInput, ScenarioInput } from '../services/pricing-calculation.service';

const router = express.Router();

/**
 * Calculate project pricing
 */
router.post('/calculate', async (req, res) => {
  try {
    const input: CalculationInput = req.body;
    
    const result = PricingCalculationService.calculateProject(input);
    
    return res.json({
      success: true,
      result,
      message: 'Calculation completed successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Calculation failed'
    });
  }
});

/**
 * Calculate individual labor category
 */
router.post('/calculate-labor-category', async (req, res) => {
  try {
    const { laborCategory, settings } = req.body;
    
    if (!laborCategory || !settings) {
      return res.status(400).json({
        success: false,
        error: 'Labor category and settings are required'
      });
    }
    
    const result = PricingCalculationService.calculateLaborCategory(laborCategory, settings);
    
    return res.json({
      success: true,
      result,
      message: 'Labor category calculation completed successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Labor category calculation failed'
    });
  }
});

/**
 * Calculate other direct cost
 */
router.post('/calculate-odc', async (req, res) => {
  try {
    const { otherDirectCost } = req.body;
    
    if (!otherDirectCost) {
      return res.status(400).json({
        success: false,
        error: 'Other direct cost data is required'
      });
    }
    
    const result = PricingCalculationService.calculateOtherDirectCost(otherDirectCost);
    
    return res.json({
      success: true,
      result,
      message: 'Other direct cost calculation completed successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Other direct cost calculation failed'
    });
  }
});

/**
 * Compare multiple scenarios
 */
router.post('/compare-scenarios', async (req, res) => {
  try {
    const { scenarios }: { scenarios: ScenarioInput[] } = req.body;
    
    if (!scenarios || scenarios.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 scenarios are required for comparison'
      });
    }
    
    const result = PricingCalculationService.compareScenarios(scenarios);
    
    return res.json({
      success: true,
      result,
      message: 'Scenario comparison completed successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Scenario comparison failed'
    });
  }
});

/**
 * Validate calculation input
 */
router.post('/validate', async (req, res) => {
  try {
    const input: CalculationInput = req.body;
    
    const errors = PricingCalculationService.validateCalculationInput(input);
    
    return res.json({
      success: true,
      valid: errors.length === 0,
      errors,
      message: errors.length === 0 ? 'Input is valid' : 'Input validation failed'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Validation failed'
    });
  }
});

/**
 * Generate Excel export data
 */
router.post('/export/excel', async (req, res) => {
  try {
    const { result } = req.body;
    
    if (!result) {
      return res.status(400).json({
        success: false,
        error: 'Calculation result is required for export'
      });
    }
    
    const exportData = PricingCalculationService.generateExcelExportData(result);
    
    return res.json({
      success: true,
      exportData,
      message: 'Excel export data generated successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Export generation failed'
    });
  }
});

/**
 * Calculate burden rate for given parameters
 */
router.post('/burden-rate', async (req, res) => {
  try {
    const { baseRate, clearanceLevel, settings } = req.body;
    
    if (baseRate === undefined || !clearanceLevel || !settings) {
      return res.status(400).json({
        success: false,
        error: 'Base rate, clearance level, and settings are required'
      });
    }
    
    const burdenRate = PricingCalculationService.calculateBurdenRate(baseRate, clearanceLevel, settings);
    
    return res.json({
      success: true,
      burdenRate,
      message: 'Burden rate calculated successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Burden rate calculation failed'
    });
  }
});

/**
 * Calculate effective hours
 */
router.post('/effective-hours', async (req, res) => {
  try {
    const { hours, ftePercentage } = req.body;
    
    if (hours === undefined || ftePercentage === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Hours and FTE percentage are required'
      });
    }
    
    const effectiveHours = PricingCalculationService.calculateEffectiveHours(hours, ftePercentage);
    
    return res.json({
      success: true,
      effectiveHours,
      message: 'Effective hours calculated successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Effective hours calculation failed'
    });
  }
});

/**
 * Get clearance premium percentage
 */
router.get('/clearance-premium/:level', async (req, res) => {
  try {
    const { level } = req.params;
    
    if (!level || !['None', 'Public Trust', 'Secret', 'Top Secret'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid clearance level'
      });
    }
    
    const premium = PricingCalculationService.calculateClearancePremium(level as any);
    
    return res.json({
      success: true,
      clearanceLevel: level,
      premium,
      message: 'Clearance premium retrieved successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Clearance premium retrieval failed'
    });
  }
});

export default router;
