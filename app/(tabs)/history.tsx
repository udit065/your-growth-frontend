import Ionicons from '@expo/vector-icons/Ionicons';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SyncStatus } from '@/components/SyncStatus';
import { Button, tapFeedback } from '@/components/ui';
import { radius, useTheme, type Theme } from '@/constants/theme';
import { todayKey } from '@/lib/date';
import { sync, useEntries, type Entry } from '@/lib/store';

type Section = { key: string; title: string; count: number; total: number; data: Entry[]; allData: Entry[] };

const openEntry = (date: string) => router.push({ pathname: '/entry/[date]', params: { date } });

export default function HistoryScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const entries = useEntries();
  const [refreshing, setRefreshing] = useState(false);
  const currentMonth = todayKey().slice(0, 7);
  // Months the user has toggled away from the default (current month open, others closed).
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const byMonth = new Map<string, Entry[]>();
    for (const e of Object.values(entries).sort((a, b) => (a.date < b.date ? 1 : -1))) {
      const key = e.date.slice(0, 7);
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key)!.push(e);
    }
    return [...byMonth.entries()].map(([key, list]) => {
      const m = dayjs(`${key}-01`);
      const total = key === currentMonth ? dayjs().date() : m.daysInMonth();
      return { key, title: m.format('MMMM YYYY'), count: list.length, total, allData: list };
    });
  }, [entries, currentMonth]);

  const sections: Section[] = useMemo(
    () =>
      groups.map((g) => {
        const open = (g.key === currentMonth) !== !!toggled[g.key];
        return { ...g, data: open ? g.allData : [] };
      }),
    [groups, toggled, currentMonth]
  );

  const toggle = useCallback((key: string) => {
    tapFeedback();
    setToggled((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await sync();
    setRefreshing(false);
  };

  const total = Object.keys(entries).length;

  return (
    <SectionList
      style={{ backgroundColor: t.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      sections={sections}
      keyExtractor={(item) => item.date}
      stickySectionHeadersEnabled={false}
      initialNumToRender={12}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} colors={[t.primary]} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text }]}>Your Progress</Text>
          <Text style={[styles.subtitle, { color: t.muted }]}>Consistency is a myth when you are overloaded</Text>
          {total > 0 && (
            <Text style={[styles.total, { color: t.primary }]}>
              {total} day{total === 1 ? '' : 's'} you showed up
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="leaf-outline" size={48} color={t.muted} />
          <Text style={[styles.emptyTitle, { color: t.text }]}>No entries yet</Text>
          <Text style={[styles.emptyText, { color: t.muted }]}>Your check-ins will show up here.</Text>
          <Button title="Log today" onPress={() => openEntry(todayKey())} style={{ marginTop: 8 }} />
        </View>
      }
      ListFooterComponent={<SyncStatus />}
      renderSectionHeader={({ section }) => (
        <MonthHeader section={section} open={section.data.length > 0} onPress={toggle} theme={t} />
      )}
      renderItem={({ item }) => <EntryRow entry={item} theme={t} />}
      SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
    />
  );
}

const MonthHeader = memo(function MonthHeader({
  section,
  open,
  onPress,
  theme: t,
}: {
  section: Section;
  open: boolean;
  onPress: (key: string) => void;
  theme: Theme;
}) {
  const pct = Math.min(1, section.count / section.total);
  return (
    <Pressable
      onPress={() => onPress(section.key)}
      style={({ pressed }) => [styles.month, { backgroundColor: t.card, borderColor: t.border }, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.monthTop}>
        <Text style={[styles.monthTitle, { color: t.text }]}>{section.title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={t.muted} />
      </View>
      <Text style={[styles.monthSummary, { color: t.muted }]}>
        You improved {section.count} of {section.total} day{section.total === 1 ? '' : 's'}
      </Text>
      <View style={[styles.bar, { backgroundColor: t.cardAlt }]}>
        <View style={[styles.barFill, { backgroundColor: t.primary, width: `${pct * 100}%` }]} />
      </View>
    </Pressable>
  );
});

const EntryRow = memo(function EntryRow({ entry, theme: t }: { entry: Entry; theme: Theme }) {
  const d = dayjs(entry.date);
  return (
    <Pressable
      onPress={() => openEntry(entry.date)}
      style={({ pressed }) => [styles.row, { backgroundColor: t.card, borderColor: t.border }, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.dateBadge, { backgroundColor: t.primarySoft }]}>
        <Text style={[styles.dateNum, { color: t.primary }]}>{d.date()}</Text>
        <Text style={[styles.dateDay, { color: t.primary }]}>{d.format('ddd')}</Text>
      </View>
      <Text style={[styles.rowText, { color: t.text }]} numberOfLines={4}>
        {entry.response}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, fontStyle: 'italic', marginTop: 4 },
  total: { fontSize: 14, fontWeight: '700', marginTop: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptyText: { fontSize: 14 },
  month: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  monthTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthTitle: { fontSize: 17, fontWeight: '800' },
  monthSummary: { fontSize: 13, marginTop: 4 },
  bar: { height: 6, borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
  },
  dateBadge: { width: 48, borderRadius: radius.sm, paddingVertical: 6, alignItems: 'center' },
  dateNum: { fontSize: 18, fontWeight: '800' },
  dateDay: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  rowText: { flex: 1, fontSize: 15, lineHeight: 21 },
});
