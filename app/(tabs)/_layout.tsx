import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet, type ColorValue } from 'react-native';
import { tapFeedback } from '@/components/ui';
import { useTheme } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function icon(active: IconName, inactive: IconName) {
  const TabIcon = ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={24} color={color as string} />
  );
  return TabIcon;
}

export default function TabLayout() {
  const t = useTheme();

  return (
    <Tabs
      screenListeners={{ tabPress: tapFeedback }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border, borderTopWidth: StyleSheet.hairlineWidth },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: t.background },
        animation: 'shift',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('leaf', 'leaf-outline') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('calendar', 'calendar-outline') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('settings', 'settings-outline') }} />
    </Tabs>
  );
}
