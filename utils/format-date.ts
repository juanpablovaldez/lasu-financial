/**
 * Format a date using the Intl.DateTimeFormat API for proper internationalization.
 *
 * This utility provides consistent date formatting across the app with support
 * for multiple locales and formatting styles.
 *
 * @param date - The date to format (Date object or date string)
 * @param locale - The locale to use (defaults to 'es-MX' for Spanish/Mexico)
 * @param options - Intl.DateTimeFormatOptions for customizing the output
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date()) // "14 feb 2026, 10:30"
 * formatDate(new Date(), 'es-MX', { dateStyle: 'long' }) // "14 de febrero de 2026"
 * formatDate(new Date(), 'en-US', { dateStyle: 'short' }) // "2/14/26"
 * ```
 */
export function formatDate(
  date: Date | string,
  locale: string = 'es-MX',
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  };

  return new Intl.DateTimeFormat(locale, options ?? defaultOptions).format(dateObj);
}

/**
 * Format a date with only the date part (no time).
 *
 * @example
 * ```ts
 * formatDateOnly(new Date()) // "14 feb 2026"
 * ```
 */
export function formatDateOnly(date: Date | string, locale: string = 'es-MX'): string {
  return formatDate(date, locale, { dateStyle: 'medium' });
}

/**
 * Format a date with only the time part (no date).
 *
 * @example
 * ```ts
 * formatTimeOnly(new Date()) // "10:30"
 * ```
 */
export function formatTimeOnly(date: Date | string, locale: string = 'es-MX'): string {
  return formatDate(date, locale, { timeStyle: 'short' });
}

/**
 * Format a relative date (e.g., "hace 2 horas", "ayer").
 * Falls back to absolute date if the date is older than 7 days.
 *
 * @example
 * ```ts
 * formatRelativeDate(new Date()) // "ahora"
 * formatRelativeDate(new Date(Date.now() - 3600000)) // "hace 1 hora"
 * ```
 */
export function formatRelativeDate(date: Date | string, locale: string = 'es-MX'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // If older than 7 days, use absolute date
  if (diffDays > 7) {
    return formatDateOnly(dateObj, locale);
  }

  try {
    // Use Intl.RelativeTimeFormat for recent dates
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffDays > 0) {
      return rtf.format(-diffDays, 'day');
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) {
      return rtf.format(-diffHours, 'hour');
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes > 0) {
      return rtf.format(-diffMinutes, 'minute');
    }

    return locale.startsWith('es') ? 'ahora' : 'now';
  } catch {
    // Fallback for environments without Intl.RelativeTimeFormat
    return formatDateOnly(dateObj, locale);
  }
}
