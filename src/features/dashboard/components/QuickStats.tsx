import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency, formatPercent } from '@/shared/utils/formatCurrency';

interface QuickStatsProps {
  savings: number;
  savingsRate: number;
  budgetUsage: number;
  currency: string;
}

// Two Health-app style tiles: coloured icon + label on top, big number below.
export function QuickStats({ savings, savingsRate, budgetUsage, currency }: QuickStatsProps) {
  const { sys } = useTheme();
  const over = budgetUsage > 0.9;
  return (
    <View style={styles.container}>
      <Tile
        icon="leaf"
        color={savings >= 0 ? sys.green : sys.red}
        label="Savings"
        value={formatCurrency(savings, currency, { compact: true, showSign: true })}
        sub={`${formatPercent(savingsRate)} of income`}
      />
      <Tile
        icon="pie-chart"
        color={over ? sys.red : sys.orange}
        label="Budget used"
        value={formatPercent(budgetUsage * 100)}
        sub="of monthly budget"
      />
    </View>
  );
}

function Tile({ icon, color, label, value, sub }: { icon: 'leaf' | 'pie-chart'; color: string; label: string; value: string; sub: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface }]}>
      <View style={styles.head}>
        <Ionicons name={icon} size={15} color={color} />
        <Text style={[Type.footnote, { color, fontWeight: '600' }]}>{label}</Text>
      </View>
      <Text style={[Type.headline, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={[Type.footnote, { color: colors.textSecondary }]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: Space.lg, gap: Space.md },
  tile: { flex: 1, borderRadius: Radius.lg, padding: Space.md + 2, gap: 2 },
  head: { flexDirection: 'row', alignItems: 'center', gap: Space.xs, marginBottom: Space.xs },
});
