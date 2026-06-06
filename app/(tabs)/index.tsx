import React, { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/shared/constants/colors';
import { BalanceCard } from '@/features/dashboard/components/BalanceCard';
import { QuickStats } from '@/features/dashboard/components/QuickStats';
import { TransactionItem } from '@/features/transactions/components/TransactionItem';
import { TransactionSkeleton, Skeleton } from '@/shared/components/ui/Skeleton';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { FAB } from '@/shared/components/ui/FAB';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTransactionsQuery, useMonthlyStats } from '@/hooks/useTransactions';
import { useBudgetsQuery } from '@/hooks/useBudgets';
import { formatMonthYear } from '@/shared/utils/formatDate';
import { useTheme } from '@/hooks/useTheme';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading: txLoading, refetch: refetchTx } = useTransactionsQuery({ pageSize: 5 });
  const { data: stats, isLoading: statsLoading } = useMonthlyStats();
  const { data: budgets } = useBudgetsQuery();

  const isOnline = useUIStore((s) => s.isOnline);

  const monthlyIncome = stats?.totalIncome ?? 0;
  const monthlyExpenses = stats?.totalExpenses ?? 0;
  const balance = monthlyIncome - monthlyExpenses;
  const savings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  const totalBudget = budgets?.reduce((s, b) => s + b.amount, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;
  const budgetUsage = totalBudget > 0 ? totalSpent / totalBudget : 0;

  const currency = user?.currency ?? 'IDR';
  const now = new Date().toISOString();

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['monthly-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['budgets'] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </Text>
          <Text style={[styles.month, { color: colors.text }]}>
            {formatMonthYear(now)}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {!isOnline && (
            <View style={styles.offlineBadge}>
              <MaterialCommunityIcons name="wifi-off" size={14} color={Colors.warning.main} />
            </View>
          )}
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            style={styles.notifButton}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.main}
          />
        }
      >
        {/* Balance Card */}
        {statsLoading ? (
          <View style={styles.balanceSkeleton}>
            <Skeleton height={160} borderRadius={24} />
          </View>
        ) : (
          <BalanceCard
            balance={balance}
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            onAddPress={() => router.push('/transaction/new')}
          />
        )}

        {/* Quick Stats */}
        <View style={styles.sectionSpacer} />
        <QuickStats
          savings={savings}
          savingsRate={savingsRate}
          budgetUsage={budgetUsage}
          currency={currency}
        />

        {/* Budget Overview */}
        {budgets && budgets.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget Overview</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/budgets')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {budgets.slice(0, 3).map((budget) => {
              const pct = budget.amount > 0 ? budget.spent / budget.amount : 0;
              const barColor =
                pct >= 1 ? Colors.error.main : pct >= 0.8 ? Colors.warning.main : Colors.success.main;
              return (
                <View key={budget.id} style={[styles.budgetItem, { backgroundColor: colors.surface }]}>
                  <View style={styles.budgetHeader}>
                    <Text style={[styles.budgetName, { color: colors.text }]}>{budget.name}</Text>
                    <Text style={[styles.budgetAmt, { color: barColor }]}>
                      {Math.round(pct * 100)}%
                    </Text>
                  </View>
                  <View style={styles.budgetBar}>
                    <View
                      style={[
                        styles.budgetFill,
                        { width: `${Math.min(pct * 100, 100)}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {txLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <TransactionSkeleton key={i} />
            ))}
          </>
        ) : transactions && transactions.length > 0 ? (
          transactions.slice(0, 5).map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              currency={currency}
              onPress={() => router.push(`/transaction/${tx.id}`)}
            />
          ))
        ) : (
          <EmptyState
            icon="swap-horizontal"
            title="No transactions yet"
            description="Start by adding your first transaction"
            actionLabel="Add Transaction"
            onAction={() => router.push('/transaction/new')}
          />
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      <FAB icon="plus" onPress={() => router.push('/transaction/new')} />
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: { fontSize: 14, marginBottom: 2 },
  month: { fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  offlineBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.warning.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.grey[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  balanceSkeleton: { paddingHorizontal: 16 },
  sectionSpacer: { height: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { color: Colors.primary.main, fontSize: 14, fontWeight: '500' },
  budgetItem: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
  },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetName: { fontSize: 14, fontWeight: '600' },
  budgetAmt: { fontSize: 14, fontWeight: '700' },
  budgetBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.grey[200],
    overflow: 'hidden',
  },
  budgetFill: { height: 6, borderRadius: 3 },
  bottomPad: { height: 20 },
});
