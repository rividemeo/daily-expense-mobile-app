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
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useTheme } from '@/hooks/useTheme';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { getCurrentMonthRange, getWeekRange } from '@/shared/utils/formatDate';
import { Transaction } from '@/types/models';

const { width } = Dimensions.get('window');

type Period = 'week' | 'month' | 'year';

export default function ReportsScreen() {
  const { colors } = useTheme();
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
      frontColor: Colors.primary.main,
    }));
  }, [expenses]);

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
            color={Colors.success.main}
            bg={Colors.success.background}
          />
          <SummaryCard
            label="Total Expenses"
            value={formatCurrency(totalExpenses, currency, { compact: true })}
            icon="arrow-up-circle"
            color={Colors.error.main}
            bg={Colors.error.background}
          />
        </View>
        <View style={[styles.savingsCard, { backgroundColor: netSavings >= 0 ? Colors.success.background : Colors.error.background }]}>
          <Text style={styles.savingsLabel}>Net Savings</Text>
          <Text style={[styles.savingsValue, { color: netSavings >= 0 ? Colors.success.main : Colors.error.main }]}>
            {formatCurrency(netSavings, currency, { showSign: true })}
          </Text>
          {totalIncome > 0 && (
            <Text style={{ color: Colors.grey[600], fontSize: 12 }}>
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
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
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
              yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
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
              color={Colors.primary.main}
              thickness={2.5}
              startFillColor={Colors.primary.main}
              endFillColor={Colors.primary[50]}
              startOpacity={0.3}
              endOpacity={0.05}
              areaChart
              hideDataPoints={false}
              dataPointsColor={Colors.primary.main}
              dataPointsRadius={4}
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
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
  return (
    <View style={[styles.summaryCard, { backgroundColor: bg }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={styles.summaryCardLabel}>{label}</Text>
      <Text style={[styles.summaryCardValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  periodSelector: { borderRadius: 12 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'flex-start',
    gap: 6,
  },
  summaryCardLabel: { fontSize: 12, color: Colors.grey[600] },
  summaryCardValue: { fontSize: 20, fontWeight: '700' },
  savingsCard: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  savingsLabel: { fontSize: 13, color: Colors.grey[600] },
  savingsValue: { fontSize: 28, fontWeight: '800' },
  chartCard: {
    borderRadius: 16,
    padding: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  pieContainer: { alignItems: 'center', marginBottom: 16 },
  legend: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 13 },
  legendValue: { fontSize: 13, fontWeight: '600' },
});
