/**
 * Salary Conversion Utilities
 * Converts between annual and hourly rates for government contracting
 */

export const STANDARD_HOURS_PER_YEAR = 2080; // 40 hours/week × 52 weeks/year

/**
 * Convert annual salary to hourly rate
 * @param annualSalary - Annual salary in dollars
 * @returns Hourly rate in dollars
 */
export function annualToHourly(annualSalary: number): number {
  return annualSalary / STANDARD_HOURS_PER_YEAR;
}

/**
 * Convert hourly rate to annual salary
 * @param hourlyRate - Hourly rate in dollars
 * @returns Annual salary in dollars
 */
export function hourlyToAnnual(hourlyRate: number): number {
  return hourlyRate * STANDARD_HOURS_PER_YEAR;
}

/**
 * Format currency for display
 * @param amount - Amount in dollars
 * @param showCents - Whether to show cents (default: true)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showCents: boolean = true): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

/**
 * Get salary conversion info for display
 * @param annualSalary - Annual salary in dollars
 * @returns Object with formatted annual and hourly rates
 */
export function getSalaryConversionInfo(annualSalary: number) {
  const hourlyRate = annualToHourly(annualSalary);
  return {
    annual: formatCurrency(annualSalary, false),
    hourly: formatCurrency(hourlyRate, true),
    hourlyRate: hourlyRate,
    annualSalary: annualSalary,
  };
}
