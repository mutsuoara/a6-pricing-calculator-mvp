/**
 * Core pricing calculation types and interfaces
 */
export type ContractType = 'FFP' | 'T&M' | 'CPFF';
export type ClearanceLevel = 'None' | 'Public Trust' | 'Secret' | 'Top Secret';
export type LocationType = 'Remote' | 'On-site' | 'Hybrid';
export interface PricingSettings {
    overheadRate: number;
    gaRate: number;
    feeRate: number;
    contractType: ContractType;
    periodOfPerformance: {
        startDate: string;
        endDate: string;
    };
}
export interface LaborCategory {
    id: string;
    title: string;
    baseRate: number;
    hours: number;
    ftePercentage: number;
    clearanceLevel: ClearanceLevel;
    location: LocationType;
    effectiveHours: number;
}
export interface OtherDirectCost {
    id: string;
    description: string;
    amount: number;
    category: 'Travel' | 'Equipment' | 'Software' | 'Other';
    taxable: boolean;
}
export interface CalculationResult {
    laborCategories: LaborCategoryResult[];
    otherDirectCosts: OtherDirectCostResult[];
    totals: {
        totalLaborCost: number;
        totalODCCost: number;
        totalProjectCost: number;
        totalEffectiveHours: number;
        averageBurdenedRate: number;
    };
    settings: PricingSettings;
}
export interface LaborCategoryResult {
    id: string;
    title: string;
    baseRate: number;
    hours: number;
    ftePercentage: number;
    effectiveHours: number;
    clearanceLevel: ClearanceLevel;
    location: LocationType;
    clearancePremium: number;
    clearanceAdjustedRate: number;
    overheadAmount: number;
    overheadRate: number;
    gaAmount: number;
    gaRate: number;
    feeAmount: number;
    feeRate: number;
    totalCost: number;
    burdenedRate: number;
}
export interface OtherDirectCostResult {
    id: string;
    description: string;
    amount: number;
    category: string;
    taxable: boolean;
    taxAmount: number;
    totalAmount: number;
}
export interface ScenarioComparison {
    name: string;
    settings: PricingSettings;
    result: CalculationResult;
    variance: {
        totalCostVariance: number;
        totalCostVariancePercent: number;
    };
}
//# sourceMappingURL=pricing.d.ts.map