import dayjs from 'dayjs';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DATE_FORMAT } from './date';
import type { Entry } from './api';
import type { ReminderSettings } from './store';

const CHANNEL_ID = 'daily-reminder';
const DAYS_AHEAD = 14;
// Expo Go on Android can't create notification channels, so reminders only work
// in a real build (EAS) there.
export const isExpoGoAndroid =
  Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const supported = (Platform.OS === 'android' || Platform.OS === 'ios') && !isExpoGoAndroid;

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function getPermission(): Promise<PermissionState> {
  if (!supported) return 'unsupported';
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status as PermissionState;
  } catch {
    return 'unsupported';
  }
}

async function ensureChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily reminder',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function requestPermission(): Promise<PermissionState> {
  if (!supported) return 'unsupported';
  // Android 13+ only shows the permission prompt once a channel exists.
  try {
    await ensureChannel();
    const { status } = await Notifications.requestPermissionsAsync();
    return status as PermissionState;
  } catch {
    return 'unsupported';
  }
}

/**
 * Schedules one reminder per day for the next two weeks, skipping today if it is
 * already done. Re-run whenever entries or settings change.
 */
export async function rescheduleReminders(entries: Record<string, Entry>, settings: ReminderSettings) {
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled || (await getPermission()) !== 'granted') return;
  await ensureChannel();

  const now = dayjs();
  const today = now.format(DATE_FORMAT);
  const missedYesterday = !entries[now.subtract(1, 'day').format(DATE_FORMAT)];

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const at = now.add(i, 'day').hour(settings.hour).minute(settings.minute).second(0).millisecond(0);
    if (at.isBefore(now)) continue;
    if (i === 0 && entries[today]) continue;

    const dontMissTwice = i === 0 && missedYesterday;
    await Notifications.scheduleNotificationAsync({
      content: dontMissTwice
        ? {
            title: "Don't miss twice 💪",
            body: 'You skipped yesterday. A 10-second check-in today keeps you on track.',
          }
        : {
            title: 'Did you try today? 🌱',
            body: 'Log one thing you did for yourself today.',
          },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at.toDate(),
        channelId: CHANNEL_ID,
      },
    });
  }
}
