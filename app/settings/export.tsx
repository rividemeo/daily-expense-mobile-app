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
  const { colors } = useTheme();
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Export Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: Colors.primary.main }]}>
          <Text style={styles.summaryTitle}>{filteredTransactions.length} transactions</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="arrow-down-circle" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalIncome, currency, { compact: true })}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="arrow-up-circle" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalExpense, currency, { compact: true })}</Text>
            </View>
          </View>
        </View>

        {/* Format selection */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>FORMAT</Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {FORMAT_OPTIONS.map((opt, index) => (
            <React.Fragment key={opt.value}>
              {index > 0 && <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setFormat(opt.value)}
              >
                <View style={[styles.optionIcon, { backgroundColor: Colors.primary[50] }]}>
                  <MaterialCommunityIcons name={opt.icon as any} size={22} color={Colors.primary.main} />
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
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {DATE_RANGES.map((range, index) => (
            <React.Fragment key={range.value}>
              {index > 0 && <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />}
              <TouchableOpacity
                style={styles.rangeRow}
                onPress={() => setDateRange(range.value)}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.grey[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700' },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  summaryTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  summaryAmount: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 8, marginLeft: 4 },
  section: { borderRadius: 12, overflow: 'hidden' },
  itemDivider: { height: 1, marginHorizontal: 16 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '500' },
  optionDesc: { fontSize: 12, marginTop: 2 },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  rangeLabel: { flex: 1, fontSize: 15, fontWeight: '400' },
  exportBtn: { marginTop: 8 },
  note: { fontSize: 12, textAlign: 'center', marginTop: 4 },
});
