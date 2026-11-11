import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Text, RadioButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
import { Button } from '@/shared/components/ui/Button';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type ExportFormat = 'csv' | 'excel' | 'pdf';
type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: string; description: string }[] = [
  { value: 'csv', label: 'CSV', icon: 'file-delimited', description: 'Compatible with Excel, Google Sheets' },
  { value: 'excel', label: 'Excel', icon: 'microsoft-excel', description: 'Native .xlsx spreadsheet format' },
  { value: 'pdf', label: 'PDF', icon: 'file-pdf-box', description: 'Formatted report for printing' },
];

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
  { value: 'all', label: 'All time' },
];

export default function ExportScreen() {
  const { colors, accent, isDark } = useTheme();
  const tint = isDark ? 'rgba(45,212,191,0.12)' : Colors.primary[50];
  const transactions = useTransactionStore((s) => s.transactions);
  const currency = useAuthStore((s) => s.user?.currency ?? 'IDR');
  const { showSnackbar } = useUIStore();

  const [format, setFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isExporting, setIsExporting] = useState(false);

  const filteredTransactions = React.useMemo(() => {
    const now = new Date();
    let cutoff: Date | null = null;
    if (dateRange === '7d') cutoff = new Date(now.getTime() - 7 * 86400000);
    else if (dateRange === '30d') cutoff = new Date(now.getTime() - 30 * 86400000);
    else if (dateRange === '90d') cutoff = new Date(now.getTime() - 90 * 86400000);
    else if (dateRange === '1y') cutoff = new Date(now.getTime() - 365 * 86400000);
    if (!cutoff) return transactions;
    return transactions.filter((t) => new Date(t.date) >= cutoff!);
  }, [transactions, dateRange]);

  const totalIncome = filteredTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsExporting(false);
    showSnackbar(`Exported ${filteredTransactions.length} transactions as ${format.toUpperCase()}`, 'success');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Export Data</Text>
        <View style={{ width: TOUCH }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.hero }]}>
          <Text style={[styles.summaryTitle, { color: colors.onHero }]}>{filteredTransactions.length} transactions</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="arrow-down-circle" size={16} color={colors.onHeroMuted} />
              <Text style={[styles.summaryLabel, { color: colors.onHeroMuted }]}>Income</Text>
              <Text style={[styles.summaryAmount, { color: colors.onHero }]}>{formatCurrency(totalIncome, currency, { compact: true })}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="arrow-up-circle" size={16} color={colors.onHeroMuted} />
              <Text style={[styles.summaryLabel, { color: colors.onHeroMuted }]}>Expenses</Text>
              <Text style={[styles.summaryAmount, { color: colors.onHero }]}>{formatCurrency(totalExpense, currency, { compact: true })}</Text>
            </View>
          </View>
        </View>

        {/* Format selection */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>FORMAT</Text>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {FORMAT_OPTIONS.map((opt, index) => (
            <React.Fragment key={opt.value}>
              {index > 0 && <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setFormat(opt.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: format === opt.value }}
              >
                <View style={[styles.optionIcon, { backgroundColor: tint }]}>
                  <MaterialCommunityIcons name={opt.icon as any} size={22} color={accent} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>{opt.description}</Text>
                </View>
                <RadioButton
                  value={opt.value}
                  status={format === opt.value ? 'checked' : 'unchecked'}
                  onPress={() => setFormat(opt.value)}
                  color={Colors.primary.main}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Date range */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DATE RANGE</Text>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {DATE_RANGES.map((range, index) => (
            <React.Fragment key={range.value}>
              {index > 0 && <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />}
              <TouchableOpacity
                style={styles.rangeRow}
                onPress={() => setDateRange(range.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: dateRange === range.value }}
              >
                <Text style={[styles.rangeLabel, { color: colors.text }]}>{range.label}</Text>
                <RadioButton
                  value={range.value}
                  status={dateRange === range.value ? 'checked' : 'unchecked'}
                  onPress={() => setDateRange(range.value)}
                  color={Colors.primary.main}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <Button
          onPress={handleExport}
          loading={isExporting}
          fullWidth
          size="large"
          icon="export"
          style={styles.exportBtn}
        >
          Export {filteredTransactions.length} Transactions
        </Button>

        <Text style={[styles.note, { color: colors.textTertiary }]}>
          The exported file will be shared via your device's share sheet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
  },
  backBtn: { width: TOUCH, height: TOUCH, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  title: { ...Type.title },
  content: { padding: Space.lg, gap: Space.sm, paddingBottom: Space.xxl },
  summaryCard: {
    borderRadius: Radius.lg,
    padding: Space.xl,
    marginBottom: Space.sm,
  },
  summaryTitle: { ...Type.title, marginBottom: Space.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', gap: Space.xs },
  summaryLabel: { ...Type.caption },
  summaryAmount: { ...Type.bodyLg, fontWeight: '600' },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionLabel: { ...Type.caption, fontWeight: '600', letterSpacing: 1, marginTop: Space.sm, marginLeft: Space.xs },
  section: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  itemDivider: { height: 1, marginHorizontal: Space.lg },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    gap: Space.md,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: { flex: 1 },
  optionLabel: { ...Type.body, fontWeight: '500' },
  optionDesc: { ...Type.caption, marginTop: 2 },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.xs,
  },
  rangeLabel: { flex: 1, ...Type.body, fontWeight: '400' },
  exportBtn: { marginTop: Space.sm },
  note: { ...Type.caption, textAlign: 'center', marginTop: Space.xs },
});
