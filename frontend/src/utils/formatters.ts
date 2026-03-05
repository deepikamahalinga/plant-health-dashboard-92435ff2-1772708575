/**
 * Utility functions for data formatting
 */

/**
 * Format options for date formatting
 */
type DateFormatOptions = {
  includeTime?: boolean;
  locale?: string;
}

/**
 * Currency format options
 */
type CurrencyFormatOptions = {
  currency?: string;
  locale?: string;
  decimals?: number;
}

/**
 * Number format options
 */
type NumberFormatOptions = {
  decimals?: number;
  locale?: string;
}

/**
 * Formats a date string or Date object into localized string
 * @param date Date to format
 * @param options Formatting options
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, options: DateFormatOptions = {}): string => {
  const {
    includeTime = false,
    locale = 'en-US'
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (includeTime) {
    return dateObj.toLocaleString(locale);
  }
  return dateObj.toLocaleDateString(locale);
}

/**
 * Formats a number as currency
 * @param amount Number to format
 * @param options Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, options: CurrencyFormatOptions = {}): string => {
  const {
    currency = 'USD',
    locale = 'en-US',
    decimals = 2
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

/**
 * Formats a number with thousand separators and decimal places
 * @param num Number to format
 * @param options Formatting options
 * @returns Formatted number string
 */
export const formatNumber = (num: number, options: NumberFormatOptions = {}): string => {
  const {
    decimals = 0,
    locale = 'en-US'
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

/**
 * Truncates text to specified length with ellipsis
 * @param text Text to truncate
 * @param length Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}