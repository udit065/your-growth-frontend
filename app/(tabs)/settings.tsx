import Ionicons from '@expo/vector-icons/Ionicons';
import dayjs from 'dayjs';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Label, tapFeedback } from '@/components/ui';
import { radius, useTheme } from '@/constants/theme';
import { API_URL } from '@/lib/config';
import { getPermission, requestPermission, type PermissionState } from '@/lib/notifications';
import { setReminder, sync, useStore } from '@/lib/store';

const HOURS = [7, 12, 18, 19, 20, 21, 22, 23];

const formatHour = (h: number) => dayjs().hour(h).minute(0).format('h A');

export default function SettingsScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const reminder = useStore((s) => s.reminder);
  const syncing = useStore((s) => s.syncing);
  const lastSyncedAt = useStore((s) => s.lastSyncedAt);
  const pendingCount = useStore((s) => Object.keys(s.pending).length);
  const error = useStore((s) => s.error);
  const [permission, setPermission] = useState<PermissionState>('undetermined');

  const refreshPermission = useCallback(() => {
    getPermission().then(setPermission).catch(() => {});
  }, []);

  useEffect(() => {
    refreshPermission();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refreshPermission());
    return () => sub.remove();
  }, [refreshPermission]);

  const toggleReminder = async (enabled: boolean) => {
    tapFeedback();
    if (enabled && permission !== 'granted' && permission !== 'unsupported') {
      const result = await requestPermission();
      setPermission(result);
    }
    setReminder({ enabled });
  };

  const blocked = reminder.enabled && permission === 'denied';

  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
    >
      <Text style={[styles.title, { color: t.text }]}>Settings</Text>

      <Card style={{ gap: 16 }}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: t.primarySoft }]}>
            <Ionicons name="notifications" size={18} color={t.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: t.text }]}>Daily reminder</Text>
            <Text style={[styles.rowSub, { color: t.muted }]}>Skipped on days you&apos;ve already checked in</Text>
          </View>
          <Switch
            value={reminder.enabled}
            onValueChange={toggleReminder}
            trackColor={{ true: t.primary, false: t.border }}
            thumbColor="#fff"
          />
        </View>

        {permission === 'unsupported' && reminder.enabled && (
          <View style={[styles.warning, { backgroundColor: t.cardAlt }]}>
            <Ionicons name="information-circle" size={18} color={t.muted} />
            <Text style={[styles.warningText, { color: t.muted }]}>
              Reminders don&apos;t work in Expo Go. They&apos;ll work in the installed app (EAS build).
            </Text>
          </View>
        )}

        {blocked && (
          <Pressable
            onPress={() => Linking.openSettings()}
            style={[styles.warning, { backgroundColor: t.warningSoft }]}
          >
            <Ionicons name="alert-circle" size={18} color={t.warning} />
            <Text style={[styles.warningText, { color: t.warning }]}>
              Notifications are turned off for this app. Tap to open settings.
            </Text>
          </Pressable>
        )}

        {reminder.enabled && (
          <View>
            <Label style={{ marginBottom: 10 }}>Remind me at</Label>
            <View style={styles.chips}>
              {HOURS.map((h) => {
                const selected = reminder.hour === h && reminder.minute === 0;
                return (
                  <Pressable
                    key={h}
                    onPress={() => {
                      tapFeedback();
                      setReminder({ hour: h, minute: 0 });
                    }}
                    style={[
                      styles.chip,
                      { borderColor: selected ? t.primary : t.border, backgroundColor: selected ? t.primary : t.card },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selected ? t.primaryText : t.text }]}>{formatHour(h)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </Card>

      <Card style={{ gap: 12 }}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: t.primarySoft }]}>
            <Ionicons name="cloud-done" size={18} color={t.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: t.text }]}>Cloud sync</Text>
            <Text style={[styles.rowSub, { color: t.muted }]}>
              {syncing
                ? 'Syncing…'
                : pendingCount > 0
                  ? `${pendingCount} change${pendingCount === 1 ? '' : 's'} waiting to upload`
                  : error
                    ? "Couldn't reach the server"
                    : lastSyncedAt
                      ? `Up to date · ${dayjs(lastSyncedAt).format('D MMM, h:mm A')}`
                      : 'Not synced yet'}
            </Text>
          </View>
        </View>
        <Button title="Sync now" variant="secondary" loading={syncing} onPress={() => sync()} />
      </Card>

      <View style={styles.about}>
        <Text style={[styles.aboutText, { color: t.muted }]}>Your Growth v{Constants.expoConfig?.version}</Text>
        <Text style={[styles.aboutText, { color: t.muted }]} numberOfLines={1}>
          {API_URL.replace(/^https?:\/\//, '')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowSub: { fontSize: 13, marginTop: 2 },
  warning: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.sm, alignItems: 'center' },
  warningText: { flex: 1, fontSize: 13, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14 },
  chipText: { fontSize: 14, fontWeight: '600' },
  about: { alignItems: 'center', gap: 2, marginTop: 8 },
  aboutText: { fontSize: 12 },
});
