/**
 * Labor Category Routes
 * API endpoints for managing labor categories with vehicle-specific rates and A6 role mappings
 */

import { Router, Request, Response } from 'express';
import { LCATTemplateService, LCATSearchFilters } from '../services/lcat-template.service';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
// router.use(authenticateJWT); // Temporarily disabled for testing

/**
 * GET /api/labor-categories/search
 * Search labor categories with filters
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000'; // Default tenant for testing

    const filters: LCATSearchFilters = {
      searchTerm: req.query.searchTerm as string,
      vehicleCode: req.query.vehicleCode as string,
      category: req.query.category as string,
      experienceLevel: req.query.experienceLevel as string,
      clearanceLevel: req.query.clearanceLevel as string,
      location: req.query.location as string,
      a6RoleId: req.query.a6RoleId as string,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    };

    const results = await LCATTemplateService.searchTemplates(tenantId, filters);
    
    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error searching LCAT templates:', error);
    res.status(500).json({ 
      error: 'Failed to search LCAT templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/labor-categories/contract-vehicles
 * Get available contract vehicles
 */
router.get('/contract-vehicles', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000'; // Default tenant for testing

    const vehicles = await LCATTemplateService.getContractVehicles(tenantId);
    
    res.json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error('Error getting contract vehicles:', error);
    res.status(500).json({ 
      error: 'Failed to get contract vehicles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/labor-categories/a6-roles
 * Get available A6 roles
 */
router.get('/a6-roles', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000'; // Default tenant for testing

    const roles = await LCATTemplateService.getA6Roles(tenantId);
    
    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error('Error getting A6 roles:', error);
    res.status(500).json({ 
      error: 'Failed to get A6 roles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/labor-categories/:id
 * Get specific LCAT template by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000'; // Default tenant for testing

    const { id } = req.params;
    const vehicleCode = req.query.vehicleCode as string;

    const result = await LCATTemplateService.getTemplateById(tenantId, id, vehicleCode);
    
    if (!result) {
      return res.status(404).json({ error: 'LCAT template not found' });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error getting LCAT template:', error);
    res.status(500).json({ 
      error: 'Failed to get LCAT template',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/labor-categories
 * Create new LCAT template
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000'; // Default tenant for testing

    const template = await LCATTemplateService.createTemplate(tenantId, req.body);
    
    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error creating LCAT template:', error);
    res.status(400).json({ 
      error: 'Failed to create LCAT template',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/labor-categories/:id
 * Update LCAT template
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000'; // Default tenant for testing

    const { id } = req.params;
    const template = await LCATTemplateService.updateTemplate(tenantId, id, req.body);
    
    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error updating LCAT template:', error);
    res.status(400).json({ 
      error: 'Failed to update LCAT template',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/labor-categories/:id
 * Delete LCAT template
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000'; // Default tenant for testing

    const { id } = req.params;
    const deleted = await LCATTemplateService.deleteTemplate(tenantId, id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'LCAT template not found' });
    }

    res.json({
      success: true,
      message: 'LCAT template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting LCAT template:', error);
    res.status(500).json({ 
      error: 'Failed to delete LCAT template',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/labor-categories/:id/convert
 * Convert LCAT template to LaborCategoryInput
 */
router.post('/:id/convert', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000'; // Default tenant for testing

    const { id } = req.params;
    const { vehicleCode, customOverrides } = req.body;

    const result = await LCATTemplateService.getTemplateById(tenantId, id, vehicleCode);
    
    if (!result) {
      return res.status(404).json({ error: 'LCAT template not found' });
    }

    const laborCategory = LCATTemplateService.convertTemplateToLaborCategory(
      result.template,
      vehicleCode,
      customOverrides
    );
    
    res.json({
      success: true,
      data: {
        laborCategory,
        template: result.template,
        vehicleRate: result.vehicleRate,
        a6Roles: result.a6Roles,
        contractVehicle: result.contractVehicle,
      },
    });
  } catch (error) {
    console.error('Error converting LCAT template:', error);
    res.status(500).json({ 
      error: 'Failed to convert LCAT template',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
