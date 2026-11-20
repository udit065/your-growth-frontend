import * as Haptics from 'expo-haptics';
import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { radius, useTheme } from '@/constants/theme';

export function tapFeedback() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, style]}>{children}</View>
  );
}

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: ReactNode;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, variant = 'primary', icon, loading, disabled, style, onPress, ...rest }: ButtonProps) {
  const t = useTheme();
  const colors = {
    primary: { bg: t.primary, fg: t.primaryText },
    secondary: { bg: t.primarySoft, fg: t.primary },
    danger: { bg: t.dangerSoft, fg: t.danger },
    ghost: { bg: 'transparent', fg: t.muted },
  }[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={(e) => {
        tapFeedback();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.bg, opacity: isDisabled ? 0.45 : pressed ? 0.85 : 1 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.fg} />
      ) : (
        <>
          {icon}
          <Text style={[styles.buttonText, { color: colors.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[styles.label, { color: t.muted }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
