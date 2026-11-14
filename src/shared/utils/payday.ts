// "Payday months": salary arrives at the end of each month and pays for the NEXT month.
// November = October's payday .. the day before November's payday.
// Payday = the day a salary actually arrived in the last 10 days of the month (early pay before
// Christmas / year-end holidays lands around the 23rd); if none yet,
// the last day of the month, moved back to Friday when it falls on a weekend.

export interface PaydayRange {
  startDate: string; // yyyy-mm-dd, inclusive
  endDate: string; // yyyy-mm-dd, inclusive
  /** The month this money is for, e.g. November for 30 Oct – 29 Nov. */
  year: number;
  month: number; // 0-11
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s: string, n: number) => {
  const [y, m, d] = s.split('-').map(Number);
  return iso(new Date(y, m - 1, d + n));
};

/** Rule: last day of the month; Saturday or Sunday moves back to Friday. */
export function rulePayday(year: number, month: number): string {
  const d = new Date(year, month + 1, 0);
  const dow = d.getDay(); // 0 Sun, 6 Sat
  if (dow === 6) d.setDate(d.getDate() - 1);
  if (dow === 0) d.setDate(d.getDate() - 2);
  return iso(d);
}

/** Actual salary day in the last 10 days of the month if there is one, else the rule. */
export function payday(year: number, month: number, salaryDates: string[]): string {
  const last = iso(new Date(year, month + 1, 0));
  const from = addDays(last, -9);
  const arrived = salaryDates.map((s) => s.slice(0, 10)).filter((s) => s >= from && s <= last).sort();
  return arrived[0] ?? rulePayday(year, month);
}

/** The payday month that contains `day` (default today). */
export function paydayMonth(salaryDates: string[], day: Date = new Date()): PaydayRange {
  const today = iso(day);
  const y = day.getFullYear();
  const m = day.getMonth();
  const thisPay = payday(y, m, salaryDates);
  if (today >= thisPay) {
    // Paid already: we're in next month's money.
    const ny = m === 11 ? y + 1 : y;
    const nm = (m + 1) % 12;
    return { startDate: thisPay, endDate: addDays(payday(ny, nm, salaryDates), -1), year: ny, month: nm };
  }
  const py = m === 0 ? y - 1 : y;
  const pm = (m + 11) % 12;
  return { startDate: payday(py, pm, salaryDates), endDate: addDays(thisPay, -1), year: y, month: m };
}

/** Twelve payday months of `year`: December's payday of the year before .. the day before this December's. */
export function paydayYear(year: number, salaryDates: string[]): { startDate: string; endDate: string } {
  return { startDate: payday(year - 1, 11, salaryDates), endDate: addDays(payday(year, 11, salaryDates), -1) };
}

// Run: npx tsx -e "import('./src/shared/utils/payday.ts').then(m=>console.log(m.selfCheck()))"
export function selfCheck() {
  const eq = (a: unknown, b: unknown, what: string) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${what}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
  };
  eq(rulePayday(2026, 10), '2026-11-30', 'Nov 2026 ends Monday');
  eq(rulePayday(2026, 9), '2026-10-30', 'Oct 31 2026 is Saturday -> Friday 30');
  eq(rulePayday(2026, 4), '2026-05-29', 'May 31 2026 is Sunday -> Friday 29');
  eq(rulePayday(2026, 1), '2026-02-27', 'Feb 28 2026 is Saturday -> Friday 27');
  eq(rulePayday(2028, 1), '2028-02-29', 'leap year Feb 29 2028 is Tuesday');
  eq(payday(2026, 11, ['2026-12-23']), '2026-12-23', 'early salary before Christmas holidays wins');
  eq(payday(2026, 11, ['2026-12-15']), '2026-12-31', 'mid-month transfer is not payday');
  const nov = paydayMonth(['2026-10-30'], new Date(2026, 10, 14));
  eq([nov.startDate, nov.endDate, nov.month], ['2026-10-30', '2026-11-29', 10], 'today 14 Nov is November money');
  const dec = paydayMonth([], new Date(2026, 10, 30));
  eq([dec.startDate, dec.endDate, dec.month], ['2026-11-30', '2026-12-30', 11], 'on payday we move to December');
  const jan = paydayMonth([], new Date(2027, 0, 5));
  eq([jan.startDate, jan.year, jan.month], ['2026-12-31', 2027, 0], 'January crosses the year');
  eq(paydayYear(2026, []), { startDate: '2025-12-31', endDate: '2026-12-30' }, 'payday year 2026');
  return 'ok';
}
