import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Space, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceAlt }]}>
        <MaterialCommunityIcons name={icon as any} size={48} color={colors.textTertiary} />
      </View>
      <Text variant="titleMedium" style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.xl,
  },
  title: {
    ...Type.title,
    textAlign: 'center',
    marginBottom: Space.sm,
  },
  description: {
    ...Type.body,
    textAlign: 'center',
    marginBottom: Space.xl,
  },
  button: {
    minWidth: 160,
  },
});
