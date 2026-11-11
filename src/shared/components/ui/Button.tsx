import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, ActivityIndicator } from 'react-native-paper';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
  color?: 'primary' | 'success' | 'error' | 'warning';
}

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
  const { accent } = useTheme();
  const buttonColor =
    color === 'primary'
      ? variant === 'contained' ? Colors.primary.main : accent
      : color === 'success'
      ? Colors.success.main
      : color === 'error'
      ? Colors.error.main
      : Colors.warning.main;

  return (
    <PaperButton
      mode={variant}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      hitSlop={size === 'small' ? { top: 6, bottom: 6 } : undefined}
      buttonColor={variant === 'contained' ? buttonColor : undefined}
      textColor={variant === 'contained' ? Colors.white : buttonColor}
      style={[
        fullWidth && styles.fullWidth,
        size === 'large' && styles.large,
        size === 'small' && styles.small,
        style,
      ]}
      contentStyle={[
        size === 'medium' && styles.mediumContent,
        size === 'large' && styles.largeContent,
        size === 'small' && styles.smallContent,
      ]}
      labelStyle={[
        size === 'large' && styles.largeLabel,
        size === 'small' && styles.smallLabel,
      ]}
    >
      {children}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  large: { borderRadius: Radius.md, height: 52 },
  small: { borderRadius: Radius.sm },
  mediumContent: { minHeight: TOUCH },
  largeContent: { height: 52, paddingHorizontal: Space.sm },
  smallContent: { height: 32, paddingHorizontal: Space.xs },
  largeLabel: { ...Type.bodyLg, fontWeight: '600' },
  smallLabel: { ...Type.caption },
});
