import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Space } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  progress: number;
  height?: number;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  height = 6,
  showLabel = false,
  label,
  style,
  animated = true,
}: ProgressBarProps) {
  const { colors, sys } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const width = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      width.value = withTiming(clampedProgress * 100, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      width.value = clampedProgress * 100;
    }
  }, [clampedProgress, animated, width]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  // iOS system fills: green, orange near the limit, red over it.
  const color = clampedProgress >= 1 ? sys.red : clampedProgress >= 0.8 ? sys.orange : sys.green;

  return (
    <View style={style}>
      {(showLabel || label) && (
        <View style={styles.labelRow}>
          {label ? <Text variant="labelSmall" style={{ color: colors.textSecondary }}>{label}</Text> : null}
          {showLabel && (
            <Text variant="labelSmall" style={{ color }}>
              {Math.round(clampedProgress * 100)}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.track }]}>
        <Animated.View
          style={[
            styles.fill,
            { height, borderRadius: height / 2, backgroundColor: color },
            animatedBarStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Space.xs,
  },
});
