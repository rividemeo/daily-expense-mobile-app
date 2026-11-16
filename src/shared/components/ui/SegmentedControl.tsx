import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Space, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

// Segmented control: soft-gray track, orange pill on the selected segment.
interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  style?: ViewStyle;
}

export function SegmentedControl<T extends string>({ value, onChange, options, style }: SegmentedControlProps<T>) {
  const { colors, accent } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: colors.surface }, style]} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            hitSlop={{ top: 6, bottom: 6 }}
            style={[styles.seg, on && [styles.on, { backgroundColor: accent, shadowColor: accent }]]}
          >
            <Text style={[styles.label, { color: on ? '#FFFFFF' : colors.textSecondary, fontWeight: on ? '700' : '500' }]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 14, padding: 4, height: 44 },
  seg: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingHorizontal: Space.sm },
  on: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { ...Type.footnote },
});
