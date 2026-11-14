import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQueryClient } from '@tanstack/react-query';
import { Space, Type, TOUCH } from '@/shared/constants/theme';
import { WalletCard } from '@/features/dashboard/components/WalletCard';
import { TransactionItem, TX_ROW_INSET } from '@/features/transactions/components/TransactionItem';
import { TransactionSkeleton, Skeleton } from '@/shared/components/ui/Skeleton';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { ListGroup } from '@/shared/components/ui/ListGroup';
import { CircleButton } from '@/shared/components/ui/CircleButton';
import { Money } from '@/shared/components/ui/Money';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionsQuery, useMonthlyStats } from '@/hooks/useTransactions';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatShortDate } from '@/shared/utils/formatDate';
import { usePaydayMonth } from '@/hooks/usePayday';
import { useTheme } from '@/hooks/useTheme';

const ACTIONS: { icon: keyof typeof Ionicons.glyphMap; label: string; to: string }[] = [
  { icon: 'add', label: 'Add', to: '/transaction/new' },
  { icon: 'document-text-outline', label: 'Import', to: '/settings/import' },
  { icon: 'pricetags-outline', label: 'Categories', to: '/categories' },
  { icon: 'share-outline', label: 'Export', to: '/settings/export' },
];

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const payMonth = usePaydayMonth(); // salary-to-salary month, e.g. November = 30 Oct – 29 Nov
  const { colors, sys, accent, isDark } = useTheme();
  const queryClient = useQueryClient();
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const isOnline = useUIStore((s) => s.isOnline);
  const [hidden, setHidden] = useState(false);
  const currency = user?.currency ?? 'IDR';

  const { data: transactions, isLoading: txLoading } = useTransactionsQuery({ pageSize: 5 });
  const { data: monthTx } = useTransactionsQuery({ startDate: payMonth.startDate, endDate: payMonth.endDate, pageSize: 2000 });
  const { data: stats, isLoading: statsLoading } = useMonthlyStats();

  const income = stats?.totalIncome ?? 0;
  const spent = stats?.totalExpenses ?? 0;
  const monthName = new Date(payMonth.year, payMonth.month, 15).toLocaleDateString('en', { month: 'long' });

  // Top four spending categories this payday month, drawn as wallets.
  const wallets = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthTx ?? []) if (t.type === 'expense') map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
    return [...map.entries()]
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, amount]) => {
        const cat = getCategoryById(id);
        return { id, amount, name: cat?.name ?? 'Other', icon: cat?.icon ?? 'help-circle', color: cat?.color ?? sys.gray };
      });
  }, [monthTx, getCategoryById, sys.gray]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['monthly-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['budgets'] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  const sectionHeader = (title: string, link: string, onPress: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={[Type.title3, { color: colors.text }]}>{title}</Text>
      <Pressable onPress={onPress} style={styles.seeAll} accessibilityRole="button" accessibilityLabel={`${link}: ${title}`}>
        <Text style={[Type.body, { color: colors.textSecondary }]}>{link}</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} colors={[accent]} />}
      >
        <View style={styles.topBar}>
          <CircleButton icon="menu" label="More" onPress={() => router.push('/(tabs)/more')} />
          <View style={styles.topRight}>
            {!isOnline && <Ionicons name="cloud-offline-outline" size={18} color={sys.orange} accessibilityLabel="Offline" />}
            <CircleButton icon="document-text-outline" label="Import statement" onPress={() => router.push('/settings/import')} />
            <CircleButton icon="person-outline" label="Profile" onPress={() => router.push('/profile')} />
          </View>
        </View>

        {/* Balance */}
        <View style={styles.balance}>
          <View style={styles.flex}>
            <Text style={[Type.bodyLg, { color: colors.textSecondary }]}>{monthName} balance</Text>
            {statsLoading ? (
              <Skeleton height={44} width={220} borderRadius={8} />
            ) : (
              <Money amount={income - spent} currency={currency} size={38} hidden={hidden} />
            )}
            <Text style={[Type.footnote, { color: colors.textSecondary }]}>
              {formatShortDate(payMonth.startDate)} – {formatShortDate(payMonth.endDate)}
              {'  ·  '}
              <Text style={{ color: isDark ? sys.green : '#248A3D' }}>↓ {hidden ? '•••' : formatCurrency(income, currency, { compact: true })}</Text>
              {'   '}
              <Text style={{ color: colors.text }}>↑ {hidden ? '•••' : formatCurrency(spent, currency, { compact: true })}</Text>
            </Text>
          </View>
          <CircleButton icon={hidden ? 'eye-off-outline' : 'eye-outline'} label={hidden ? 'Show amounts' : 'Hide amounts'} onPress={() => setHidden((h) => !h)} />
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          {ACTIONS.map((a) => (
            <Pressable key={a.label} onPress={() => router.push(a.to as any)} accessibilityRole="button" accessibilityLabel={a.label} style={styles.action}>
              {({ pressed }) => (
                <>
                  <View style={[styles.actionPill, { backgroundColor: pressed ? colors.pressed : colors.surfaceAlt }]}>
                    <Ionicons name={a.icon} size={22} color={colors.text} />
                  </View>
                  <Text style={[Type.footnote, { color: colors.text, fontWeight: '500' }]}>{a.label}</Text>
                </>
              )}
            </Pressable>
          ))}
        </View>

        <View style={[styles.rule, { backgroundColor: colors.border }]} />

        {/* Where the money went */}
        {wallets.length > 0 && (
          <>
            {sectionHeader('Top spending', 'See all', () => router.push('/(tabs)/reports'))}
            <View style={styles.grid}>
              {[0, 2].filter((r) => r < wallets.length).map((row) => (
                <View key={row} style={styles.gridRow}>
                  {wallets.slice(row, row + 2).map((w) => (
                    <WalletCard key={w.id} {...w} currency={currency} hidden={hidden} onPress={() => router.push(`/category/${w.id}`)} />
                  ))}
                  {wallets.slice(row, row + 2).length === 1 && <View style={styles.flex} />}
                </View>
              ))}
            </View>
          </>
        )}

        {sectionHeader('Latest transactions', 'See all', () => router.push('/(tabs)/transactions'))}
        {txLoading ? (
          <ListGroup separatorInset={TX_ROW_INSET}>
            {[1, 2, 3, 4, 5].map((i) => <TransactionSkeleton key={i} />)}
          </ListGroup>
        ) : transactions && transactions.length > 0 ? (
          <ListGroup separatorInset={TX_ROW_INSET}>
            {transactions.slice(0, 5).map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} currency={currency} onPress={() => router.push(`/transaction/${tx.id}`)} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState
            icon="swap-horizontal"
            title="No transactions yet"
            description="Add one with the + button, or import a bank statement"
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
  flex: { flex: 1 },
  scrollContent: { paddingBottom: Space.xxl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Space.lg, paddingTop: Space.sm },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  balance: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingHorizontal: Space.lg, paddingTop: Space.xl, paddingBottom: Space.lg },
  actions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Space.lg, paddingBottom: Space.lg },
  action: { alignItems: 'center', gap: 6, minWidth: TOUCH },
  actionPill: { width: 72, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  rule: { height: StyleSheet.hairlineWidth, marginHorizontal: Space.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: TOUCH,
    paddingHorizontal: Space.lg,
    marginTop: Space.lg,
    marginBottom: Space.xs,
  },
  seeAll: { minHeight: TOUCH, justifyContent: 'center', paddingLeft: Space.md },
  grid: { paddingHorizontal: Space.lg, gap: Space.md },
  gridRow: { flexDirection: 'row', gap: Space.md },
});
