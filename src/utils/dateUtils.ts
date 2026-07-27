export const DEFAULT_COURSE_START_DATE = '2026-07-13';

/**
 * Auto-calculates Week Number (Week 1, Week 2, ...) based on course start date.
 * Defaults to July 13, 2026.
 */
export function calculateWeekNumber(startDateStr?: string, targetDate: Date = new Date()): string {
  const dateStr = startDateStr || DEFAULT_COURSE_START_DATE;
  try {
    const start = new Date(dateStr);
    // Midnight normalized comparison
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const diffTime = targetMidnight.getTime() - startMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Week 1';

    const weekNum = Math.floor(diffDays / 7) + 1;
    return `Week ${weekNum}`;
  } catch (e) {
    return 'Week 1';
  }
}
