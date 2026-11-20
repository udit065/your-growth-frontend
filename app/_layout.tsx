import { DarkTheme, DefaultTheme, ThemeProvider, type Theme as NavTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { palettes } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getPermission, requestPermission, rescheduleReminders } from '@/lib/notifications';
import { api } from '@/lib/api';
import { getState, hydrate, sync, useStore } from '@/lib/store';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Start loading the cache and waking the server before the first render.
hydrate();
api.wake();

function useBackgroundSync() {
  useEffect(() => {
    sync();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') sync();
    });
    return () => sub.remove();
  }, []);
}

function useReminders(hydrated: boolean) {
  const entries = useStore((s) => s.entries);
  const reminder = useStore((s) => s.reminder);

  // Ask for permission once, the first time the app runs.
  useEffect(() => {
    if (!hydrated || !getState().reminder.enabled) return;
    getPermission()
      .then(async (p) => {
        if (p !== 'undetermined') return;
        await requestPermission();
        await rescheduleReminders(getState().entries, getState().reminder);
      })
      .catch(() => {});
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => rescheduleReminders(entries, reminder).catch(() => {}), 800);
    return () => clearTimeout(timer);
  }, [hydrated, entries, reminder]);
}

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const hydrated = useStore((s) => s.hydrated);

  useBackgroundSync();
  useReminders(hydrated);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  const navTheme = useMemo<NavTheme>(() => {
    const p = palettes[scheme];
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: { ...base.colors, primary: p.primary, background: p.background, card: p.card, text: p.text, border: p.border },
    };
  }, [scheme]);

  if (!hydrated) return null;

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: palettes[scheme].background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="entry/[date]"
          options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
