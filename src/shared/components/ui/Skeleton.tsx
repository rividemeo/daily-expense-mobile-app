import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/shared/constants/colors';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
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
          backgroundColor: Colors.grey[200],
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
      <Skeleton width={44} height={44} borderRadius={22} />
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
  return (
    <View style={styles.cardSkeleton}>
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
    padding: 16,
    gap: 12,
  },
  txContent: {
    flex: 1,
  },
  txAmount: {
    alignItems: 'flex-end',
  },
  gap4: { height: 4 },
  cardSkeleton: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.white,
  },
  skeletonLine: {
    marginBottom: 8,
  },
});
