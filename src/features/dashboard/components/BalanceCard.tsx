import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useAuthStore } from '@/stores/authStore';

interface BalanceCardProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

// White summary card in the style of Apple Wallet / Health: one big number, two small stats.
export function BalanceCard({ balance, monthlyIncome, monthlyExpenses }: BalanceCardProps) {
  const currency = useAuthStore((s) => s.user?.currency ?? 'IDR');
  const { colors, sys } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Balance this month</Text>
      <Text style={[styles.amount, { color: colors.text }]} adjustsFontSizeToFit numberOfLines={1}>
        {formatCurrency(balance, currency)}
      </Text>

      <View style={[styles.sep, { backgroundColor: colors.divider }]} />

      <View style={styles.row}>
        <Stat icon="arrow-down-circle" color={sys.green} label="Income" value={formatCurrency(monthlyIncome, currency, { compact: true })} />
        <Stat icon="arrow-up-circle" color={sys.red} label="Expenses" value={formatCurrency(monthlyExpenses, currency, { compact: true })} />
      </View>
    </View>
  );
}

function Stat({ icon, color, label, value }: { icon: 'arrow-down-circle' | 'arrow-up-circle'; color: string; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <View style={styles.statLabel}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={[Type.footnote, { color: colors.textSecondary, fontWeight: '600' }]}>{label}</Text>
      </View>
      <Text style={[Type.title3, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, padding: Space.lg, marginHorizontal: Space.lg },
  label: { ...Type.footnote, fontWeight: '600' },
  amount: { ...Type.display, marginTop: 2 },
  sep: { height: StyleSheet.hairlineWidth, marginVertical: Space.md },
  row: { flexDirection: 'row' },
  stat: { flex: 1, gap: 2 },
  statLabel: { flexDirection: 'row', alignItems: 'center', gap: Space.xs },
});
