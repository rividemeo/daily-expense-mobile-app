import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/shared/constants/colors';
import { formatCurrency, formatPercent } from '@/shared/utils/formatCurrency';

interface QuickStatsProps {
  savings: number;
  savingsRate: number;
  budgetUsage: number;
  currency: string;
}

export function QuickStats({ savings, savingsRate, budgetUsage, currency }: QuickStatsProps) {
  return (
    <View style={styles.container}>
      <Surface style={[styles.statCard, styles.savingsCard]} elevation={1}>
        <View style={[styles.statIcon, { backgroundColor: Colors.success.background }]}>
          <MaterialCommunityIcons name="piggy-bank" size={22} color={Colors.success.main} />
        </View>
        <Text style={styles.statLabel}>Savings</Text>
        <Text style={[styles.statValue, { color: savings >= 0 ? Colors.success.main : Colors.error.main }]}>
          {formatCurrency(savings, currency, { compact: true, showSign: true })}
        </Text>
        <Text style={styles.statSub}>{formatPercent(savingsRate)} of income</Text>
      </Surface>

      <Surface style={[styles.statCard, styles.budgetCard]} elevation={1}>
        <View style={[styles.statIcon, { backgroundColor: budgetUsage > 0.9 ? Colors.error.background : Colors.warning.background }]}>
          <MaterialCommunityIcons
            name="wallet-outline"
            size={22}
            color={budgetUsage > 0.9 ? Colors.error.main : Colors.warning.main}
          />
        </View>
        <Text style={styles.statLabel}>Budget Used</Text>
        <Text style={[styles.statValue, { color: budgetUsage > 0.9 ? Colors.error.main : Colors.warning.main }]}>
          {formatPercent(budgetUsage * 100)}
        </Text>
        <Text style={styles.statSub}>of monthly budget</Text>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
  },
  savingsCard: {},
  budgetCard: {},
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.grey[500],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statSub: {
    fontSize: 10,
    color: Colors.grey[400],
  },
});
