import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TabBar } from '../../ui/TabBar';

/**
 * Design 4 navigation: Home · Notebook · [+] · Calendar · Favorites.
 * The centre "+" is not a route: TabBar renders it between Notebook and
 * Calendar and it opens /explore (choose what to log).
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}>
      <Tabs.Screen name="index" options={{ title: t('common.tabs.home') }} />
      <Tabs.Screen name="notebook" options={{ title: t('common.tabs.notebook') }} />
      <Tabs.Screen name="calendar" options={{ title: t('common.tabs.calendar') }} />
      <Tabs.Screen name="favorites" options={{ title: t('common.tabs.favorites') }} />
    </Tabs>
  );
}
