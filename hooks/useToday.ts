import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { todayKey } from '@/lib/date';

/** Today's date key; updates after midnight and when the app comes back to the foreground. */
export function useToday() {
  const [today, setToday] = useState(todayKey);
  useEffect(() => {
    const update = () => setToday(todayKey());
    const timer = setInterval(update, 60_000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && update());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return today;
}
