import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB as PaperFAB } from 'react-native-paper';
import { Colors } from '@/shared/constants/colors';

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
      style={styles.fab}
      color={Colors.white}
      customSize={56}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.primary.main,
    borderRadius: 16,
    elevation: 6,
  },
});
