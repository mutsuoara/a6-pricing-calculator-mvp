/**
 * Export Service
 * Handles frontend export functionality
 */

import { CalculationResult, PricingSettings, LaborCategoryInput, OtherDirectCostInput } from '@pricing-calculator/types';

export interface ExportOptions {
  projectName?: string;
  contractVehicle?: string;
  template?: 'basic' | 'va-spruce' | 'gsa-mas';
}

export class ExportService {
  private static readonly API_BASE_URL = 'http://localhost:3002/api';

  /**
   * Export calculation results to Excel
   */
  static async exportToExcel(
    calculationResult: CalculationResult,
    laborCategories: LaborCategoryInput[],
    otherDirectCosts: OtherDirectCostInput[],
    settings: PricingSettings,
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      // Prepare calculation input
      const calculationInput = {
        settings,
        laborCategories: laborCategories.map(lc => ({
          ...lc,
          id: lc.id || `temp-${Date.now()}-${Math.random()}`
        })),
        otherDirectCosts: otherDirectCosts.map(odc => ({
          ...odc,
          id: odc.id || `temp-${Date.now()}-${Math.random()}`
        }))
      };

      // Make API call
      const response = await fetch(`${this.API_BASE_URL}/export/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calculationInput,
          options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export to Excel');
      }

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `pricing-calculation-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Failed to export to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export with specific template
   */
  static async exportWithTemplate(
    template: 'basic' | 'va-spruce' | 'gsa-mas',
    calculationResult: CalculationResult,
    laborCategories: LaborCategoryInput[],
    otherDirectCosts: OtherDirectCostInput[],
    settings: PricingSettings,
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      // Prepare calculation input
      const calculationInput = {
        settings,
        laborCategories: laborCategories.map(lc => ({
          ...lc,
          id: lc.id || `temp-${Date.now()}-${Math.random()}`
        })),
        otherDirectCosts: otherDirectCosts.map(odc => ({
          ...odc,
          id: odc.id || `temp-${Date.now()}-${Math.random()}`
        }))
      };

      // Make API call with template
      const response = await fetch(`${this.API_BASE_URL}/export/excel/${template}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calculationInput,
          options: {
            ...options,
            template
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export to Excel');
      }

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `pricing-calculation-${template}-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Failed to export to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available export templates
   */
  static async getAvailableTemplates(): Promise<Array<{id: string; name: string; description: string}>> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/export/templates`);
      
      if (!response.ok) {
        throw new Error('Failed to get export templates');
      }

      const data = await response.json();
      return data.data || [];

    } catch (error) {
      console.error('Get templates error:', error);
      return [
        {
          id: 'basic',
          name: 'Basic Template',
          description: 'Standard pricing calculation export'
        }
      ];
    }
  }
}
