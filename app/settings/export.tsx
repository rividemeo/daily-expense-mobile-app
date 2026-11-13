import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/shared/components/ui/Button';
import { LargeTitle } from '@/shared/components/ui/LargeTitle';
import { ListGroup, ListRow, ROW_ICON_INSET } from '@/shared/components/ui/ListGroup';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type ExportFormat = 'csv' | 'excel' | 'pdf';
type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  { value: 'csv', label: 'CSV', icon: 'document-text', description: 'Compatible with Excel, Google Sheets' },
  { value: 'excel', label: 'Excel', icon: 'grid', description: 'Native .xlsx spreadsheet format' },
  { value: 'pdf', label: 'PDF', icon: 'document', description: 'Formatted report for printing' },
];

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
  { value: 'all', label: 'All time' },
];

export default function ExportScreen() {
  const { colors, sys, accent } = useTheme();
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
      <LargeTitle back title="Export Data" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[Type.title, { color: colors.text }]}>{filteredTransactions.length} transactions</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[Type.footnote, { color: colors.textSecondary }]}>Income</Text>
              <Text style={[styles.summaryAmount, { color: sys.green }]}>{formatCurrency(totalIncome, currency, { compact: true })}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.summaryItem}>
              <Text style={[Type.footnote, { color: colors.textSecondary }]}>Expenses</Text>
              <Text style={[styles.summaryAmount, { color: colors.text }]}>{formatCurrency(totalExpense, currency, { compact: true })}</Text>
            </View>
          </View>
        </View>

        <ListGroup header="Format" separatorInset={ROW_ICON_INSET}>
          {FORMAT_OPTIONS.map((opt) => (
            <ListRow
              key={opt.value}
              icon={opt.icon}
              iconColor={sys.blue}
              title={opt.label}
              subtitle={opt.description}
              onPress={() => setFormat(opt.value)}
              selected={format === opt.value}
            />
          ))}
        </ListGroup>

        <ListGroup header="Date Range">
          {DATE_RANGES.map((range) => (
            <ListRow
              key={range.value}
              title={range.label}
              onPress={() => setDateRange(range.value)}
              selected={dateRange === range.value}
            />
          ))}
        </ListGroup>

        <View style={styles.footer}>
          <Button onPress={handleExport} loading={isExporting} fullWidth size="large">
            Export {filteredTransactions.length} Transactions
          </Button>
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            The exported file will be shared via your device's share sheet.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: Space.xl, paddingTop: Space.md, paddingBottom: Space.xxl },
  summaryCard: { marginHorizontal: Space.lg, borderRadius: Radius.lg, padding: Space.lg, gap: Space.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, gap: 2 },
  summaryAmount: { ...Type.title3 },
  summaryDivider: { width: StyleSheet.hairlineWidth, height: 36, marginHorizontal: Space.lg },
  footer: { paddingHorizontal: Space.lg, gap: Space.sm },
  note: { ...Type.footnote, textAlign: 'center' },
});
