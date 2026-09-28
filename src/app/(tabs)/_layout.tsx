import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TabBar } from '../../ui/TabBar';

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}>
      <Tabs.Screen name="index" options={{ title: t('common.tabs.home') }} />
      <Tabs.Screen name="calendar" options={{ title: t('common.tabs.calendar') }} />
      <Tabs.Screen name="insights" options={{ title: t('common.tabs.insights') }} />
      <Tabs.Screen name="profile" options={{ title: t('common.tabs.profile') }} />
    </Tabs>
  );
}
