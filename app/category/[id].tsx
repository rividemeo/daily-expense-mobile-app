import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, ruleTypes } from 'react-native-gifted-charts';
import { Space, Type, TOUCH } from '@/shared/constants/theme';
import { CircleButton } from '@/shared/components/ui/CircleButton';
import { Money } from '@/shared/components/ui/Money';
import { ListGroup } from '@/shared/components/ui/ListGroup';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { TransactionItem, TX_ROW_INSET } from '@/features/transactions/components/TransactionItem';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useSalaryDates } from '@/hooks/usePayday';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';
import { paydayMonth, addDays, iso } from '@/shared/utils/payday';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatShortDate } from '@/shared/utils/formatDate';

const toDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// One category over one payday month: total, a daily spending line, and its transactions.
export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, sys } = useTheme();
  const { width } = useWindowDimensions();
  const category = useCategoryStore((s) => s.getCategoryById)(id);
  const currency = useAuthStore((s) => s.user?.currency) ?? 'IDR';
  const color = category?.color ?? sys.gray;

  const salaryDates = useSalaryDates();
  const [day, setDay] = useState(() => new Date());
  const range = useMemo(() => paydayMonth(salaryDates, day), [salaryDates.join(), day]); // eslint-disable-line react-hooks/exhaustive-deps
  const isCurrent = range.endDate >= iso(new Date());
  const [search, setSearch] = useState('');

  const { data } = useTransactionsQuery({ categoryId: id, startDate: range.startDate, endDate: range.endDate, pageSize: 2000 });
  const all = data ?? [];
  const total = all.reduce((s, t) => s + t.amount, 0);
  const q = search.trim().toLowerCase();
  const list = q ? all.filter((t) => t.description.toLowerCase().includes(q) || (t.notes ?? '').toLowerCase().includes(q)) : all;

  // Spending per day across the month, zero on quiet days.
  const series = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const t of all) byDay.set(t.date.slice(0, 10), (byDay.get(t.date.slice(0, 10)) ?? 0) + t.amount);
    const out: { value: number; date: string }[] = [];
    for (let d = range.startDate; d <= range.endDate; d = addDays(d, 1)) out.push({ value: Math.max(0, byDay.get(d) ?? 0), date: d });
    return out;
  }, [all, range.startDate, range.endDate]);
  const chartWidth = width - Space.lg * 2;
  const mid = series[Math.floor(series.length / 2)]?.date;

  const monthDate = new Date(range.year, range.month, 15);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <CircleButton icon="arrow-back" label="Back" onPress={() => router.back()} />
        <Text style={[Type.title3, styles.flex, { color: colors.text }]} numberOfLines={1}>Category details</Text>
        <CircleButton icon="create-outline" label="Edit categories" onPress={() => router.push('/categories')} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Hero: mini wallet + total */}
        <View style={styles.hero}>
          <View style={styles.mini}>
            <View style={[styles.miniBack, { backgroundColor: color }]}><View style={styles.shade} /></View>
            <View style={[styles.miniFront, { backgroundColor: color }]}>
              <MaterialCommunityIcons name={(category?.icon ?? 'help-circle') as any} size={18} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.flex}>
            <Text style={[Type.bodyLg, { color: colors.textSecondary }]} numberOfLines={1}>{category?.name ?? 'Category'}</Text>
            <Money amount={total} currency={currency} size={32} />
          </View>
        </View>

        <View style={[styles.rule, { backgroundColor: colors.border }]} />

        {/* Month switcher */}
        <View style={styles.monthRow}>
          <Text style={[Type.title, { color: colors.text }]}>
            {monthDate.toLocaleDateString('en', { month: 'long' })}
            <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>, {range.year}</Text>
          </Text>
          <View style={styles.arrows}>
            <Pressable onPress={() => setDay(toDate(addDays(range.startDate, -1)))} style={styles.arrow} accessibilityRole="button" accessibilityLabel="Previous month">
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <Pressable
              disabled={isCurrent}
              onPress={() => setDay(toDate(addDays(range.endDate, 1)))}
              style={styles.arrow}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              accessibilityState={{ disabled: isCurrent }}
            >
              <Ionicons name="arrow-forward" size={22} color={isCurrent ? colors.textTertiary : colors.text} />
            </Pressable>
          </View>
        </View>
        <View style={[styles.pad, styles.spentRow]}>
          <Money amount={Math.max(0, total)} currency={currency} size={26} />
          <Text style={[Type.body, { color: colors.textSecondary }]}> Spent</Text>
        </View>

        {/* Daily line */}
        <View style={styles.chart}>
          <LineChart
            data={series}
            width={chartWidth}
            height={150}
            spacing={chartWidth / Math.max(series.length - 1, 1)}
            initialSpacing={0}
            endSpacing={0}
            adjustToWidth
            areaChart
            hideDataPoints
            color={color}
            thickness={2}
            startFillColor={color}
            endFillColor={color}
            startOpacity={0.18}
            endOpacity={0}
            maxValue={Math.max(...series.map((d) => d.value), 1) * 1.2}
            noOfSections={4}
            rulesType={ruleTypes.SOLID}
            rulesColor={colors.border}
            xAxisThickness={0}
            yAxisThickness={0}
            hideYAxisText
            yAxisLabelWidth={0}
            pointerConfig={{
              pointerStripColor: color,
              pointerStripWidth: 1,
              strokeDashArray: [4, 4],
              pointerColor: color,
              radius: 5,
              pointerLabelWidth: 120,
              pointerLabelHeight: 54,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: { value: number; date: string }[]) => (
                <View style={styles.tip}>
                  <Text style={styles.tipValue}>{formatCurrency(items[0]?.value ?? 0, currency)}</Text>
                  <Text style={styles.tipDate}>{items[0]?.date ? formatShortDate(items[0].date) : ''}</Text>
                </View>
              ),
            }}
          />
          <View style={styles.axis}>
            {[range.startDate, mid, range.endDate].map((d, i) => (
              <Text key={i} style={[Type.footnote, { color: colors.textSecondary }]}>{d ? formatShortDate(d) : ''}</Text>
            ))}
          </View>
        </View>

        <View style={[styles.rule, { backgroundColor: colors.border }]} />

        {/* Search + list */}
        <View style={[styles.search, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            placeholder="Search for any transaction"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            style={[Type.body, styles.flex, { color: colors.text }]}
            accessibilityLabel="Search transactions"
          />
        </View>
        <Text style={[Type.title3, styles.pad, { color: colors.text }]}>Latest transactions</Text>
        {list.length > 0 ? (
          <ListGroup separatorInset={TX_ROW_INSET}>
            {list.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} currency={currency} onPress={() => router.push(`/transaction/${tx.id}`)} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="receipt" title={q ? 'No matches' : 'Nothing spent here'} description={q ? 'Try another word' : 'No transactions in this month'} />
        )}
      </ScrollView>

      {/* Dark action pills */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push({ pathname: '/transaction/new', params: { categoryId: id } })}
          style={({ pressed }) => [styles.darkPill, { opacity: pressed ? 0.8 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Add a transaction in this category"
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.darkPillText}>Add</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(tabs)/budgets')}
          style={({ pressed }) => [styles.darkPill, { opacity: pressed ? 0.8 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Budgets"
        >
          <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
          <Text style={styles.darkPillText}>Budget</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  pad: { paddingHorizontal: Space.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingHorizontal: Space.lg, paddingVertical: Space.sm },
  content: { gap: Space.md, paddingBottom: 100 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: Space.lg, paddingHorizontal: Space.lg, paddingVertical: Space.md },
  mini: { width: 92, height: 66 },
  miniBack: { position: 'absolute', top: 0, left: 0, right: 0, height: 36, borderRadius: 12, overflow: 'hidden' },
  shade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.22)' },
  miniFront: { position: 'absolute', top: 12, left: 0, right: 0, bottom: 0, borderRadius: 12, padding: 10, justifyContent: 'center' },
  rule: { height: StyleSheet.hairlineWidth, marginHorizontal: Space.lg },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Space.lg },
  arrows: { flexDirection: 'row' },
  arrow: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  spentRow: { flexDirection: 'row', alignItems: 'flex-end' },
  chart: { paddingHorizontal: Space.lg },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Space.xs },
  tip: { backgroundColor: '#16161A', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  tipValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  tipDate: { color: '#AEAEB2', fontSize: 13 },
  search: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, marginHorizontal: Space.lg, paddingHorizontal: Space.lg, height: TOUCH + 4, borderRadius: 999 },
  footer: { position: 'absolute', left: Space.lg, right: Space.lg, bottom: Space.xl, flexDirection: 'row', gap: Space.md },
  darkPill: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#16161A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  darkPillText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
});
