import Ionicons from '@expo/vector-icons/Ionicons';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { radius, useTheme } from '@/constants/theme';
import { isValidDayKey, relativeDayLabel, todayKey } from '@/lib/date';
import { deleteEntry, saveEntry, useStore } from '@/lib/store';

const MAX_LENGTH = 2000;

const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

export default function EntryScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { date: param } = useLocalSearchParams<{ date: string }>();
  const date = isValidDayKey(param) ? param : todayKey();
  const existing = useStore((s) => s.entries[date]);
  const [text, setText] = useState(existing?.response ?? '');

  const isToday = date === todayKey();
  const isFuture = date > todayKey();
  const trimmed = text.trim();
  const canSave = trimmed.length > 0 && trimmed !== existing?.response;

  const onSave = () => {
    if (!canSave) return;
    saveEntry(date, trimmed);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    close();
  };

  const onDelete = () => {
    Alert.alert('Delete this entry?', `${relativeDayLabel(date)} will be marked as missed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEntry(date);
          close();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 12 }]}>
        <View>
          <Text style={[styles.title, { color: t.text }]}>{relativeDayLabel(date)}</Text>
          <Text style={[styles.subtitle, { color: t.muted }]}>{dayjs(date).format('dddd, D MMMM YYYY')}</Text>
        </View>
        <Pressable
          onPress={close}
          hitSlop={12}
          accessibilityLabel="Close"
          style={[styles.closeButton, { backgroundColor: t.cardAlt }]}
        >
          <Ionicons name="close" size={20} color={t.text} />
        </Pressable>
      </View>

      {isFuture ? (
        <View style={styles.body}>
          <Text style={[styles.question, { color: t.text }]}>You can&apos;t log a day that hasn&apos;t happened yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={[styles.question, { color: t.text }]}>
            What&apos;s one thing you did for yourself {isToday ? 'today' : 'that day'}?
          </Text>

          <TextInput
            value={text}
            onChangeText={setText}
            autoFocus
            multiline
            maxLength={MAX_LENGTH}
            placeholder="Even something small counts…"
            placeholderTextColor={t.muted}
            textAlignVertical="top"
            style={[styles.input, { color: t.text, backgroundColor: t.card, borderColor: t.border }]}
          />
          {text.length > MAX_LENGTH * 0.8 && (
            <Text style={[styles.counter, { color: t.muted }]}>
              {text.length}/{MAX_LENGTH}
            </Text>
          )}

          <Button title={existing ? 'Save changes' : 'Save'} disabled={!canSave} onPress={onSave} />
          {existing && (
            <Button
              title="Delete entry"
              variant="danger"
              icon={<Ionicons name="trash-outline" size={18} color={t.danger} />}
              onPress={onDelete}
              style={{ marginTop: 4 }}
            />
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  closeButton: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 14 },
  question: { fontSize: 20, fontWeight: '700', lineHeight: 27 },
  input: {
    minHeight: 160,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    fontSize: 17,
    lineHeight: 24,
  },
  counter: { fontSize: 12, textAlign: 'right', marginTop: -8 },
});
