/**
 * Shared calendar date utilities for memory review calculations.
 * Ensures consistent, deterministic calendar-date evaluations across domain, service, and UI layers.
 */

export interface CalendarDateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Extracts calendar date parts (year, month, day) from a date string.
 * For 'YYYY-MM-DD' formatted strings, parses calendar components directly
 * to prevent UTC-to-local timezone conversion from shifting the day.
 */
export function parseCalendarDateParts(dateStr: string): CalendarDateParts | null {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  const trimmed = dateStr.trim();
  const match = DATE_ONLY_REGEX.exec(trimmed);
  if (match && match[1] && match[2] && match[3]) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }

  // Fallback for full ISO timestamps or other formats
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
  };
}

/**
 * Resolves calendar parts for a reference date (defaults to current date).
 */
export function getReferenceCalendarParts(ref?: Date | string): CalendarDateParts | null {
  if (!ref) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }

  if (typeof ref === 'string') {
    return parseCalendarDateParts(ref);
  }

  if (ref instanceof Date) {
    if (Number.isNaN(ref.getTime())) {
      return null;
    }
    return {
      year: ref.getFullYear(),
      month: ref.getMonth() + 1,
      day: ref.getDate(),
    };
  }

  return null;
}

/**
 * Deterministically checks if a memory review date is due (on or before reference date).
 *
 * Product rules:
 * - A memory is due when reviewDate is today or earlier.
 * - A review date in the future is not due.
 * - Missing, null, undefined, or invalid dates return false.
 *
 * @param reviewDate - Review date string (e.g. 'YYYY-MM-DD' or ISO timestamp)
 * @param referenceDate - Optional reference date to compare against (defaults to today)
 */
export function isMemoryDueForReview(
  reviewDate?: string | null,
  referenceDate?: Date | string,
): boolean {
  if (!reviewDate || typeof reviewDate !== 'string') {
    return false;
  }

  const reviewParts = parseCalendarDateParts(reviewDate);
  if (!reviewParts) {
    return false;
  }

  const refParts = getReferenceCalendarParts(referenceDate);
  if (!refParts) {
    return false;
  }

  const reviewKey = reviewParts.year * 10000 + reviewParts.month * 100 + reviewParts.day;
  const refKey = refParts.year * 10000 + refParts.month * 100 + refParts.day;

  return reviewKey <= refKey;
}
