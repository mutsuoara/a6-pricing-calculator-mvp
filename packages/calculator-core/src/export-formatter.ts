/**
 * Export formatting utilities for various output formats
 */

import { CalculationResult, LaborCategoryResult, OtherDirectCostResult } from '@pricing-calculator/types';

export class ExportFormatter {
  /**
   * Format calculation result for Excel export
   */
  static formatForExcel(result: CalculationResult) {
    return {
      projectSummary: {
        totalLaborCost: result.totals.totalLaborCost,
        totalODCCost: result.totals.totalODCCost,
        totalProjectCost: result.totals.totalProjectCost,
        totalEffectiveHours: result.totals.totalEffectiveHours,
        averageBurdenedRate: result.totals.averageBurdenedRate,
        overheadRate: result.settings.overheadRate,
        gaRate: result.settings.gaRate,
        feeRate: result.settings.feeRate,
        contractType: result.settings.contractType
      },
      laborSummary: this.formatLaborSummary(result.laborCategories),
      laborDetail: this.formatLaborDetail(result.laborCategories),
      odcDetail: this.formatODCDetail(result.otherDirectCosts)
    };
  }

  /**
   * Format labor summary for export
   */
  private static formatLaborSummary(categories: LaborCategoryResult[]) {
    return categories.map(category => ({
      title: category.title,
      effectiveHours: category.effectiveHours,
      baseRate: category.baseRate,
      burdenedRate: category.burdenedRate,
      totalCost: category.totalCost,
      clearanceLevel: category.clearanceLevel
    }));
  }

  /**
   * Format detailed labor breakdown for export
   */
  private static formatLaborDetail(categories: LaborCategoryResult[]) {
    return categories.map(category => ({
      title: category.title,
      baseRate: category.baseRate,
      hours: category.hours,
      ftePercentage: category.ftePercentage,
      effectiveHours: category.effectiveHours,
      clearanceLevel: category.clearanceLevel,
      clearancePremium: category.clearancePremium,
      clearanceAdjustedRate: category.clearanceAdjustedRate,
      overheadAmount: category.overheadAmount,
      overheadRate: category.overheadRate,
      gaAmount: category.gaAmount,
      gaRate: category.gaRate,
      feeAmount: category.feeAmount,
      feeRate: category.feeRate,
      totalCost: category.totalCost,
      burdenedRate: category.burdenedRate
    }));
  }

  /**
   * Format ODC detail for export
   */
  private static formatODCDetail(odcs: OtherDirectCostResult[]) {
    return odcs.map(odc => ({
      description: odc.description,
      category: odc.category,
      amount: odc.amount,
      taxable: odc.taxable,
      taxAmount: odc.taxAmount,
      totalAmount: odc.totalAmount
    }));
  }

  /**
   * Format for CSV export
   */
  static formatForCSV(result: CalculationResult) {
    const laborData = this.formatLaborDetail(result.laborCategories);
    const odcData = this.formatODCDetail(result.otherDirectCosts);

    return {
      headers: [
        'Type',
        'Description',
        'Hours',
        'Rate',
        'Amount',
        'Category',
        'Clearance',
        'Location'
      ],
      rows: [
        ...laborData.map(item => [
          'Labor',
          item.title,
          item.effectiveHours,
          item.burdenedRate,
          item.totalCost,
          'Labor',
          item.clearanceLevel,
          ''
        ]),
        ...odcData.map(item => [
          'ODC',
          item.description,
          '',
          '',
          item.totalAmount,
          item.category,
          '',
          ''
        ])
      ]
    };
  }

  /**
   * Format for PDF export
   */
  static formatForPDF(result: CalculationResult) {
    return {
      metadata: {
        title: 'Pricing Calculator Results',
        generatedAt: new Date().toISOString(),
        contractType: result.settings.contractType
      },
      summary: result.totals,
      laborCategories: this.formatLaborSummary(result.laborCategories),
      otherDirectCosts: this.formatODCDetail(result.otherDirectCosts)
    };
  }
}
