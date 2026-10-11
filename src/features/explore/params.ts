const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * The optional `date` search param (YYYY-MM-DD) that /explore and
 * /explore/life pass through to the composer. Anything else, including an
 * impossible day such as 2026-02-31, is dropped.
 */
export function dateParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const match = raw ? DATE_KEY.exec(raw) : null;
  if (!match) return undefined;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? raw : undefined;
}

/** `{ date }` when there is one, ready to spread into router params. */
export const withDate = (date: string | undefined): { date?: string } => (date ? { date } : {});
