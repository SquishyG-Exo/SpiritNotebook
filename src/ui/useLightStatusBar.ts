import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';

/** Light status bar text while a screen with the violet header band is focused (no-op on web). */
export function useLightStatusBar(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      setStatusBarStyle('light', true);
      return () => setStatusBarStyle('dark', true);
    }, [enabled]),
  );
}
