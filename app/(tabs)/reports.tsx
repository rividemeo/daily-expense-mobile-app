import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart, LineChart } from 'react-native-gifted-charts';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useAuthStore } from '@/stores/authStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useTheme } from '@/hooks/useTheme';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { getCurrentMonthRange, getWeekRange } from '@/shared/utils/formatDate';
import { Transaction } from '@/types/models';

const { width } = Dimensions.get('window');

type Period = 'week' | 'month' | 'year';

export default function ReportsScreen() {
  const { colors, accent, isDark } = useTheme();
  const incomeColor = isDark ? Colors.success.light : Colors.success.main;
  const expenseColor = isDark ? Colors.error.light : Colors.error.main;
  const incomeBg = isDark ? 'rgba(74,222,128,0.12)' : Colors.success.background;
  const expenseBg = isDark ? 'rgba(248,113,113,0.12)' : Colors.error.background;
  const [period, setPeriod] = useState<Period>('month');
  const [chartTab, setChartTab] = useState<'spending' | 'income' | 'cashflow'>('spending');
  const user = useAuthStore((s) => s.user);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const currency = user?.currency ?? 'IDR';

  const range = period === 'week' ? getWeekRange() : getCurrentMonthRange();
  const { data: transactions } = useTransactionsQuery({
    startDate: range.startDate,
    endDate: range.endDate,
    pageSize: 500,
  });

  const expenses = (transactions ?? []).filter((t) => t.type === 'expense');
  const incomes = (transactions ?? []).filter((t) => t.type === 'income');

  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  // Spending by category
  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of expenses) {
      map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
    }
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        return { catId, amount, cat };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [expenses, getCategoryById]);

  // Pie chart data
  const pieData = categoryTotals.map((item, i) => ({
    value: item.amount,
    color: item.cat?.color ?? Colors.categoryColors[i % Colors.categoryColors.length],
    text: item.cat?.name ?? 'Other',
    focused: i === 0,
  }));

  // Bar chart - daily spending (last 7 days)
  const barData = useMemo(() => {
    const days: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().substring(0, 10);
      days[key] = 0;
    }
    for (const tx of expenses) {
      const key = tx.date.substring(0, 10);
      if (key in days) days[key] += tx.amount;
    }
    return Object.entries(days).map(([date, value]) => ({
      value: Math.round(value),
      label: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      frontColor: accent,
    }));
  }, [expenses, accent]);

  // Line chart - cumulative spending
  const lineData = useMemo(() => {
    let cumulative = 0;
    const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-10).map((tx) => {
      cumulative += tx.amount;
      return { value: Math.round(cumulative) };
    });
  }, [expenses]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Reports</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Period Selector */}
        <SegmentedButtons
          value={period}
          onValueChange={(v) => setPeriod(v as Period)}
          theme={{ colors: { secondaryContainer: accent, onSecondaryContainer: isDark ? Colors.primary[900] : Colors.white } }}
          buttons={[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'year', label: 'This Year' },
          ]}
          style={styles.periodSelector}
        />

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard
            label="Total Income"
            value={formatCurrency(totalIncome, currency, { compact: true })}
            icon="arrow-down-circle"
            color={incomeColor}
            bg={incomeBg}
          />
          <SummaryCard
            label="Total Expenses"
            value={formatCurrency(totalExpenses, currency, { compact: true })}
            icon="arrow-up-circle"
            color={expenseColor}
            bg={expenseBg}
          />
        </View>
        <View style={[styles.savingsCard, { backgroundColor: netSavings >= 0 ? incomeBg : expenseBg }]}>
          <Text style={[styles.savingsLabel, { color: colors.textSecondary }]}>Net Savings</Text>
          <Text style={[styles.savingsValue, { color: netSavings >= 0 ? incomeColor : expenseColor }]}>
            {formatCurrency(netSavings, currency, { showSign: true })}
          </Text>
          {totalIncome > 0 && (
            <Text style={{ color: colors.textSecondary, ...Type.caption }}>
              {Math.round((netSavings / totalIncome) * 100)}% savings rate
            </Text>
          )}
        </View>

        {/* Spending by Category */}
        {pieData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Spending by Category</Text>
            <View style={styles.pieContainer}>
              <PieChart
                data={pieData}
                donut
                radius={90}
                innerRadius={55}
                innerCircleColor={colors.surface}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ ...Type.caption, color: colors.textSecondary }}>Total</Text>
                    <Text style={{ ...Type.body, fontWeight: '700', color: colors.text }}>
                      {formatCurrency(totalExpenses, currency, { compact: true })}
                    </Text>
                  </View>
                )}
              />
            </View>
            <View style={styles.legend}>
              {categoryTotals.slice(0, 6).map((item, i) => (
                <View key={item.catId} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.cat?.color ?? Colors.categoryColors[i] }]} />
                  <Text style={[styles.legendLabel, { color: colors.text }]} numberOfLines={1}>
                    {item.cat?.name ?? 'Other'}
                  </Text>
                  <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
                    {formatCurrency(item.amount, currency, { compact: true })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Daily Bar Chart */}
        {barData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Daily Spending (7 days)</Text>
            <BarChart
              data={barData}
              width={width - 80}
              height={180}
              barWidth={28}
              spacing={14}
              roundedTop
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: colors.textTertiary, ...Type.caption }}
              xAxisLabelTextStyle={{ color: colors.textTertiary, ...Type.caption }}
              noOfSections={4}
              maxValue={Math.max(...barData.map((d) => d.value)) * 1.2 || 100}
            />
          </View>
        )}

        {/* Cumulative Line Chart */}
        {lineData.length > 1 && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Spending Trend</Text>
            <LineChart
              data={lineData}
              width={width - 80}
              height={180}
              color={accent}
              thickness={2.5}
              startFillColor={accent}
              endFillColor={accent}
              startOpacity={0.12}
              endOpacity={0.12}
              areaChart
              hideDataPoints={false}
              dataPointsColor={accent}
              dataPointsRadius={4}
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: colors.textTertiary, ...Type.caption }}
              noOfSections={4}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
}) {
  const { MaterialCommunityIcons } = require('@expo/vector-icons');
  const { colors } = useTheme();
  return (
    <View style={[styles.summaryCard, { backgroundColor: bg }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={[styles.summaryCardLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.summaryCardValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Space.lg, paddingTop: Space.sm, paddingBottom: Space.md },
  title: { ...Type.headline },
  content: { padding: Space.lg, gap: Space.lg, paddingBottom: Space.xxl + Space.sm },
  periodSelector: { borderRadius: Radius.md },
  summaryRow: { flexDirection: 'row', gap: Space.md },
  summaryCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    alignItems: 'flex-start',
    gap: Space.sm,
  },
  summaryCardLabel: { ...Type.caption },
  summaryCardValue: { ...Type.title, fontWeight: '700' },
  savingsCard: {
    borderRadius: Radius.lg,
    padding: Space.lg,
    alignItems: 'center',
    gap: Space.xs,
  },
  savingsLabel: { ...Type.body },
  savingsValue: { ...Type.headline, fontWeight: '700' },
  chartCard: {
    borderRadius: Radius.lg,
    padding: Space.lg,
  },
  chartTitle: { ...Type.bodyLg, fontWeight: '700', marginBottom: Space.lg },
  pieContainer: { alignItems: 'center', marginBottom: Space.lg },
  legend: { gap: Space.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  legendDot: { width: 10, height: 10, borderRadius: Radius.pill },
  legendLabel: { flex: 1, ...Type.body },
  legendValue: { ...Type.body, fontWeight: '600' },
});
