/**
 * Pricing calculation routes
 * Provides endpoints to test and interact with pricing models
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PricingProject, LaborCategory, OtherDirectCost } from '../models';
import { PricingSettings, LaborCategory as LaborCategoryType, OtherDirectCost as OtherDirectCostType } from '@pricing-calculator/types';

const router = express.Router();

/**
 * Create a test pricing project
 */
router.post('/test-project', async (req, res) => {
  try {
    const testProject = await PricingProject.create({
      tenantId: uuidv4(),
      name: 'Test Pricing Project',
      description: 'A test project to validate pricing models',
      settings: PricingProject.getDefaultSettings(),
      createdBy: uuidv4(),
      updatedBy: uuidv4(),
    });

    res.json({
      success: true,
      project: testProject,
      message: 'Test project created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create test project'
    });
  }
});

/**
 * Create test labor categories
 */
router.post('/test-labor-categories', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }

    const testLaborCategories = [
      {
        tenantId: uuidv4(),
        projectId,
        title: 'Senior Software Engineer',
        baseRate: 85.00,
        hours: 2080,
        ftePercentage: 100,
        clearanceLevel: 'Secret' as const,
        location: 'On-site' as const,
      },
      {
        tenantId: uuidv4(),
        projectId,
        title: 'Project Manager',
        baseRate: 95.00,
        hours: 2080,
        ftePercentage: 100,
        clearanceLevel: 'Public Trust' as const,
        location: 'Hybrid' as const,
      },
      {
        tenantId: uuidv4(),
        projectId,
        title: 'Business Analyst',
        baseRate: 75.00,
        hours: 1040,
        ftePercentage: 50,
        clearanceLevel: 'None' as const,
        location: 'Remote' as const,
      }
    ];

    const createdCategories = [];
    for (const categoryData of testLaborCategories) {
      const category = await LaborCategory.create(categoryData);
      createdCategories.push(category);
    }

    res.json({
      success: true,
      laborCategories: createdCategories,
      message: 'Test labor categories created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create test labor categories'
    });
  }
});

/**
 * Create test other direct costs
 */
router.post('/test-odc', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }

    const testODC = [
      {
        tenantId: uuidv4(),
        projectId,
        description: 'Travel to client site',
        amount: 2500.00,
        category: 'Travel' as const,
        taxable: true,
        taxRate: 0.08,
      },
      {
        tenantId: uuidv4(),
        projectId,
        description: 'Development software licenses',
        amount: 5000.00,
        category: 'Software' as const,
        taxable: false,
        taxRate: 0.08,
      },
      {
        tenantId: uuidv4(),
        projectId,
        description: 'Office equipment',
        amount: 1500.00,
        category: 'Equipment' as const,
        taxable: true,
        taxRate: 0.08,
      }
    ];

    const createdODC = [];
    for (const odcData of testODC) {
      const odc = await OtherDirectCost.create(odcData);
      createdODC.push(odc);
    }

    res.json({
      success: true,
      otherDirectCosts: createdODC,
      message: 'Test other direct costs created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create test other direct costs'
    });
  }
});

/**
 * Calculate pricing for a project
 */
router.get('/calculate/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get project with settings
    const project = await PricingProject.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Get labor categories
    const laborCategories = await LaborCategory.findAll({
      where: { projectId }
    });

    // Get other direct costs
    const otherDirectCosts = await OtherDirectCost.findAll({
      where: { projectId }
    });

    // Calculate totals
    const settings = project.settings;
    let totalLaborCost = 0;
    let totalODCCost = 0;
    let totalEffectiveHours = 0;

    const laborResults = laborCategories.map(lc => {
      const effectiveHours = lc.calculateEffectiveHours();
      const clearanceAdjustedRate = lc.getClearanceAdjustedRate();
      const burdenedRate = lc.calculateBurdenedRate(
        settings.overheadRate,
        settings.gaRate,
        settings.feeRate
      );
      const totalCost = burdenedRate * effectiveHours;

      totalLaborCost += totalCost;
      totalEffectiveHours += effectiveHours;

      return {
        id: lc.id,
        title: lc.title,
        baseRate: lc.baseRate,
        hours: lc.hours,
        ftePercentage: lc.ftePercentage,
        effectiveHours,
        clearanceLevel: lc.clearanceLevel,
        location: lc.location,
        clearancePremium: lc.getClearancePremium(),
        clearanceAdjustedRate,
        overheadAmount: clearanceAdjustedRate * settings.overheadRate * effectiveHours,
        overheadRate: settings.overheadRate,
        gaAmount: clearanceAdjustedRate * (1 + settings.overheadRate) * settings.gaRate * effectiveHours,
        gaRate: settings.gaRate,
        feeAmount: clearanceAdjustedRate * (1 + settings.overheadRate) * (1 + settings.gaRate) * settings.feeRate * effectiveHours,
        feeRate: settings.feeRate,
        totalCost,
        burdenedRate,
      };
    });

    const odcResults = otherDirectCosts.map(odc => {
      const taxAmount = Number(odc.calculateTaxAmount());
      const totalAmount = Number(odc.calculateTotalAmount());
      
      totalODCCost += totalAmount;

      return {
        id: odc.id,
        description: odc.description,
        amount: Number(odc.amount),
        category: odc.category,
        taxable: odc.taxable,
        taxAmount,
        totalAmount,
      };
    });

    const totalProjectCost = totalLaborCost + totalODCCost;
    const averageBurdenedRate = totalEffectiveHours > 0 ? totalLaborCost / totalEffectiveHours : 0;

    res.json({
      success: true,
      calculation: {
        laborCategories: laborResults,
        otherDirectCosts: odcResults,
        totals: {
          totalLaborCost,
          totalODCCost,
          totalProjectCost,
          totalEffectiveHours,
          averageBurdenedRate,
        },
        settings,
      },
      message: 'Calculation completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to calculate pricing'
    });
  }
});

