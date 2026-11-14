import React, { useState, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart, LineChart, PieChart, ruleTypes, yAxisSides } from 'react-native-gifted-charts';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useAuthStore } from '@/stores/authStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useTheme } from '@/hooks/useTheme';
import { LargeTitle } from '@/shared/components/ui/LargeTitle';
import { Money } from '@/shared/components/ui/Money';
import { SegmentedControl } from '@/shared/components/ui/SegmentedControl';
import { formatFullDate, formatShortDate, getWeekRange } from '@/shared/utils/formatDate';
import { usePaydayMonth, usePaydayYear } from '@/hooks/usePayday';

type Period = 'week' | 'month' | 'year';

// Axis labels like Apple Health: 1.2M, 350K.
const short = (n: number) =>
  n >= 1e9 ? `${+(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : `${Math.round(n)}`;

export default function ReportsScreen() {
  const { colors, sys, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const chartWidth = width - Space.lg * 4 - 40; // screen gutters + card padding + y labels
  const [period, setPeriod] = useState<Period>('month');
  const user = useAuthStore((s) => s.user);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const currency = user?.currency ?? 'IDR';
  const incomeText = isDark ? sys.green : Colors.income;

  // Month and Year follow paydays (November = 30 Oct – 29 Nov); Week stays a normal week.
  const payMonth = usePaydayMonth();
  const payYear = usePaydayYear();
  const range = period === 'week' ? getWeekRange() : period === 'year' ? payYear : payMonth;
  const { data: transactions } = useTransactionsQuery({
    startDate: range.startDate,
    endDate: range.endDate,
    pageSize: 2000,
  });

  const expenses = useMemo(() => (transactions ?? []).filter((t) => t.type === 'expense'), [transactions]);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = (transactions ?? []).filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpenses;

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of expenses) map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
    return Array.from(map.entries())
      .map(([catId, amount], i) => {
        const cat = getCategoryById(catId);
        return { catId, amount, name: cat?.name ?? 'Other', icon: cat?.icon ?? 'help-circle', color: cat?.color ?? Colors.categoryColors[i % 16] };
      })
      .filter((c) => c.amount > 0) // paybacks are negative: they lower the total, not a slice
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [expenses, getCategoryById]);

  // Last 7 days, Screen Time style: today solid blue, other days lighter.
  const barData = useMemo(() => {
    const days: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days[d.toISOString().substring(0, 10)] = 0;
    }
    for (const tx of expenses) {
      const key = tx.date.substring(0, 10);
      if (key in days) days[key] += tx.amount;
    }
    const keys = Object.keys(days);
    return keys.map((date, i) => ({
      value: Math.max(0, Math.round(days[date])), // a day with only paybacks draws no bar
      label: new Date(date).toLocaleDateString('en', { weekday: 'narrow' }),
      frontColor: i === keys.length - 1 ? Colors.brand.purple : colors.surfaceAlt,
    }));
  }, [expenses, colors.surfaceAlt]);
  const weekTotal = barData.reduce((s, d) => s + d.value, 0);

  const lineData = useMemo(() => {
    let cumulative = 0;
    return [...expenses]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((tx) => ({ value: Math.round((cumulative += tx.amount)) }));
  }, [expenses]);

  const axis = { color: colors.textTertiary, ...Type.caption };
  const rules = {
    rulesType: ruleTypes.DASHED,
    rulesColor: colors.divider,
    dashWidth: 3,
    dashGap: 3,
    xAxisThickness: 0,
    yAxisThickness: 0,
    yAxisSide: yAxisSides.RIGHT,
    yAxisLabelWidth: 40,
    yAxisTextStyle: axis,
    formatYLabel: (l: string) => short(Number(l)),
    noOfSections: 3,
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <LargeTitle title="Spend analysis" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.pad}>
          <SegmentedControl
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
            ]}
          />
          <Text style={[Type.footnote, styles.rangeText, { color: colors.textSecondary }]}>
            {period === 'year'
              ? `${formatFullDate(range.startDate)} – ${formatFullDate(range.endDate)}`
              : `${formatShortDate(range.startDate)} – ${formatShortDate(range.endDate)}`}
          </Text>
        </View>

        {/* Total spending, split by category */}
        <View style={styles.pad}>
          <Text style={[Type.bodyLg, { color: colors.textSecondary }]}>Total spending</Text>
          <Money amount={totalExpenses} currency={currency} size={34} />
        </View>

        {/* Pie: share per category, percentages on the bigger slices */}
        {categoryTotals.length > 0 && (
          <View style={styles.pie} accessible accessibilityLabel="Share of spending by category">
            <PieChart
              data={categoryTotals.map((c) => {
                const pct = Math.round((c.amount / Math.max(totalExpenses, 1)) * 100);
                return { value: c.amount, color: c.color, text: pct >= 8 ? `${pct}%` : '' };
              })}
              radius={Math.min(120, (width - Space.lg * 2) / 2 - 20)}
              showText
              textColor="#FFFFFF"
              textSize={15}
              fontWeight="700"
              font="sans-serif"
              labelsPosition="mid"
              strokeWidth={3}
              strokeColor={colors.background}
            />
          </View>
        )}
        {categoryTotals.length > 0 && (
          <View style={styles.tiles}>
            {categoryTotals.map((c) => (
              <Pressable
                key={c.catId}
                onPress={() => router.push(`/category/${c.catId}`)}
                accessibilityRole="button"
                accessibilityLabel={`${c.name}, ${formatCurrency(c.amount, currency)}`}
                style={({ pressed }) => [styles.tile, { backgroundColor: pressed ? colors.pressed : colors.surface }]}
              >
                <View style={styles.tileHead}>
                  <MaterialCommunityIcons name={c.icon as any} size={15} color={c.color} />
                  <Text style={[Type.footnote, styles.flex, { color: c.color, fontWeight: '600' }]} numberOfLines={1}>{c.name}</Text>
                </View>
                <Text style={[Type.title3, { color: colors.text, fontWeight: '700' }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(c.amount, currency, { compact: true })}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* How imports get sorted */}
        <Pressable
          onPress={() => router.push('/(tabs)/transactions')}
          accessibilityRole="button"
          style={[styles.smart, { backgroundColor: isDark ? '#2A2412' : '#FFF8E7', borderColor: isDark ? '#3D3418' : '#F7EBC8' }]}
        >
          <View style={styles.head}>
            <Ionicons name="sparkles" size={18} color={sys.orange} />
            <Text style={[Type.title, { color: colors.text }]}>Smart category</Text>
          </View>
          <Text style={[Type.body, { color: colors.textSecondary }]}>
            Imported transactions are sorted for you. Open one to change its category and the app remembers it next time.
          </Text>
        </Pressable>

        {/* Summary */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
            <Stat label="Income" color={sys.green} icon="arrow-down-circle" value={formatCurrency(totalIncome, currency, { compact: true })} />
            <Stat label="Expenses" color={sys.red} icon="arrow-up-circle" value={formatCurrency(totalExpenses, currency, { compact: true })} />
          </View>
          <View style={[styles.sep, { backgroundColor: colors.divider }]} />
          <View style={styles.netRow}>
            <Text style={[Type.bodyLg, { color: colors.text }]}>Net savings</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[Type.title, { color: net >= 0 ? incomeText : colors.text }]}>
                {formatCurrency(net, currency, { showSign: true })}
              </Text>
              {totalIncome > 0 && (
                <Text style={[Type.footnote, { color: colors.textSecondary }]}>
                  {Math.round((net / totalIncome) * 100)}% of income
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Last 7 days */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <CardHead label="Last 7 days" color={Colors.brand.purple} icon="bar-chart" />
          <Text style={[Type.footnote, { color: colors.textSecondary }]}>Daily average</Text>
          <Text style={[Type.headline, { color: colors.text, marginBottom: Space.md }]}>
            {formatCurrency(weekTotal / 7, currency, { compact: true })}
          </Text>
          <BarChart
            data={barData}
            width={chartWidth}
            height={150}
            barWidth={Math.floor(chartWidth / 7 - 14)}
            spacing={12}
            initialSpacing={6}
            barBorderRadius={5}
            xAxisLabelTextStyle={axis}
            maxValue={Math.max(...barData.map((d) => d.value)) * 1.15 || 100}
            {...rules}
          />
        </View>

        {/* Cumulative spending */}
        {lineData.length > 1 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <CardHead label="Spending over time" color={Colors.brand.orange} icon="trending-up" />
            <Text style={[Type.footnote, { color: colors.textSecondary }]}>Total spent</Text>
            <Text style={[Type.headline, { color: colors.text, marginBottom: Space.md }]}>
              {formatCurrency(totalExpenses, currency, { compact: true })}
            </Text>
            <LineChart
              data={lineData}
              width={chartWidth}
              height={150}
              spacing={Math.max(chartWidth / (lineData.length - 1), 4)}
              initialSpacing={0}
              endSpacing={0}
              curved
              areaChart
              hideDataPoints
              color={Colors.brand.orange}
              thickness={2.5}
              startFillColor={Colors.brand.orange}
              endFillColor={Colors.brand.orange}
              startOpacity={0.25}
              endOpacity={0}
              adjustToWidth
              {...rules}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CardHead({ label, color, icon }: { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.head}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={[Type.footnote, { color, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

function Stat({ label, color, icon, value }: { label: string; color: string; icon: keyof typeof Ionicons.glyphMap; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.flex}>
      <CardHead label={label} color={color} icon={icon} />
      <Text style={[Type.headline, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: Space.lg, paddingTop: Space.sm, paddingBottom: Space.xxl },
  pad: { paddingHorizontal: Space.lg },
  rangeText: { textAlign: 'center', marginTop: Space.sm },
  card: { marginHorizontal: Space.lg, borderRadius: Radius.lg, padding: Space.lg, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: Space.xs, marginBottom: Space.sm },
  row: { flexDirection: 'row', gap: Space.md },
  flex: { flex: 1 },
  sep: { height: StyleSheet.hairlineWidth, marginVertical: Space.md },
  netRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pie: { alignItems: 'center', paddingVertical: Space.sm },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md, paddingHorizontal: Space.lg },
  tile: { width: '47.8%', flexGrow: 1, borderRadius: 16, padding: 14, gap: Space.sm },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  smart: { marginHorizontal: Space.lg, borderRadius: 18, borderWidth: 1, padding: Space.lg },
});
