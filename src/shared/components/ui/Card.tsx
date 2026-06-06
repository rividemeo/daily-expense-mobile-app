import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  padding?: number;
}

const AnimatedSurface = Animated.createAnimatedComponent(Surface);

export function Card({ children, style, onPress, elevation = 1, padding = 16 }: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    if (onPress) scale.value = withSpring(1, { damping: 15 });
  };

  if (onPress) {
    return (
      <AnimatedSurface elevation={elevation} style={[styles.surface, animatedStyle, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={{ padding }}
        >
          {children}
        </TouchableOpacity>
      </AnimatedSurface>
    );
  }

  return (
    <Surface elevation={elevation} style={[styles.surface, style]}>
      <View style={{ padding }}>{children}</View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});
