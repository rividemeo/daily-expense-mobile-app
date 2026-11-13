import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQueryClient } from '@tanstack/react-query';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { BalanceCard } from '@/features/dashboard/components/BalanceCard';
import { QuickStats } from '@/features/dashboard/components/QuickStats';
import { TransactionItem, TX_ROW_INSET } from '@/features/transactions/components/TransactionItem';
import { TransactionSkeleton, Skeleton } from '@/shared/components/ui/Skeleton';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { LargeTitle, HeaderButton } from '@/shared/components/ui/LargeTitle';
import { ListGroup } from '@/shared/components/ui/ListGroup';
import { ProgressBar } from '@/shared/components/ui/ProgressBar';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTransactionsQuery, useMonthlyStats } from '@/hooks/useTransactions';
import { useBudgetsQuery } from '@/hooks/useBudgets';
import { formatMonthYear } from '@/shared/utils/formatDate';
import { useTheme } from '@/hooks/useTheme';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { colors, sys, accent, isDark } = useTheme();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading: txLoading } = useTransactionsQuery({ pageSize: 5 });
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

  const sectionHeader = (title: string, onSeeAll: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={[Type.title3, { color: colors.text }]}>{title}</Text>
      <Pressable onPress={onSeeAll} style={styles.seeAll} accessibilityRole="button" accessibilityLabel={`See all ${title}`}>
        <Text style={[Type.bodyLg, { color: accent }]}>See All</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <LargeTitle
        title="Summary"
        subtitle={formatMonthYear(new Date().toISOString())}
        right={
          <>
            {!isOnline && (
              <Ionicons name="cloud-offline-outline" size={18} color={sys.orange} accessibilityLabel="Offline" />
            )}
            <HeaderButton icon="add" label="Add transaction" onPress={() => router.push('/transaction/new')} />
            <Pressable
              onPress={() => router.push('/profile')}
              style={styles.avatarHit}
              accessibilityRole="button"
              accessibilityLabel="Profile"
            >
              <View style={[styles.avatar, { backgroundColor: sys.blue }]}>
                <Text style={styles.avatarText}>{(user?.name ?? 'U').charAt(0).toUpperCase()}</Text>
              </View>
            </Pressable>
          </>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} colors={[accent]} />
        }
      >
        {statsLoading ? (
          <View style={styles.balanceSkeleton}>
            <Skeleton height={160} borderRadius={Radius.lg} />
          </View>
        ) : (
          <BalanceCard balance={balance} monthlyIncome={monthlyIncome} monthlyExpenses={monthlyExpenses} />
        )}

        <View style={styles.gap} />
        <QuickStats savings={savings} savingsRate={savingsRate} budgetUsage={budgetUsage} currency={currency} />

        {budgets && budgets.length > 0 && (
          <>
            {sectionHeader('Budgets', () => router.push('/(tabs)/budgets'))}
            <ListGroup>
              {budgets.slice(0, 3).map((budget) => {
                const pct = budget.amount > 0 ? budget.spent / budget.amount : 0;
                const pctColor = pct >= 1 ? sys.red : pct >= 0.8 ? sys.orange : sys.green;
                return (
                  <View key={budget.id} style={styles.budgetRow}>
                    <View style={styles.budgetHeader}>
                      <Text style={[Type.bodyLg, styles.budgetName, { color: colors.text }]} numberOfLines={1}>
                        {budget.name}
                      </Text>
                      <Text style={[Type.body, { color: pctColor, fontWeight: '600' }]}>{Math.round(pct * 100)}%</Text>
                    </View>
                    <ProgressBar progress={pct} height={5} />
                  </View>
                );
              })}
            </ListGroup>
          </>
        )}

        {sectionHeader('Recent Transactions', () => router.push('/(tabs)/transactions'))}
        {txLoading ? (
          <ListGroup separatorInset={TX_ROW_INSET}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TransactionSkeleton key={i} />
            ))}
          </ListGroup>
        ) : transactions && transactions.length > 0 ? (
          <ListGroup separatorInset={TX_ROW_INSET}>
            {transactions.slice(0, 5).map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                currency={currency}
                onPress={() => router.push(`/transaction/${tx.id}`)}
              />
            ))}
          </ListGroup>
        ) : (
          <EmptyState
            icon="swap-horizontal"
            title="No transactions yet"
            description="Start by adding your first transaction"
            actionLabel="Add Transaction"
            onAction={() => router.push('/transaction/new')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarHit: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Type.body, color: '#FFFFFF', fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: Space.sm, paddingBottom: Space.xxl },
  balanceSkeleton: { paddingHorizontal: Space.lg },
  gap: { height: Space.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: TOUCH,
    paddingHorizontal: Space.lg,
    marginTop: Space.xl,
    marginBottom: Space.xs,
  },
  seeAll: { minHeight: TOUCH, justifyContent: 'center', paddingLeft: Space.md },
  budgetRow: { paddingHorizontal: Space.lg, paddingVertical: Space.md, gap: Space.sm },
  budgetHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  budgetName: { flex: 1 },
});
