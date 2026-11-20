import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/constants/theme';
import { useStore } from '@/lib/store';

/** Small, quiet indicator. Only shows when there is something worth knowing. */
export function SyncStatus() {
  const t = useTheme();
  const pendingCount = useStore((s) => Object.keys(s.pending).length);
  const syncing = useStore((s) => s.syncing);
  const error = useStore((s) => s.error);

  if (pendingCount === 0 && !error) return null;

  const text =
    pendingCount > 0
      ? syncing
        ? 'Saving to the cloud…'
        : `Saved on this phone · will sync when online`
      : syncing
        ? 'Refreshing…'
        : "Couldn't reach the server · showing saved data";

  return (
    <View style={styles.row}>
      <Ionicons
        name={pendingCount > 0 && !syncing ? 'cloud-offline-outline' : 'cloud-upload-outline'}
        size={14}
        color={t.muted}
      />
      <Text style={[styles.text, { color: t.muted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 6 },
  text: { fontSize: 12 },
});
