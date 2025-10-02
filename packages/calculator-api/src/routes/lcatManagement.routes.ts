/**
 * LCAT Management Routes
 * API endpoints for LCAT management functionality
 */

import { Router } from 'express';
import { LCATManagementController } from '../controllers/lcatManagement.controller';

const router = Router();

// Contract Vehicles routes
router.get('/contract-vehicles', LCATManagementController.getContractVehicles);
router.post('/contract-vehicles', LCATManagementController.createContractVehicle);
router.put('/contract-vehicles/:id', LCATManagementController.updateContractVehicle);
router.delete('/contract-vehicles/:id', LCATManagementController.deleteContractVehicle);

// Company Roles routes
router.get('/company-roles', LCATManagementController.getCompanyRoles);
router.post('/company-roles', LCATManagementController.createCompanyRole);
router.put('/company-roles/:id', LCATManagementController.updateCompanyRole);
router.delete('/company-roles/:id', LCATManagementController.deleteCompanyRole);

// LCATs routes
router.get('/lcats', LCATManagementController.getLCATs);
router.post('/lcats', LCATManagementController.createLCAT);
router.put('/lcats/:id', LCATManagementController.updateLCAT);
router.delete('/lcats/:id', LCATManagementController.deleteLCAT);

// Project Roles routes
router.get('/project-roles', LCATManagementController.getProjectRoles);
router.post('/project-roles', LCATManagementController.createProjectRole);
router.put('/project-roles/:id', LCATManagementController.updateProjectRole);
router.delete('/project-roles/:id', LCATManagementController.deleteProjectRole);

// Rate Validation Rules routes
router.get('/rate-validation-rules', LCATManagementController.getRateValidationRules);
router.post('/rate-validation-rules', LCATManagementController.createRateValidationRule);
router.put('/rate-validation-rules/:id', LCATManagementController.updateRateValidationRule);
router.delete('/rate-validation-rules/:id', LCATManagementController.deleteRateValidationRule);

// Bulk import
router.options('/bulk-import', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});
router.post('/bulk-import', LCATManagementController.bulkImport);

// Template download
router.get('/template', LCATManagementController.downloadTemplate);

// Clear all data
router.delete('/clear-all', LCATManagementController.clearAllData);

export default router;
