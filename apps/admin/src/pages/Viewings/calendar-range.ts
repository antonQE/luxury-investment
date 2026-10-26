export type CalendarMode = 'day' | 'week' | 'month';

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

/** Monday-based week start. */
function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return endOfDay(end);
}

function startOfMonth(date: Date): Date {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function rangeForMode(
  mode: CalendarMode,
  anchor: Date,
): { from: Date; to: Date; days: Date[] } {
  if (mode === 'day') {
    const from = startOfDay(anchor);
    const to = endOfDay(anchor);
    return { from, to, days: [from] };
  }
  if (mode === 'week') {
    const from = startOfWeek(anchor);
    const to = endOfWeek(anchor);
    const days: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(from);
      day.setDate(from.getDate() + i);
      days.push(day);
    }
    return { from, to, days };
  }
  const from = startOfMonth(anchor);
  const to = endOfMonth(anchor);
  const days: Date[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return { from, to, days };
}

export function shiftAnchor(mode: CalendarMode, anchor: Date, direction: -1 | 1): Date {
  const next = new Date(anchor);
  if (mode === 'day') next.setDate(next.getDate() + direction);
  else if (mode === 'week') next.setDate(next.getDate() + direction * 7);
  else next.setMonth(next.getMonth() + direction);
  return next;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
