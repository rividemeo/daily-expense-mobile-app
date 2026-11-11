import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency, formatPercent } from '@/shared/utils/formatCurrency';

interface QuickStatsProps {
  savings: number;
  savingsRate: number;
  budgetUsage: number;
  currency: string;
}

export function QuickStats({ savings, savingsRate, budgetUsage, currency }: QuickStatsProps) {
  const { colors, isDark } = useTheme();
  const card = [styles.statCard, { backgroundColor: colors.surface }];
  const over = budgetUsage > 0.9;
  const successBg = isDark ? 'rgba(74,222,128,0.12)' : Colors.success.background;
  const budgetBg = over
    ? isDark ? 'rgba(248,113,113,0.12)' : Colors.error.background
    : isDark ? 'rgba(251,191,36,0.12)' : Colors.warning.background;
  // Darker status shades lack contrast on the dark surface.
  const tone = (c: { main: string; light: string }) => (isDark ? c.light : c.main);
  return (
    <View style={styles.container}>
      <View style={card}>
        <View style={[styles.statIcon, { backgroundColor: successBg }]}>
          <MaterialCommunityIcons name="piggy-bank" size={22} color={tone(Colors.success)} />
        </View>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Savings</Text>
        <Text style={[styles.statValue, { color: savings >= 0 ? tone(Colors.success) : tone(Colors.error) }]}>
          {formatCurrency(savings, currency, { compact: true, showSign: true })}
        </Text>
        <Text style={[styles.statSub, { color: colors.textTertiary }]}>{formatPercent(savingsRate)} of income</Text>
      </View>

      <View style={card}>
        <View style={[styles.statIcon, { backgroundColor: budgetBg }]}>
          <MaterialCommunityIcons
            name="wallet-outline"
            size={22}
            color={over ? tone(Colors.error) : tone(Colors.warning)}
          />
        </View>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Budget Used</Text>
        <Text style={[styles.statValue, { color: over ? tone(Colors.error) : tone(Colors.warning) }]}>
          {formatPercent(budgetUsage * 100)}
        </Text>
        <Text style={[styles.statSub, { color: colors.textTertiary }]}>of monthly budget</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Space.lg,
    gap: Space.md,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.md,
  },
  statLabel: {
    ...Type.caption,
    marginBottom: Space.xs,
  },
  statValue: {
    ...Type.title,
    fontWeight: '700',
    marginBottom: 2,
  },
  statSub: {
    ...Type.caption,
  },
});
