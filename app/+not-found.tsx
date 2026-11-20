import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui';
import { useTheme } from '@/constants/theme';

export default function NotFoundScreen() {
  const t = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <Text style={[styles.title, { color: t.text }]}>This screen doesn&apos;t exist.</Text>
      <Button title="Go to Today" onPress={() => router.replace('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  title: { fontSize: 20, fontWeight: '700' },
});
