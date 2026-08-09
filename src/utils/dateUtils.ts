import { TranscriptSentence } from '../types';

export const DEFAULT_COURSE_START_DATE = '2026-07-13';

/**
 * Auto-calculates Week Number (Week 1, Week 2, ...) based on course start date.
 * Defaults to July 13, 2026.
 */
export function calculateWeekNumber(startDateStr?: string, targetDate: Date = new Date()): string {
  const dateStr = startDateStr || DEFAULT_COURSE_START_DATE;
  try {
    const start = new Date(dateStr);
    if (isNaN(start.getTime())) {
      return 'Week 1';
    }
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const diffTime = targetMidnight.getTime() - startMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (isNaN(diffDays) || diffDays < 0) return 'Week 1';

    const weekNum = Math.floor(diffDays / 7) + 1;
    return `Week ${weekNum}`;
  } catch (e) {
    return 'Week 1';
  }
}

/**
 * Robustly determines the week number for a transcript sentence.
 * Checks weekNumber, date, ID timestamp, and created_at.
 * Falls back to 'Week 1' for legacy undated items instead of defaulting to current date.
 */
export function getItemWeek(item: TranscriptSentence, startDateStr?: string): string {
  if (item.weekNumber) return item.weekNumber;

  if (item.date) {
    const d = new Date(item.date);
    if (!isNaN(d.getTime())) {
      return calculateWeekNumber(startDateStr, d);
    }
  }

  if (item.id) {
    const match = item.id.match(/\b(1\d{12})\b/);
    if (match) {
      const ts = parseInt(match[1], 10);
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        return calculateWeekNumber(startDateStr, d);
      }
    }
  }

  const rawCreated = (item as any).created_at || (item as any).createdAt;
  if (rawCreated) {
    const d = new Date(rawCreated);
    if (!isNaN(d.getTime())) {
      return calculateWeekNumber(startDateStr, d);
    }
  }

  return 'Week 1';
}
