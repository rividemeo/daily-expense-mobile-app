import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl, Pressable, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQueryClient } from '@tanstack/react-query';
import { Space, Type, TOUCH } from '@/shared/constants/theme';
import { Colors } from '@/shared/constants/colors';
import { TransactionItem } from '@/features/transactions/components/TransactionItem';
import { TransactionSkeleton, Skeleton } from '@/shared/components/ui/Skeleton';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { CircleButton } from '@/shared/components/ui/CircleButton';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { Money } from '@/shared/components/ui/Money';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionsQuery, useMonthlyStats } from '@/hooks/useTransactions';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatShortDate } from '@/shared/utils/formatDate';
import { usePaydayMonth, useSalaryDates } from '@/hooks/usePayday';
import { paydayMonth, addDays } from '@/shared/utils/payday';
import { useTheme } from '@/hooks/useTheme';

const { orange, purple, navy } = Colors.brand;
const MONTHS = 6;
const toDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const payMonth = usePaydayMonth(); // salary-to-salary month, e.g. November = 30 Oct – 29 Nov
  const salaryDates = useSalaryDates();
  const { colors, sys, accent, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const isOnline = useUIStore((s) => s.isOnline);
  const [hidden, setHidden] = useState(false);
  const currency = user?.currency ?? 'IDR';

  // The last six payday months, oldest first.
  const months = useMemo(() => {
    const out = [payMonth];
    while (out.length < MONTHS) out.unshift(paydayMonth(salaryDates, toDate(addDays(out[0].startDate, -1))));
    return out;
  }, [payMonth, salaryDates.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: transactions, isLoading: txLoading } = useTransactionsQuery({ pageSize: 5 });
  const { data: recentTx } = useTransactionsQuery({ startDate: months[0].startDate, endDate: payMonth.endDate, pageSize: 5000 });
  const { data: stats, isLoading: statsLoading } = useMonthlyStats();

  const income = stats?.totalIncome ?? 0;
  const spent = stats?.totalExpenses ?? 0;
  const monthName = new Date(payMonth.year, payMonth.month, 15).toLocaleDateString('en', { month: 'long' });

  // Spending per payday month for the bar chart.
  const bars = useMemo(() => {
    const totals = months.map(() => 0);
    for (const t of recentTx ?? []) {
      if (t.type !== 'expense') continue;
      const d = t.date.slice(0, 10);
      const i = months.findIndex((m) => d >= m.startDate && d <= m.endDate);
      if (i >= 0) totals[i] += t.amount;
    }
    return months.map((m, i) => ({
      value: Math.max(0, totals[i]),
      label: new Date(m.year, m.month, 15).toLocaleDateString('en', { month: 'short' }),
    }));
  }, [recentTx, months]);
  const maxBar = Math.max(...bars.map((b) => b.value), 1);

  // Top three spending categories this payday month.
  const top = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of recentTx ?? []) {
      const d = t.date.slice(0, 10);
      if (t.type === 'expense' && d >= payMonth.startDate && d <= payMonth.endDate) map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
    }
    return [...map.entries()]
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, amount]) => {
        const cat = getCategoryById(id);
        return { id, amount, name: cat?.name ?? 'Other', icon: cat?.icon ?? 'help-circle', color: cat?.color ?? sys.gray };
      });
  }, [recentTx, payMonth.startDate, payMonth.endDate, getCategoryById, sys.gray]);

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
        <Text style={[Type.body, { color: colors.textTertiary }]}>{link}</Text>
      </Pressable>
    </View>
  );

  const barW = Math.min(34, (width - Space.lg * 2) / MONTHS - 18);
  const money = (n: number) => (hidden ? '•••' : formatCurrency(n, currency, { compact: true }));

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel="Profile" style={[styles.avatar, { backgroundColor: purple }]}>
          <Text style={styles.avatarText}>{(user?.name ?? 'Me').slice(0, 1).toUpperCase()}</Text>
        </Pressable>
        <Text style={[Type.title3, styles.title, { color: colors.text }]}>Home</Text>
        <View style={styles.topRight}>
          {!isOnline && <Ionicons name="cloud-offline-outline" size={18} color={sys.orange} accessibilityLabel="Offline" />}
          <CircleButton icon="grid-outline" label="More" onPress={() => router.push('/(tabs)/more')} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} colors={[accent]} />}
      >
        {/* Balance card: navy with a purple tab peeking out on top */}
        <View style={styles.cardWrap}>
          <View style={[styles.cardTab, { backgroundColor: purple }]} />
          <View style={[styles.balanceCard, { backgroundColor: navy }]}>
            <View style={styles.balanceHead}>
              <Text style={styles.balanceLabel}>{monthName} balance</Text>
              <Pressable
                onPress={() => setHidden((h) => !h)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={hidden ? 'Show amounts' : 'Hide amounts'}
              >
                <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255,255,255,0.8)" />
              </Pressable>
            </View>
            {statsLoading ? (
              <Skeleton height={44} width={200} borderRadius={8} />
            ) : (
              <Money amount={income - spent} currency={currency} size={34} color="#FFFFFF" symbolColor="rgba(255,255,255,0.7)" hidden={hidden} />
            )}
            <View style={styles.balanceFoot}>
              <Text style={styles.balanceMeta}>
                {formatShortDate(payMonth.startDate)} – {formatShortDate(payMonth.endDate)}
              </Text>
              <Ionicons name="wallet-outline" size={22} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
        </View>

        {/* Income / spent cards */}
        <View style={styles.pair}>
          <Pressable onPress={() => router.push('/(tabs)/transactions')} accessibilityRole="button" style={[styles.stat, { backgroundColor: purple }]}>
            <View style={styles.statIcon}><Ionicons name="arrow-down" size={18} color="#FFFFFF" /></View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{money(income)}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/reports')} accessibilityRole="button" style={[styles.stat, { backgroundColor: orange }]}>
            <View style={styles.statIcon}><Ionicons name="arrow-up" size={18} color="#FFFFFF" /></View>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{money(spent)}</Text>
          </Pressable>
        </View>

        {/* Analytics: spending per payday month */}
        <View style={styles.sectionHeader}>
          <Text style={[Type.title3, { color: colors.text }]}>Analytics</Text>
          <Pressable onPress={() => router.push('/(tabs)/reports')} accessibilityRole="button" style={[styles.chip, { backgroundColor: orange }]}>
            <Text style={styles.chipText}>{MONTHS} months</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.chart} accessible accessibilityLabel="Spending in the last six months">
          {bars.map((b, i) => {
            const current = i === bars.length - 1;
            return (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barValue, { color: current ? purple : colors.textTertiary }]} numberOfLines={1}>
                  {b.value > 0 && !hidden ? formatCurrency(b.value, currency, { compact: true }).replace(/^[^\d]+/, '') : ''}
                </Text>
                <View
                  style={[
                    styles.bar,
                    { width: barW, height: Math.max(6, (b.value / maxBar) * 120), backgroundColor: current ? purple : colors.surfaceAlt },
                  ]}
                />
                <Text style={[Type.caption, { color: current ? purple : colors.textTertiary, fontWeight: current ? '600' : '400' }]}>{b.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Where the money went */}
        {top.length > 0 && (
          <>
            {sectionHeader('Expenses', 'View all', () => router.push('/(tabs)/reports'))}
            <View style={styles.list}>
              {top.map((c) => {
                const pct = spent > 0 ? Math.min(100, (c.amount / spent) * 100) : 0;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => router.push(`/category/${c.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`${c.name}, ${formatCurrency(c.amount, currency)}`}
                    style={({ pressed }) => [styles.catCard, { backgroundColor: pressed ? colors.pressed : colors.surface }]}
                  >
                    <View style={styles.catHead}>
                      <CategoryIcon icon={c.icon} color={c.color} size={40} />
                      <Text style={[Type.title, styles.flex, { color: colors.text }]} numberOfLines={1}>{c.name}</Text>
                      <Text style={[Type.footnote, { color: colors.textTertiary }]}>{monthName}</Text>
                    </View>
                    <View style={styles.catNums}>
                      <View>
                        <Text style={[Type.footnote, { color: colors.textTertiary }]}>Spent</Text>
                        <Text style={[Type.title, { color: isDark ? sys.green : '#1FA34A' }]}>{money(c.amount)}</Text>
                      </View>
                      <Text style={[Type.title, { color: isDark ? sys.green : '#1FA34A' }]}>{pct.toFixed(1)}%</Text>
                    </View>
                    <View style={[styles.track, { backgroundColor: colors.background }]}>
                      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: purple }]} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {sectionHeader('Transactions', 'View all', () => router.push('/(tabs)/transactions'))}
        {txLoading ? (
          <View style={styles.list}>
            {[1, 2, 3].map((i) => <View key={i} style={[styles.txCard, { backgroundColor: colors.surface }]}><TransactionSkeleton /></View>)}
          </View>
        ) : transactions && transactions.length > 0 ? (
          <View style={styles.list}>
            {transactions.slice(0, 5).map((tx) => (
              <View key={tx.id} style={[styles.txCard, { backgroundColor: colors.surface }]}>
                <TransactionItem transaction={tx} currency={currency} onPress={() => router.push(`/transaction/${tx.id}`)} />
              </View>
            ))}
          </View>
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
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Space.lg, paddingVertical: Space.sm, gap: Space.md },
  title: { flex: 1, textAlign: 'center' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, minWidth: TOUCH, justifyContent: 'flex-end' },
  avatar: { width: TOUCH, height: TOUCH, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  cardWrap: { marginHorizontal: Space.lg, marginTop: Space.md, paddingTop: 12 },
  cardTab: { position: 'absolute', top: 0, left: 28, right: 28, height: 40, borderRadius: 18 },
  balanceCard: { borderRadius: 24, padding: Space.xl, gap: Space.md },
  balanceHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 16 },
  balanceFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Space.xs },
  balanceMeta: { color: 'rgba(255,255,255,0.75)', fontSize: 14, letterSpacing: 0.5 },
  pair: { flexDirection: 'row', gap: Space.md, paddingHorizontal: Space.lg, marginTop: Space.lg },
  stat: { flex: 1, borderRadius: 20, padding: Space.lg, gap: 4 },
  statIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: Space.sm },
  statLabel: { color: 'rgba(255,255,255,0.88)', fontSize: 14 },
  statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
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
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, height: 34, borderRadius: 10 },
  chipText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: Space.lg, height: 170 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barValue: { fontSize: 10, fontWeight: '600' },
  bar: { borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  list: { paddingHorizontal: Space.lg, gap: 10 },
  catCard: { borderRadius: 18, padding: Space.lg, gap: Space.md },
  catHead: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  catNums: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  txCard: { borderRadius: 16, overflow: 'hidden' },
});
