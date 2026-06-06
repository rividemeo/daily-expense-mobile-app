import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, ActivityIndicator } from 'react-native-paper';
import { Colors } from '@/shared/constants/colors';

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
  const buttonColor =
    color === 'primary'
      ? Colors.primary.main
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
      buttonColor={variant === 'contained' ? buttonColor : undefined}
      textColor={variant === 'contained' ? Colors.white : buttonColor}
      style={[
        fullWidth && styles.fullWidth,
        size === 'large' && styles.large,
        size === 'small' && styles.small,
        style,
      ]}
      contentStyle={[
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
  large: { borderRadius: 12, height: 52 },
  small: { borderRadius: 8 },
  largeContent: { height: 52, paddingHorizontal: 8 },
  smallContent: { height: 32, paddingHorizontal: 4 },
  largeLabel: { fontSize: 16, fontWeight: '600' },
  smallLabel: { fontSize: 12 },
});
