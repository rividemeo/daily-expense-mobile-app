import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
          borderRadius: size / 2,
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
