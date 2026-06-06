import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/shared/constants/colors';

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
  height = 8,
  showLabel = false,
  label,
  style,
  animated = true,
}: ProgressBarProps) {
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

  const color =
    clampedProgress >= 1
      ? Colors.error.main
      : clampedProgress >= 0.8
      ? Colors.warning.main
      : clampedProgress >= 0.5
      ? Colors.warning.light
      : Colors.success.main;

  return (
    <View style={style}>
      {(showLabel || label) && (
        <View style={styles.labelRow}>
          {label ? <Text variant="labelSmall" style={{ color: Colors.grey[600] }}>{label}</Text> : null}
          {showLabel && (
            <Text variant="labelSmall" style={{ color }}>
              {Math.round(clampedProgress * 100)}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
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
    backgroundColor: Colors.grey[200],
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});
