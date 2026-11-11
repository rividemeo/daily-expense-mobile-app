import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<Exclude<BadgeVariant, 'default'>, { bg: string; dark: string; text: string; darkText: string }> = {
  success: { bg: Colors.success.background, dark: 'rgba(74,222,128,0.12)', text: Colors.success.main, darkText: Colors.success.light },
  warning: { bg: Colors.warning.background, dark: 'rgba(251,191,36,0.12)', text: Colors.warning.main, darkText: Colors.warning.light },
  error: { bg: Colors.error.background, dark: 'rgba(248,113,113,0.12)', text: Colors.error.main, darkText: Colors.error.light },
  info: { bg: Colors.info.background, dark: 'rgba(56,189,248,0.12)', text: Colors.info.main, darkText: Colors.info.light },
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { colors, isDark } = useTheme();
  const v = variant === 'default' ? null : VARIANT_COLORS[variant];
  const bg = v ? (isDark ? v.dark : v.bg) : colors.surfaceAlt;
  const text = v ? (isDark ? v.darkText : v.text) : colors.textSecondary;
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Space.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    ...Type.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
