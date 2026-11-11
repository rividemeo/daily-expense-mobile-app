import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB as PaperFAB } from 'react-native-paper';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius } from '@/shared/constants/theme';

interface FABProps {
  icon: string;
  onPress: () => void;
  label?: string;
}

export function FAB({ icon, onPress, label }: FABProps) {
  return (
    <PaperFAB
      icon={icon}
      onPress={onPress}
      label={label}
      accessibilityLabel={label ?? (icon === 'plus' ? 'Add' : icon)}
      style={styles.fab}
      color={Colors.white}
      customSize={56}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Space.xl,
    right: Space.xl,
    backgroundColor: Colors.primary.main,
    borderRadius: Radius.lg,
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
});
