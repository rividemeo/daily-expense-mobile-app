import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Space, Type, TOUCH } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

// Screen header: centred bold title between round buttons, same as Home.
// Pushed screens pass `back` to get a round chevron button on the left.
interface LargeTitleProps {
  title: string;
  subtitle?: string;
  /** Any truthy value shows the back button (the string form is kept for old callers). */
  back?: boolean | string;
  /** Right-hand buttons, e.g. <HeaderButton icon="add" .../>. */
  right?: React.ReactNode;
}

export function LargeTitle({ title, subtitle, back, right }: LargeTitleProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {back ? <HeaderButton icon="chevron-back" label="Back" onPress={() => router.back()} /> : null}
      </View>
      <View style={styles.middle}>
        <Text style={[Type.title3, { color: colors.text, textAlign: 'center' }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[Type.caption, { color: colors.textSecondary, textAlign: 'center' }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

// Round soft-gray button with a dark glyph.
export function HeaderButton({ icon, onPress, label }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [styles.btn, { backgroundColor: pressed ? colors.pressed : colors.surface }]}
    >
      <Ionicons name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Space.lg, paddingVertical: Space.sm, gap: Space.sm },
  side: { minWidth: TOUCH * 2 + Space.sm, flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  right: { justifyContent: 'flex-end' },
  middle: { flex: 1 },
  btn: { width: TOUCH, height: TOUCH, borderRadius: TOUCH / 2, alignItems: 'center', justifyContent: 'center' },
});
