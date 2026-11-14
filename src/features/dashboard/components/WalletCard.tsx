import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Money } from '@/shared/components/ui/Money';

interface WalletCardProps {
  name: string;
  icon: string;
  color: string;
  amount: number;
  currency: string;
  hidden?: boolean;
  onPress?: () => void;
}

// A category drawn as a coloured wallet: dark back flap, white paper peeking out,
// bright front pocket with the icon, name and amount spent.
export function WalletCard({ name, icon, color, amount, currency, hidden, onPress }: WalletCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, see details`}
      style={({ pressed }) => [styles.wrap, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.back, { backgroundColor: color }]}>
        <View style={styles.backShade} />
      </View>
      <View style={styles.paper} />
      <View style={[styles.front, { backgroundColor: color }]}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon as any} size={18} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Money amount={amount} currency={currency} size={19} color="#FFFFFF" symbolColor="rgba(255,255,255,0.8)" hidden={hidden} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, height: 158 },
  back: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, borderRadius: 22, overflow: 'hidden' },
  backShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.22)' },
  paper: { position: 'absolute', top: 10, left: 12, right: 12, height: 60, borderRadius: 12, backgroundColor: '#FFFFFF' },
  front: { position: 'absolute', top: 32, left: 0, right: 0, bottom: 0, borderRadius: 22, padding: 14, justifyContent: 'space-between' },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 14, lineHeight: 18, fontWeight: '600', color: 'rgba(255,255,255,0.92)' },
});
