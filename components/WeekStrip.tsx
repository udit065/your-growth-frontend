import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, useTheme } from '@/constants/theme';
import { DATE_FORMAT, todayKey } from '@/lib/date';
import { lastDays } from '@/lib/stats';
import type { Entry } from '@/lib/store';
import { tapFeedback } from './ui';

/** The last 7 days. Tap a day to add or edit its entry. */
export const WeekStrip = memo(function WeekStrip({ entries }: { entries: Record<string, Entry> }) {
  const t = useTheme();
  const today = todayKey();

  return (
    <View style={styles.row}>
      {lastDays(7).map((d) => {
        const key = d.format(DATE_FORMAT);
        const done = !!entries[key];
        const isToday = key === today;
        return (
          <Pressable
            key={key}
            accessibilityLabel={`${d.format('dddd D MMMM')}: ${done ? 'done' : 'missed'}`}
            onPress={() => {
              tapFeedback();
              router.push({ pathname: '/entry/[date]', params: { date: key } });
            }}
            style={({ pressed }) => [styles.day, pressed && { opacity: 0.6 }]}
            hitSlop={4}
          >
            <Text style={[styles.weekday, { color: isToday ? t.text : t.muted }]}>{d.format('dd').charAt(0)}</Text>
            <View
              style={[
                styles.dot,
                done
                  ? { backgroundColor: t.primary, borderColor: t.primary }
                  : { borderColor: isToday ? t.primary : t.border, borderStyle: isToday ? 'solid' : 'dashed' },
              ]}
            >
              {done ? (
                <Ionicons name="checkmark" size={18} color={t.primaryText} />
              ) : (
                <Text style={[styles.dayNum, { color: isToday ? t.primary : t.muted }]}>{d.date()}</Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 6, flex: 1 },
  weekday: { fontSize: 12, fontWeight: '600' },
  dot: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: { fontSize: 13, fontWeight: '700' },
});
