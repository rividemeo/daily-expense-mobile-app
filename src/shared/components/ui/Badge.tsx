import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

// iOS tinted capsule: system colour text on a 15% fill of the same colour.
export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { colors, sys } = useTheme();
  const tint =
    variant === 'success' ? sys.green
    : variant === 'warning' ? sys.orange
    : variant === 'error' ? sys.red
    : variant === 'info' ? sys.blue
    : null;
  return (
    <View style={[styles.badge, { backgroundColor: tint ? tint + '26' : colors.surfaceAlt }, style]}>
      <Text style={[styles.label, { color: tint ?? colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: Space.sm, paddingVertical: 2, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  label: { ...Type.caption, fontWeight: '600' },
});
