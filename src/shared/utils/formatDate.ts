import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export function formatTransactionDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

export function formatFullDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM d, yyyy');
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}

export function formatMonthYear(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM yyyy');
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

export function formatDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatTimeInput(date: Date): string {
  return format(date, 'HH:mm');
}

export function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate),
  };
}

export function getWeekRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - dayOfWeek);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return {
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate),
  };
}

export function getYearRange(year: number): { startDate: string; endDate: string } {
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

export function groupTransactionsByDate<T extends { date: string }>(
  transactions: T[]
): { date: string; label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const tx of transactions) {
    const key = tx.date.substring(0, 10);
    const existing = groups.get(key) ?? [];
    groups.set(key, [...existing, tx]);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: formatTransactionDate(date),
      items,
    }));
}
