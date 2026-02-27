/**
 * DNA | CONVENE — Event Time Formatting
 * Luma-style relative time display for event cards.
 */

import { format, isToday, isTomorrow, isThisWeek, isSameDay } from 'date-fns';

export function formatEventTime(
  startTimeStr?: string | null,
  endTimeStr?: string | null
): string {
  if (!startTimeStr) return '';

  const start = new Date(startTimeStr);
  const end = endTimeStr ? new Date(endTimeStr) : null;
  const timeStr = format(start, 'h:mm a');

  // Multi-day event
  if (end && !isSameDay(start, end)) {
    return `${format(start, 'MMM d')}–${format(end, 'MMM d')}`;
  }

  if (isToday(start)) return `Today, ${timeStr}`;
  if (isTomorrow(start)) return `Tomorrow, ${timeStr}`;
  if (isThisWeek(start)) return `${format(start, 'EEEE')}, ${timeStr}`;

  return format(start, 'EEE, MMM d');
}
