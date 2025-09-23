/**
 * Input validation utilities for pricing calculations
 */

import { PricingSettings, LaborCategory, LaborCategoryInput } from '@pricing-calculator/types';

export class ValidationService {
  /**
   * Validate pricing settings
   */
  static validatePricingSettings(settings: PricingSettings): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (settings.overheadRate < 0 || settings.overheadRate > 2.0) {
      errors.push('Overhead rate must be between 0% and 200%');
    }

    if (settings.gaRate < 0 || settings.gaRate > 2.0) {
      errors.push('G&A rate must be between 0% and 200%');
    }

    if (settings.feeRate < 0 || settings.feeRate > 1.0) {
      errors.push('Fee rate must be between 0% and 100%');
    }

    if (!settings.contractType || !['FFP', 'T&M', 'CPFF'].includes(settings.contractType)) {
      errors.push('Contract type must be FFP, T&M, or CPFF');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate labor category input
   */
  static validateLaborCategoryInput(input: LaborCategoryInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.title || input.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (input.baseRate < 1 || input.baseRate > 1000) {
      errors.push('Base rate must be between $1 and $1000');
    }

    if (input.hours < 1 || input.hours > 10000) {
      errors.push('Hours must be between 1 and 10,000');
    }

    if (input.ftePercentage < 0.01 || input.ftePercentage > 100) {
      errors.push('FTE percentage must be between 0.01% and 100%');
    }

    if (!input.clearanceLevel || !['None', 'Public Trust', 'Secret', 'Top Secret'].includes(input.clearanceLevel)) {
      errors.push('Clearance level must be None, Public Trust, Secret, or Top Secret');
    }

    if (!input.location || !['Remote', 'On-site', 'Hybrid'].includes(input.location)) {
      errors.push('Location must be Remote, On-site, or Hybrid');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate complete project data
   */
  static validateProject(
    settings: PricingSettings,
    laborCategories: LaborCategory[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate settings
    const settingsValidation = this.validatePricingSettings(settings);
    if (!settingsValidation.isValid) {
      errors.push(...settingsValidation.errors);
    }

    // Validate labor categories
    if (laborCategories.length === 0) {
      errors.push('At least one labor category is required');
    }

    laborCategories.forEach((category, index) => {
      const categoryValidation = this.validateLaborCategoryInput({
        title: category.title,
        baseRate: category.baseRate,
        hours: category.hours,
        ftePercentage: category.ftePercentage,
        clearanceLevel: category.clearanceLevel,
        location: category.location
      });

      if (!categoryValidation.isValid) {
        errors.push(...categoryValidation.errors.map(error => `Labor category ${index + 1}: ${error}`));
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
