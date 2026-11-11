import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Space, Radius } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.sm, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.track,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function TransactionSkeleton() {
  return (
    <View style={styles.transactionSkeleton}>
      <Skeleton width={44} height={44} borderRadius={Radius.md} />
      <View style={styles.txContent}>
        <Skeleton width={'60%'} height={14} />
        <View style={styles.gap4} />
        <Skeleton width={'40%'} height={10} />
      </View>
      <View style={styles.txAmount}>
        <Skeleton width={64} height={14} />
      </View>
    </View>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.cardSkeleton, { backgroundColor: colors.surface }]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === 0 ? '80%' : i === lines - 1 ? '50%' : '100%'}
          style={styles.skeletonLine}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  transactionSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.lg,
    gap: Space.md,
  },
  txContent: {
    flex: 1,
  },
  txAmount: {
    alignItems: 'flex-end',
  },
  gap4: { height: Space.xs },
  cardSkeleton: {
    padding: Space.lg,
    borderRadius: Radius.lg,
  },
  skeletonLine: {
    marginBottom: Space.sm,
  },
});
