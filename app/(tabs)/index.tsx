import Ionicons from '@expo/vector-icons/Ionicons';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SyncStatus } from '@/components/SyncStatus';
import { Button, Card, Label } from '@/components/ui';
import { WeekStrip } from '@/components/WeekStrip';
import { radius, useTheme } from '@/constants/theme';
import { useToday } from '@/hooks/useToday';
import { DATE_FORMAT, greeting } from '@/lib/date';
import { bestStreak, countThisMonth, currentStreak } from '@/lib/stats';
import { sync, useEntries } from '@/lib/store';

const openEntry = (date: string) => router.push({ pathname: '/entry/[date]', params: { date } });

export default function TodayScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const entries = useEntries();
  const today = useToday();
  const yesterday = dayjs(today).subtract(1, 'day').format(DATE_FORMAT);
  const [refreshing, setRefreshing] = useState(false);

  const todayEntry = entries[today];
  const missedYesterday = !entries[yesterday];

  const stats = useMemo(
    () => ({ streak: currentStreak(entries), best: bestStreak(entries), month: countThisMonth(entries) }),
    // `today` is a dependency so stats roll over at midnight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, today]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await sync();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} colors={[t.primary]} />}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: t.muted }]}>{greeting()}</Text>
        <Text style={[styles.date, { color: t.text }]}>{dayjs(today).format('dddd, D MMMM')}</Text>
      </View>

      {!todayEntry && missedYesterday && (
        <View style={[styles.banner, { backgroundColor: t.warningSoft }]}>
          <Ionicons name="flame" size={20} color={t.warning} />
          <Text style={[styles.bannerText, { color: t.warning }]}>Don&apos;t miss twice in a row. Today counts.</Text>
        </View>
      )}

      {todayEntry ? (
        <Pressable onPress={() => openEntry(today)} style={({ pressed }) => pressed && { opacity: 0.8 }}>
          <Card style={{ backgroundColor: t.primarySoft, borderColor: t.primarySoft }}>
            <View style={styles.doneRow}>
              <View style={[styles.doneIcon, { backgroundColor: t.primary }]}>
                <Ionicons name="checkmark" size={22} color={t.primaryText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.doneTitle, { color: t.text }]}>Done for today 🎉</Text>
                <Text style={[styles.doneHint, { color: t.muted }]}>Tap to edit</Text>
              </View>
            </View>
            <Text style={[styles.response, { color: t.text }]}>{todayEntry.response}</Text>
          </Card>
        </Pressable>
      ) : (
        <Card>
          <Label>Today</Label>
          <Text style={[styles.question, { color: t.text }]}>Did I try today?</Text>
          <Button
            title="Yes, log it"
            icon={<Ionicons name="checkmark-circle" size={20} color={t.primaryText} />}
            onPress={() => openEntry(today)}
          />
        </Card>
      )}

      {missedYesterday && (
        <Card style={styles.yesterdayCard}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.yesterdayTitle, { color: t.text }]}>Missed yesterday?</Text>
            <Text style={[styles.yesterdayText, { color: t.muted }]}>If you did something, add it now.</Text>
          </View>
          <Button
            title="Add"
            variant="secondary"
            icon={<Ionicons name="add" size={18} color={t.primary} />}
            onPress={() => openEntry(yesterday)}
            style={styles.smallButton}
          />
        </Card>
      )}

      <View style={styles.stats}>
        <Stat label="Streak" value={stats.streak} icon="flame" color={t.warning} />
        <Stat label="Best" value={stats.best} icon="trophy" color={t.primary} />
        <Stat label="This month" value={stats.month} icon="calendar" color={t.primary} />
      </View>

      <Card>
        <Label style={{ marginBottom: 14 }}>Last 7 days</Label>
        <WeekStrip entries={entries} />
      </Card>

      <SyncStatus />
    </ScrollView>
  );
}

function Stat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  const t = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: t.card, borderColor: t.border }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.statValue, { color: t.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: t.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14, paddingBottom: 32 },
  header: { marginBottom: 6 },
  greeting: { fontSize: 15, fontWeight: '600' },
  date: { fontSize: 28, fontWeight: '800', marginTop: 2 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.md },
  bannerText: { fontSize: 14, fontWeight: '700', flex: 1 },
  question: { fontSize: 24, fontWeight: '800', marginTop: 8, marginBottom: 18 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doneIcon: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontSize: 18, fontWeight: '800' },
  doneHint: { fontSize: 13, marginTop: 1 },
  response: { fontSize: 16, lineHeight: 23, marginTop: 14 },
  yesterdayCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  yesterdayTitle: { fontSize: 16, fontWeight: '700' },
  yesterdayText: { fontSize: 14, marginTop: 2 },
  smallButton: { minHeight: 42, paddingHorizontal: 16 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 12, fontWeight: '600' },
});
