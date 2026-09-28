import { useEffect, useState, type ReactNode } from 'react';

import { getStoredPasscode, getUnlockStatus, storePasscode, unlockWithPasscode } from '../../api/client';
import { useSettings } from '../../state';
import { UnlockScreen } from './UnlockScreen';
import { UnlockSplash } from './UnlockSplash';

type GateResult = 'open' | 'unlocked' | 'locked';

/**
 * Decides whether this device may see the app. Never blocks the demo on an
 * infrastructure hiccup: if the status check fails (no API server during
 * `expo start --web`, network error, unexpected response) the app opens.
 */
async function resolveGate(): Promise<GateResult> {
  let required: boolean;
  try {
    const status: unknown = await getUnlockStatus();
    if (!status || typeof (status as { required?: unknown }).required !== 'boolean') {
      console.warn('[unlock] Unexpected /api/unlock response; continuing without the passcode gate.');
      return 'open';
    }
    required = (status as { required: boolean }).required;
  } catch (error) {
    console.warn('[unlock] Could not check the passcode requirement; continuing without it.', error);
    return 'open';
  }
  if (!required) return 'open';

  const stored = getStoredPasscode();
  if (stored) {
    try {
      if (await unlockWithPasscode(stored)) return 'unlocked';
      storePasscode(null); // the passcode changed since this device last unlocked
    } catch {
      /* server hiccup: fall through and let the person enter it again */
    }
  }
  return 'locked';
}

/**
 * Wraps the app shell. When the server reports that a passcode is required
 * (GET /api/unlock → { required: true }) and this device hasn't unlocked yet,
 * render the passcode screen instead of `children`.
 */
export function UnlockGate({ children }: { children: ReactNode }) {
  const { unlocked, setUnlocked } = useSettings();
  const [gate, setGate] = useState<GateResult | 'checking'>('checking');

  useEffect(() => {
    let active = true;
    void resolveGate().then((result) => {
      if (!active) return;
      if (result === 'unlocked') setUnlocked(true);
      setGate(result);
    });
    return () => {
      active = false;
    };
  }, [setUnlocked]);

  if (unlocked || gate === 'open' || gate === 'unlocked') return <>{children}</>;
  if (gate === 'checking') return <UnlockSplash />;
  return <UnlockScreen onUnlocked={() => setUnlocked(true)} />;
}
