/**
 * System Settings Routes
 * Provides endpoints for managing global system settings
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SystemSettings } from '../models';

const router = express.Router();

/**
 * Get system settings
 */
router.get('/', async (req, res) => {
  try {
    // For now, use a default tenant ID. In real app, get from auth context
    const tenantId = 'default-tenant';
    
    let settings = await SystemSettings.findOne({
      where: { tenantId }
    });

    // If no settings exist, create default ones
    if (!settings) {
      settings = await SystemSettings.create({
        tenantId,
        wrapRate: 87.5,
        minimumProfitRate: 7.53,
        version: 1,
        createdBy: uuidv4(), // In real app, get from auth context
        updatedBy: uuidv4(), // In real app, get from auth context
      });
    }

    res.json({
      success: true,
      settings: {
        wrapRate: settings.wrapRate,
        minimumProfitRate: settings.minimumProfitRate,
        version: settings.version,
      },
      message: 'System settings retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve system settings'
    });
  }
});

/**
 * Update system settings
 */
router.put('/', async (req, res) => {
  try {
    const { wrapRate, minimumProfitRate } = req.body;
    
    // For now, use a default tenant ID. In real app, get from auth context
    const tenantId = 'default-tenant';
    
    let settings = await SystemSettings.findOne({
      where: { tenantId }
    });

    if (!settings) {
      // Create new settings if they don't exist
      settings = await SystemSettings.create({
        tenantId,
        wrapRate: wrapRate ?? 87.5,
        minimumProfitRate: minimumProfitRate ?? 7.53,
        version: 1,
        createdBy: uuidv4(), // In real app, get from auth context
        updatedBy: uuidv4(), // In real app, get from auth context
      });
    } else {
      // Update existing settings
      const updateData: any = {
        updatedBy: uuidv4(), // In real app, get from auth context
        updatedAt: new Date()
      };

      if (wrapRate !== undefined) updateData.wrapRate = wrapRate;
      if (minimumProfitRate !== undefined) updateData.minimumProfitRate = minimumProfitRate;
      if (wrapRate !== undefined || minimumProfitRate !== undefined) {
        updateData.version = settings.version + 1;
      }

      await settings.update(updateData);
    }

    res.json({
      success: true,
      settings: {
        wrapRate: settings.wrapRate,
        minimumProfitRate: settings.minimumProfitRate,
        version: settings.version,
      },
      message: 'System settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to update system settings'
    });
  }
});

/**
 * Calculate wrap amount
 */
router.post('/calculate-wrap', async (req, res) => {
  try {
    const { annualSalary } = req.body;
    
    if (annualSalary === undefined || annualSalary === null) {
      return res.status(400).json({
        success: false,
        error: 'Annual salary is required',
        message: 'Please provide an annual salary value'
      });
    }

    // For now, use a default tenant ID. In real app, get from auth context
    const tenantId = 'default-tenant';
    
    let settings = await SystemSettings.findOne({
      where: { tenantId }
    });

    if (!settings) {
      settings = await SystemSettings.create({
        tenantId,
        wrapRate: 87.5,
        minimumProfitRate: 7.53,
        version: 1,
        createdBy: uuidv4(),
        updatedBy: uuidv4(),
      });
    }

    const wrapAmount = settings.calculateWrapAmount(annualSalary);

    res.json({
      success: true,
      wrapAmount,
      wrapRate: settings.wrapRate,
      annualSalary,
      message: 'Wrap amount calculated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to calculate wrap amount'
    });
  }
});

/**
 * Calculate minimum profit amount
 */
router.post('/calculate-minimum-profit', async (req, res) => {
  try {
    const { annualSalary, wrapAmount } = req.body;
    
    if (annualSalary === undefined || annualSalary === null) {
      return res.status(400).json({
        success: false,
        error: 'Annual salary is required',
        message: 'Please provide an annual salary value'
      });
    }

    if (wrapAmount === undefined || wrapAmount === null) {
      return res.status(400).json({
        success: false,
        error: 'Wrap amount is required',
        message: 'Please provide a wrap amount value'
      });
    }

    // For now, use a default tenant ID. In real app, get from auth context
    const tenantId = 'default-tenant';
    
    let settings = await SystemSettings.findOne({
      where: { tenantId }
    });

    if (!settings) {
      settings = await SystemSettings.create({
        tenantId,
        wrapRate: 87.5,
        minimumProfitRate: 7.53,
        version: 1,
        createdBy: uuidv4(),
        updatedBy: uuidv4(),
      });
    }

    const minimumProfitAmount = settings.calculateMinimumProfitAmount(annualSalary, wrapAmount);

    res.json({
      success: true,
      minimumProfitAmount,
      minimumProfitRate: settings.minimumProfitRate,
      annualSalary,
      wrapAmount,
      message: 'Minimum profit amount calculated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to calculate minimum profit amount'
    });
  }
});

export default router;


