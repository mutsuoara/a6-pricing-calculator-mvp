/**
 * Labor category and workforce management types
 */

export interface LaborCategoryInput {
  title: string;
  baseRate: number;
  hours: number;
  ftePercentage: number;
  clearanceLevel: string;
  location: string;
}

export interface LaborCategoryValidation {
  isValid: boolean;
  errors: {
    title?: string;
    baseRate?: string;
    hours?: string;
    ftePercentage?: string;
    clearanceLevel?: string;
    location?: string;
  };
}

export interface LaborCategoryTemplate {
  id: string;
  name: string;
  description: string;
  title: string;
  baseRateRange: {
    min: number;
    max: number;
  };
  typicalHours: number;
  typicalFtePercentage: number;
  clearanceLevel: string;
  location: string;
  category: 'Management' | 'Technical' | 'Administrative' | 'Support';
}

export interface LaborCategorySummary {
  totalCategories: number;
  totalEffectiveHours: number;
  totalBaseCost: number;
  totalBurdenedCost: number;
  averageBurdenedRate: number;
  clearanceDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
}

