import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
  /** Kept for old callers; icons are now solid like iOS Settings/Wallet. */
  backgroundOpacity?: number;
}

// Solid coloured circle with a white glyph, like transaction icons in Apple Wallet.
export function CategoryIcon({ icon, color, size = 44 }: CategoryIconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons name={icon as any} size={size * 0.52} color="#FFFFFF" />
    </View>
  );
}
