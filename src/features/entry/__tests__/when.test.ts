import { describe, expect, it } from 'vitest';

import {
  buildMonthGrid,
  combineDayAndTime,
  isAfterToday,
  parseDayParam,
  relativeDay,
  setPm,
  stepHour,
  stepMinute,
  toTwelveHour,
} from '../when';

/** Sunday, October 11, 2026, 9:41 local time. */
const NOW = new Date(2026, 9, 11, 9, 41);

describe('time steppers', () => {
  it('cycles the hour 1…12 within the same half of the day', () => {
    expect(stepHour({ hour: 11, minute: 5 }, 1)).toEqual({ hour: 0, minute: 5 }); // 11 AM → 12 AM
    expect(stepHour({ hour: 0, minute: 5 }, 1)).toEqual({ hour: 1, minute: 5 }); // 12 AM → 1 AM
    expect(stepHour({ hour: 12, minute: 0 }, -1)).toEqual({ hour: 23, minute: 0 }); // 12 PM → 11 PM
    expect(stepHour({ hour: 23, minute: 0 }, 1)).toEqual({ hour: 12, minute: 0 }); // 11 PM → 12 PM
  });

  it('snaps minutes to five-minute steps and wraps within the hour', () => {
    expect(stepMinute({ hour: 9, minute: 41 }, 1).minute).toBe(45);
    expect(stepMinute({ hour: 9, minute: 41 }, -1).minute).toBe(40);
    expect(stepMinute({ hour: 9, minute: 40 }, -1).minute).toBe(35);
    expect(stepMinute({ hour: 9, minute: 57 }, 1)).toEqual({ hour: 9, minute: 0 });
    expect(stepMinute({ hour: 9, minute: 0 }, -1)).toEqual({ hour: 9, minute: 55 });
  });

  it('switches AM / PM without moving the hour on the clock face', () => {
    expect(toTwelveHour({ hour: 0, minute: 0 })).toEqual({ hour12: 12, pm: false });
    expect(toTwelveHour({ hour: 12, minute: 0 })).toEqual({ hour12: 12, pm: true });
    expect(setPm({ hour: 9, minute: 0 }, true).hour).toBe(21);
    expect(setPm({ hour: 12, minute: 30 }, false).hour).toBe(0);
  });
});

describe('the moment to store', () => {
  it('uses the chosen time, or local noon when there is none', () => {
    const withTime = combineDayAndTime(new Date(2026, 4, 18), { hour: 21, minute: 15 });
    expect([withTime.getFullYear(), withTime.getMonth(), withTime.getDate()]).toEqual([2026, 4, 18]);
    expect([withTime.getHours(), withTime.getMinutes()]).toEqual([21, 15]);
    expect(combineDayAndTime(new Date(2026, 4, 18), null).getHours()).toBe(12);
  });
});

describe('the date param and future days', () => {
  it('accepts real past days and today, and ignores the rest', () => {
    expect(parseDayParam('2026-05-18', NOW)?.getDate()).toBe(18);
    expect(parseDayParam('2026-10-11', NOW)?.getHours()).toBe(0);
    expect(parseDayParam('2026-10-12', NOW)).toBeUndefined();
    expect(parseDayParam('2026-02-31', NOW)).toBeUndefined();
    expect(parseDayParam('18/05/2026', NOW)).toBeUndefined();
    expect(parseDayParam(undefined, NOW)).toBeUndefined();
  });

  it('treats any time tomorrow as the future, and late tonight as today', () => {
    expect(isAfterToday(new Date(2026, 9, 11, 23, 59), NOW)).toBe(false);
    expect(isAfterToday(new Date(2026, 9, 12, 0, 0), NOW)).toBe(true);
  });

  it('names today and yesterday', () => {
    expect(relativeDay(new Date(2026, 9, 11), NOW)).toBe('today');
    expect(relativeDay(new Date(2026, 9, 10), NOW)).toBe('yesterday');
    expect(relativeDay(new Date(2026, 9, 9), NOW)).toBeNull();
  });

  it('builds a Sunday-first month grid that marks the days after today', () => {
    const cells = buildMonthGrid({ year: 2026, month: 9 }, NOW).flat();
    expect(cells).toHaveLength(42);
    expect(cells[0].key).toBe('2026-09-27');
    expect(cells.find((c) => c.key === '2026-10-11')?.future).toBe(false);
    expect(cells.find((c) => c.key === '2026-10-12')?.future).toBe(true);
  });
});
