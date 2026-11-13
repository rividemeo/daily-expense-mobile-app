import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Space, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

// iOS segmented control: gray track, white sliding pill on the selected segment.
interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  style?: ViewStyle;
}

export function SegmentedControl<T extends string>({ value, onChange, options, style }: SegmentedControlProps<T>) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceAlt }, style]} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            hitSlop={{ top: 6, bottom: 6 }}
            style={[styles.seg, on && [styles.on, { backgroundColor: isDark ? '#636366' : '#FFFFFF' }]]}
          >
            <Text style={[styles.label, { color: colors.text, fontWeight: on ? '600' : '500' }]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 9, padding: 2, height: 34 },
  seg: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 7, paddingHorizontal: Space.sm },
  on: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { ...Type.footnote },
});
