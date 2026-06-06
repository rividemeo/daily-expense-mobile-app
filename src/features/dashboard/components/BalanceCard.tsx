import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/shared/constants/colors';
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

  return (
    <LinearGradient
      colors={[Colors.primary[800], Colors.primary[600]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <View style={styles.header}>
        <View>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(balance, currency)}
          </Text>
        </View>
        <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <MaterialCommunityIcons name="arrow-down-circle" size={20} color={Colors.success.light} />
          </View>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>
              {formatCurrency(monthlyIncome, currency, { compact: true })}
            </Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <MaterialCommunityIcons name="arrow-up-circle" size={20} color={Colors.error.light} />
          </View>
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>
              {formatCurrency(monthlyExpenses, currency, { compact: true })}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  statValue: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
});
