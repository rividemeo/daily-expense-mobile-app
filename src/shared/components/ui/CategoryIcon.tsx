import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius } from '@/shared/constants/theme';

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
  backgroundOpacity?: number;
}

export function CategoryIcon({
  icon,
  color,
  size = 44,
  backgroundOpacity = 0.15,
}: CategoryIconProps) {
  const iconSize = size * 0.5;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: Math.min(Radius.md, size / 2), // rounded square
          backgroundColor: color + Math.round(backgroundOpacity * 255).toString(16).padStart(2, '0'),
        },
      ]}
    >
      <MaterialCommunityIcons name={icon as any} size={iconSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
