import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Space, Type, TOUCH } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

// iOS navigation header. Tab roots use the 34pt large title; pushed screens pass
// `back` to get a blue "‹ Back" button and a centred 17pt title instead.
interface LargeTitleProps {
  title: string;
  subtitle?: string;
  back?: boolean | string;
  /** Right-hand buttons, e.g. <HeaderButton icon="add" .../>. */
  right?: React.ReactNode;
}

export function LargeTitle({ title, subtitle, back, right }: LargeTitleProps) {
  const { colors, accent } = useTheme();
  if (back) {
    return (
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={accent} />
          <Text style={[Type.bodyLg, { color: accent }]}>{typeof back === 'string' ? back : 'Back'}</Text>
        </Pressable>
        <Text style={[styles.barTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
        <View style={styles.barRight}>{right}</View>
      </View>
    );
  }
  return (
    <View style={styles.large}>
      <View style={{ flex: 1 }}>
        {subtitle ? <Text style={[Type.footnote, { color: colors.textSecondary, fontWeight: '600' }]}>{subtitle.toUpperCase()}</Text> : null}
        <Text style={[Type.display, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      </View>
      {right ? <View style={styles.largeRight}>{right}</View> : null}
    </View>
  );
}

export function HeaderButton({ icon, onPress, label }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string }) {
  const { accent } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.btn} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}>
      {({ pressed }) => <Ionicons name={icon} size={26} color={accent} style={{ opacity: pressed ? 0.4 : 1 }} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  large: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Space.lg, paddingTop: Space.sm, paddingBottom: Space.sm },
  largeRight: { flexDirection: 'row', alignItems: 'center', gap: Space.xs, marginBottom: 2 },
  bar: { height: TOUCH + 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Space.sm },
  back: { flexDirection: 'row', alignItems: 'center', minWidth: 90, minHeight: TOUCH },
  barTitle: { ...Type.title, flex: 1, textAlign: 'center' },
  barRight: { minWidth: 90, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  btn: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
});
