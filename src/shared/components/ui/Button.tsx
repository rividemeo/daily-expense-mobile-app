import React from 'react';
import { Pressable, StyleSheet, ViewStyle, ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Type, TOUCH, Space } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  /** contained = filled tint, outlined = gray "tinted" button, text = plain link. */
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
  color?: 'primary' | 'success' | 'error' | 'warning';
}

// iOS buttons: filled (blue, white text), tinted (light fill, blue text) or plain text.
export function Button({
  onPress,
  children,
  variant = 'contained',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = false,
  color = 'primary',
}: ButtonProps) {
  const { sys, colors } = useTheme();
  const tint = color === 'success' ? sys.green : color === 'error' ? sys.red : color === 'warning' ? sys.orange : sys.blue;
  const filled = variant === 'contained';
  const fg = filled ? '#FFFFFF' : tint;
  const bg = filled ? tint : variant === 'outlined' ? colors.surfaceAlt : 'transparent';
  const height = size === 'large' ? 50 : size === 'small' ? 32 : TOUCH;
  const label = size === 'small' ? Type.footnote : Type.bodyLg;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      hitSlop={size === 'small' ? { top: 6, bottom: 6 } : undefined}
      style={({ pressed }) => [
        styles.base,
        { height, backgroundColor: bg, borderRadius: size === 'small' ? Radius.pill : Radius.lg },
        variant === 'text' && styles.text,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.inner}>
          {icon ? <MaterialCommunityIcons name={icon as any} size={size === 'small' ? 15 : 19} color={fg} /> : null}
          <Text style={[label, { color: fg, fontWeight: '600' }]}>{children}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Space.lg },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: { paddingHorizontal: Space.sm },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.6 },
});
