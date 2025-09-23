/**
 * Scenario comparison utilities for pricing analysis
 */

import { ScenarioComparison, PricingSettings, LaborCategory, OtherDirectCost } from '@pricing-calculator/types';
import { PricingCalculationEngine } from './calculation-engine';

export class ScenarioComparisonService {
  /**
   * Compare multiple pricing scenarios
   */
  static compareScenarios(
    baseSettings: PricingSettings,
    baseLaborCategories: LaborCategory[],
    baseOtherDirectCosts: OtherDirectCost[],
    scenarios: Array<{ name: string; settings: PricingSettings }>
  ): ScenarioComparison[] {
    return PricingCalculationEngine.compareScenarios(
      baseSettings,
      baseLaborCategories,
      baseOtherDirectCosts,
      scenarios
    );
  }

  /**
   * Generate common scenario variations
   */
  static generateCommonScenarios(baseSettings: PricingSettings): Array<{ name: string; settings: PricingSettings }> {
    return [
      {
        name: 'Conservative (Lower Rates)',
        settings: {
          ...baseSettings,
          overheadRate: Math.max(0, baseSettings.overheadRate - 0.05),
          gaRate: Math.max(0, baseSettings.gaRate - 0.02),
          feeRate: Math.max(0, baseSettings.feeRate - 0.01)
        }
      },
      {
        name: 'Aggressive (Higher Rates)',
        settings: {
          ...baseSettings,
          overheadRate: Math.min(2.0, baseSettings.overheadRate + 0.05),
          gaRate: Math.min(2.0, baseSettings.gaRate + 0.02),
          feeRate: Math.min(1.0, baseSettings.feeRate + 0.01)
        }
      },
      {
        name: 'No Fee',
        settings: {
          ...baseSettings,
          feeRate: 0
        }
      },
      {
        name: 'Minimal Overhead',
        settings: {
          ...baseSettings,
          overheadRate: 0.15,
          gaRate: 0.10
        }
      }
    ];
  }

  /**
   * Analyze scenario variance
   */
  static analyzeVariance(scenarios: ScenarioComparison[]) {
    const costs = scenarios.map(s => s.result.totals.totalProjectCost);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;

    return {
      minCost,
      maxCost,
      avgCost,
      range: maxCost - minCost,
      rangePercent: minCost > 0 ? ((maxCost - minCost) / minCost) * 100 : 0,
      scenarios: scenarios.map(scenario => ({
        name: scenario.name,
        cost: scenario.result.totals.totalProjectCost,
        variance: scenario.variance.totalCostVariance,
        variancePercent: scenario.variance.totalCostVariancePercent
      }))
    };
  }
}
