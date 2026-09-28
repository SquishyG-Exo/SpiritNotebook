/**
 * Tiny safe wrapper over web localStorage. Only used for per-device
 * conveniences (language, passcode unlock); journal state stays in memory
 * on purpose for this proof of concept.
 */
const memory = new Map<string, string>();

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function readStorage(key: string): string | null {
  if (hasLocalStorage()) {
    try {
      return localStorage.getItem(key);
    } catch {
      /* private mode, blocked storage… fall through */
    }
  }
  return memory.get(key) ?? null;
}

export function writeStorage(key: string, value: string | null): void {
  if (value === null) memory.delete(key);
  else memory.set(key, value);
  if (hasLocalStorage()) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  }
}
