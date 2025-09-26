/**
 * Update Vehicle Codes Script
 * Updates existing LCAT templates to use the correct vehicle codes
 */

import { DatabaseService } from '../config/database';
import { LaborCategoryTemplate } from '../models';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

async function updateVehicleCodes() {
  try {
    console.log('🔄 Updating vehicle codes in existing templates...');
    
    // Initialize database connection
    const dbService = DatabaseService.getInstance();
    await dbService.connect();
    
    // Initialize models
    const { ModelManager } = await import('../models');
    await ModelManager.initializeModels();
    
    // Get all templates
    const templates = await LaborCategoryTemplate.findAll({
      where: { tenantId: TENANT_ID },
    });
    
    console.log(`Found ${templates.length} templates to update`);
    
    for (const template of templates) {
      const updatedVehicleRates: Record<string, any> = {};
      
      // Map old vehicle codes to new ones
      const vehicleMapping: Record<string, string> = {
        '8A': 'VA_SPRUCE',
        'SBIR': 'OPM_GSA', 
        'IDIQ': 'HHS_SWIFT_GSA',
      };
      
      // Update vehicle rates
      for (const [oldCode, newCode] of Object.entries(vehicleMapping)) {
        if (template.vehicleRates[oldCode]) {
          updatedVehicleRates[newCode] = template.vehicleRates[oldCode];
          // Update the notes to reflect the new vehicle
          updatedVehicleRates[newCode].notes = updatedVehicleRates[newCode].notes.replace(oldCode, newCode);
        }
      }
      
      // Keep GSA_MAS as is
      if (template.vehicleRates.GSA_MAS) {
        updatedVehicleRates.GSA_MAS = template.vehicleRates.GSA_MAS;
      }
      
      // Update the template
      await template.update({
        vehicleRates: updatedVehicleRates,
      });
      
      console.log(`✅ Updated ${template.title} with new vehicle codes`);
    }
    
    console.log('🎉 Vehicle code update completed successfully!');
  } catch (error) {
    console.error('❌ Error updating vehicle codes:', error);
    throw error;
  } finally {
    // Close database connection
    const dbService = DatabaseService.getInstance();
    await dbService.disconnect();
  }
}

// Run update if this file is executed directly
if (require.main === module) {
  updateVehicleCodes()
    .then(() => {
      console.log('🎉 Vehicle code update finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Vehicle code update failed:', error);
      process.exit(1);
    });
}

export { updateVehicleCodes };
