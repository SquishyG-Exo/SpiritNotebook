import { describe, expect, it } from 'vitest';

import { hasValidPasscode, passcodeMatches, PASSCODE_HEADER } from '../passcode';

describe('passcodeMatches', () => {
  it('accepts the configured passcode, ignoring surrounding whitespace', () => {
    expect(passcodeMatches('lotus-42', 'lotus-42')).toBe(true);
    expect(passcodeMatches('lotus-42', '  lotus-42 ')).toBe(true);
  });

  it('rejects wrong codes of any length without throwing', () => {
    for (const attempt of ['lotus-43', 'lotus', 'lotus-42-and-more', 'LOTUS-42', '']) {
      expect(passcodeMatches('lotus-42', attempt)).toBe(false);
    }
  });

  it('rejects values that are not strings', () => {
    for (const attempt of [undefined, null, 42, { code: 'lotus-42' }]) {
      expect(passcodeMatches('lotus-42', attempt)).toBe(false);
    }
  });
});

describe('hasValidPasscode', () => {
  const request = (code?: string) =>
    new Request('http://localhost/api/interpret', {
      method: 'POST',
      headers: code === undefined ? {} : { [PASSCODE_HEADER]: code },
    });

  it('lets everything through when no passcode is configured', () => {
    expect(hasValidPasscode(request(), undefined)).toBe(true);
  });

  it('checks the x-demo-passcode header when one is configured', () => {
    expect(hasValidPasscode(request(), 'lotus-42')).toBe(false);
    expect(hasValidPasscode(request('nope'), 'lotus-42')).toBe(false);
    expect(hasValidPasscode(request('lotus-42'), 'lotus-42')).toBe(true);
  });
});
