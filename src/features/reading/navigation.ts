import { router } from 'expo-router';
import { Linking, Platform } from 'react-native';

import { dateKey } from '../../lib/dates';

/**
 * After saving, show the entry in the Calendar tab.
 * Contract with the Calendar screen: `date` = 'YYYY-MM-DD' (local) selects
 * that day, `highlight` = entry id to emphasise.
 *
 * `dismissTo` unwinds Explore → composer → reading back to the tabs and
 * switches to Calendar with those params (it falls back to a replace when the
 * tabs are not in the stack, e.g. after a deep link), so no stale composer is
 * left behind for the back button.
 */
export function openInCalendar(entryId: string, savedAt: Date) {
  router.dismissTo({ pathname: '/calendar', params: { date: dateKey(savedAt), highlight: entryId } });
}

/** Back to the Home tab, unwinding the flow's stack when there is one. */
export function goHome() {
  router.dismissTo('/');
}

/** tel:/sms: links. On the web, navigate in place so phones hand off to the dialer or Messages. */
export function openExternal(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.href = url;
    return;
  }
  void Linking.openURL(url).catch(() => undefined);
}
