import '../global.css';

import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UnlockGate } from '../features/unlock/UnlockGate';
import { initI18n } from '../i18n';
import { detectLanguage, JournalProvider, SettingsProvider } from '../state';
import { colors, fontAssets } from '../theme';

initI18n(detectLanguage());
void SplashScreen.preventAutoHideAsync();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.roseDeep,
    background: colors.cream,
    card: colors.surface,
    text: colors.ink,
    border: colors.hairline,
    notification: colors.roseDeep,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <JournalProvider>
          <ThemeProvider value={navigationTheme}>
            <StatusBar style="dark" />
            <UnlockGate>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.cream },
                }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="explore/index" />
                <Stack.Screen name="explore/[category]" />
                <Stack.Screen name="entry/new" />
                <Stack.Screen name="entry/[id]" />
              </Stack>
            </UnlockGate>
          </ThemeProvider>
        </JournalProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
