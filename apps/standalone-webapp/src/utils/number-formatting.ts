/**
 * Utility functions for formatting numbers with commas
 */

/**
 * Format a number with commas for thousands separators
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string with commas
 */
export function formatNumberWithCommas(value: number | string, decimals: number = 0): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
}

/**
 * Format currency with commas and dollar sign
 * @param value - The number to format
 * @param showDecimals - Whether to show decimal places (default: true, always 2 decimals)
 * @returns Formatted currency string
 */
export function formatCurrencyWithCommas(value: number | string, showDecimals: boolean = true): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return showDecimals ? '$0.00' : '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(numValue);
}

/**
 * Format currency with smart decimal handling for contract accuracy
 * Always shows 2 decimal places for consistency
 * @param value - The number to format
 * @returns Formatted currency string with 2 decimal places
 */
export function formatCurrencySmart(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Format percentage with commas for large numbers
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentageWithCommas(value: number | string, decimals: number = 1): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return `${formatNumberWithCommas(numValue, decimals)}%`;
}
