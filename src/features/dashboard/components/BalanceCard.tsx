import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useAuthStore } from '@/stores/authStore';

interface BalanceCardProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  onAddPress: () => void;
}

export function BalanceCard({
  balance,
  monthlyIncome,
  monthlyExpenses,
  onAddPress,
}: BalanceCardProps) {
  const currency = useAuthStore((s) => s.user?.currency ?? 'IDR');
  const { colors } = useTheme();
  const muted = { color: colors.onHeroMuted };
  const strong = { color: colors.onHero };

  return (
    <View style={[styles.container, { backgroundColor: colors.hero }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.balanceLabel, muted]}>Total Balance</Text>
          <Text style={[styles.balanceAmount, strong]}>
            {formatCurrency(balance, currency)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onAddPress}
          style={styles.addButton}
          accessibilityRole="button"
          accessibilityLabel="Add transaction"
        >
          <MaterialCommunityIcons name="plus" size={24} color={colors.onHero} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statLabelRow}>
            <MaterialCommunityIcons name="arrow-bottom-left" size={14} color={colors.onHeroMuted} />
            <Text style={[styles.statLabel, muted]}>Income</Text>
          </View>
          <Text style={[styles.statValue, strong]}>
            {formatCurrency(monthlyIncome, currency, { compact: true })}
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.onHeroMuted }]} />

        <View style={styles.statItem}>
          <View style={styles.statLabelRow}>
            <MaterialCommunityIcons name="arrow-top-right" size={14} color={colors.onHeroMuted} />
            <Text style={[styles.statLabel, muted]}>Expenses</Text>
          </View>
          <Text style={[styles.statValue, strong]}>
            {formatCurrency(monthlyExpenses, currency, { compact: true })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: Space.xl,
    marginHorizontal: Space.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Space.xl,
  },
  balanceLabel: {
    ...Type.body,
    marginBottom: Space.xs,
  },
  balanceAmount: {
    ...Type.display,
  },
  addButton: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: TOUCH / 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statItem: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    marginBottom: 2,
  },
  statLabel: { ...Type.caption },
  statValue: { ...Type.bodyLg, fontWeight: '600' },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    opacity: 0.4,
    marginHorizontal: Space.lg,
  },
});