/**
 * Get all projects
 */
router.get('/projects', async (req, res) => {
  try {
    const projects = await PricingProject.findAll({
      include: [
        { model: LaborCategory, as: 'laborCategories' },
        { model: OtherDirectCost, as: 'otherDirectCosts' }
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      success: true,
      projects,
      message: 'Projects retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve projects'
    });
  }
});

/**
 * Get a specific project by ID
 */
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await PricingProject.findByPk(id, {
      include: [
        { model: LaborCategory, as: 'laborCategories' },
        { model: OtherDirectCost, as: 'otherDirectCosts' }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `Project with ID ${id} does not exist`
      });
    }

    res.json({
      success: true,
      project,
      message: 'Project retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve project'
    });
  }
});

/**
 * Create a new project
 */
router.post('/projects', async (req, res) => {
  try {
    const {
      name,
      description,
      settings,
      laborCategories = [],
      otherDirectCosts = [],
      tags = []
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required',
        message: 'Please provide a valid project name'
      });
    }

    const project = await PricingProject.create({
      tenantId: uuidv4(), // In real app, get from auth context
      name: name.trim(),
      description: description?.trim(),
      settings: settings || PricingProject.getDefaultSettings(),
      laborCategories,
      otherDirectCosts,
      tags,
      createdBy: uuidv4(), // In real app, get from auth context
      updatedBy: uuidv4(), // In real app, get from auth context
    });

    res.status(201).json({
      success: true,
      project,
      message: 'Project created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create project'
    });
  }
});

/**
 * Update an existing project
 */
router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      settings,
      laborCategories,
      otherDirectCosts,
      tags
    } = req.body;

    const project = await PricingProject.findByPk(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `Project with ID ${id} does not exist`
      });
    }

    // Update project fields
    const updateData: any = {
      updatedBy: uuidv4(), // In real app, get from auth context
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (settings !== undefined) updateData.settings = settings;
    if (laborCategories !== undefined) updateData.laborCategories = laborCategories;
    if (otherDirectCosts !== undefined) updateData.otherDirectCosts = otherDirectCosts;
    if (tags !== undefined) updateData.tags = tags;

    await project.update(updateData);

    // Fetch updated project with associations
    const updatedProject = await PricingProject.findByPk(id, {
      include: [
        { model: LaborCategory, as: 'laborCategories' },
        { model: OtherDirectCost, as: 'otherDirectCosts' }
      ]
    });

    res.json({
      success: true,
      project: updatedProject,
      message: 'Project updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to update project'
    });
  }
});

/**
 * Delete a project
 */
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await PricingProject.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `Project with ID ${id} does not exist`
      });
    }

    await project.destroy();

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to delete project'
    });
  }
});

/**
 * Validate business rules for a labor category
 */
router.post('/validate-labor-category', async (req, res) => {
  try {
    const laborCategoryData = req.body;
    
    // Create a temporary instance to validate
    const tempCategory = LaborCategory.build(laborCategoryData);
    const errors = tempCategory.validateBusinessRules();

    res.json({
      success: true,
      valid: errors.length === 0,
      errors,
      message: errors.length === 0 ? 'Validation passed' : 'Validation failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to validate labor category'
    });
  }
});

export default router;
