import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, ruleTypes } from 'react-native-gifted-charts';
import { Space, Type, TOUCH } from '@/shared/constants/theme';
import { Colors } from '@/shared/constants/colors';
import { CircleButton } from '@/shared/components/ui/CircleButton';
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
  const { colors, sys, accent } = useTheme();
  const { width } = useWindowDimensions();
  const category = useCategoryStore((s) => s.getCategoryById)(id);
  const currency = useAuthStore((s) => s.user?.currency) ?? 'IDR';
  const color = category?.color ?? sys.gray;

  const salaryDates = useSalaryDates();
  const [day, setDay] = useState(() => new Date());
  const range = useMemo(() => paydayMonth(salaryDates, day), [salaryDates.join(), day]); // eslint-disable-line react-hooks/exhaustive-deps
  const isCurrent = range.endDate >= iso(new Date());
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const stripRef = useRef<ScrollView>(null);

  const { data } = useTransactionsQuery({ categoryId: id, startDate: range.startDate, endDate: range.endDate, pageSize: 2000 });
  const all = data ?? [];
  const total = all.reduce((s, t) => s + t.amount, 0);
  const q = search.trim().toLowerCase();
  const dayList = picked ? all.filter((t) => t.date.slice(0, 10) === picked) : all;
  const list = q ? dayList.filter((t) => t.description.toLowerCase().includes(q) || (t.notes ?? '').toLowerCase().includes(q)) : dayList;

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
  const shiftMonth = (d: string) => {
    setDay(toDate(d));
    setPicked(null);
  };

  // Everything spent this month, to show this category's share.
  const { data: monthAll } = useTransactionsQuery({ startDate: range.startDate, endDate: range.endDate, pageSize: 5000 });
  const monthSpent = (monthAll ?? []).filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const share = monthSpent > 0 ? Math.min(100, Math.max(0, (total / monthSpent) * 100)) : 0;
  const spentDays = new Set(all.map((t) => t.date.slice(0, 10)));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <CircleButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <Text style={[Type.title3, styles.flex, styles.center, { color: colors.text }]} numberOfLines={1}>{category?.name ?? 'Category'}</Text>
        <CircleButton icon="create-outline" label="Edit categories" onPress={() => router.push('/categories')} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Month + day strip */}
        <View style={[styles.calendar, { backgroundColor: colors.surface }]}>
          <View style={styles.monthRow}>
            <Pressable onPress={() => shiftMonth(addDays(range.startDate, -1))} style={styles.arrow} accessibilityRole="button" accessibilityLabel="Previous month">
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={[Type.title, { color: colors.text }]}>
              {monthDate.toLocaleDateString('en', { month: 'long' })} {range.year}
            </Text>
            <Pressable
              disabled={isCurrent}
              onPress={() => shiftMonth(addDays(range.endDate, 1))}
              style={styles.arrow}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              accessibilityState={{ disabled: isCurrent }}
            >
              <Ionicons name="chevron-forward" size={20} color={isCurrent ? colors.textTertiary : colors.text} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.days}
            ref={stripRef}
            onContentSizeChange={() => !picked && stripRef.current?.scrollToEnd({ animated: false })}
          >
            {series.map(({ date }) => {
              const on = date === picked;
              const d = toDate(date);
              return (
                <Pressable
                  key={date}
                  onPress={() => setPicked(on ? null : date)}
                  accessibilityRole="button"
                  accessibilityLabel={formatShortDate(date)}
                  accessibilityState={{ selected: on }}
                  style={[styles.day, on && { backgroundColor: accent }]}
                >
                  <Text style={[styles.dayName, { color: on ? '#FFFFFF' : colors.textTertiary }]}>{d.toLocaleDateString('en', { weekday: 'narrow' })}</Text>
                  <Text style={[styles.dayNum, { color: on ? '#FFFFFF' : colors.text }]}>{d.getDate()}</Text>
                  <View style={[styles.dayDot, { backgroundColor: spentDays.has(date) ? (on ? '#FFFFFF' : colors.textTertiary) : 'transparent' }]} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Share of the month */}
        <View style={[styles.shareCard, { backgroundColor: colors.surface }]}>
          <View style={styles.shareHead}>
            <Text style={[Type.bodyLg, styles.flex, { color: colors.text }]}>
              You have spent <Text style={{ color: accent, fontWeight: '700' }}>{formatCurrency(Math.max(0, total), currency, { compact: true })}</Text>
              {'\n'}this month.
            </Text>
            <Text style={[Type.footnote, { color: colors.textTertiary }]}>{formatShortDate(range.startDate)} – {formatShortDate(range.endDate)}</Text>
          </View>
          <View style={[styles.shareBar, { backgroundColor: colors.background }]} accessible accessibilityLabel={`${share.toFixed(0)}% of all spending`}>
            <View style={[styles.shareFill, { flex: Math.max(share, 0.01), backgroundColor: Colors.brand.purple }]}>
              {share >= 22 && <Text style={styles.shareIn}>{share.toFixed(1)}%</Text>}
            </View>
            <View style={[styles.shareRest, { flex: Math.max(100 - share, 0.01) }]}>
              {100 - share >= 22 && <Text style={[styles.shareOut, { color: colors.text }]}>{(100 - share).toFixed(1)}%</Text>}
            </View>
          </View>
          <Text style={[Type.footnote, { color: colors.textTertiary }]}>Share of everything you spent this month</Text>
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
        <Text style={[Type.title3, styles.pad, { color: colors.text }]}>{picked ? formatShortDate(picked) : 'Latest transactions'}</Text>
        {list.length > 0 ? (
          <ListGroup separatorInset={TX_ROW_INSET}>
            {list.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} currency={currency} onPress={() => router.push(`/transaction/${tx.id}`)} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="receipt" title={q ? 'No matches' : 'Nothing spent here'} description={q ? 'Try another word' : picked ? 'No transactions on this day' : 'No transactions in this month'} />
        )}
      </ScrollView>

      {/* Dark action pills */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push({ pathname: '/transaction/new', params: { categoryId: id } })}
          style={({ pressed }) => [styles.darkPill, { backgroundColor: accent, shadowColor: accent, opacity: pressed ? 0.8 : 1 }]}
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
  center: { textAlign: 'center' },
  calendar: { marginHorizontal: Space.lg, borderRadius: 20, paddingVertical: Space.sm },
  days: { paddingHorizontal: Space.sm, gap: 4 },
  day: { width: 42, borderRadius: 12, alignItems: 'center', paddingVertical: 8, gap: 4 },
  dayName: { fontSize: 12 },
  dayNum: { fontSize: 16, fontWeight: '600' },
  dayDot: { width: 4, height: 4, borderRadius: 2 },
  shareCard: { marginHorizontal: Space.lg, borderRadius: 20, padding: Space.lg, gap: Space.md },
  shareHead: { flexDirection: 'row', gap: Space.md, alignItems: 'flex-start' },
  shareBar: { flexDirection: 'row', height: 40, borderRadius: 10, overflow: 'hidden' },
  shareFill: { borderRadius: 10, justifyContent: 'center', paddingHorizontal: Space.md },
  shareRest: { justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: Space.md },
  shareIn: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  shareOut: { fontWeight: '700', fontSize: 15 },
  rule: { height: StyleSheet.hairlineWidth, marginHorizontal: Space.lg },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Space.xs },
  arrow: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
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
    backgroundColor: Colors.brand.navy,
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
