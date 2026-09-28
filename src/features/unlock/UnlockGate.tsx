import type { ReactNode } from 'react';

/**
 * Wraps the app shell. When the server reports that a passcode is required
 * (GET /api/unlock → { required: true }) and this device hasn't unlocked yet,
 * render the passcode screen instead of `children`.
 *
 * PLACEHOLDER: passes through until the unlock feature is implemented.
 */
export function UnlockGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
