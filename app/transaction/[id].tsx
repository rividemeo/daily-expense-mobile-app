import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { useTransactionStore } from '@/stores/transactionStore';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAuthStore } from '@/stores/authStore';
import { formatFullDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useTheme } from '@/hooks/useTheme';
import { Transaction } from '@/types/models';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, accent, isDark } = useTheme();
  const transactions = useTransactionStore((s) => s.transactions);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const currency = useAuthStore((s) => s.user?.currency ?? 'IDR');
  const deleteTransaction = useDeleteTransaction();

  const transaction = transactions.find((t) => t.id === id);
  const category = transaction ? getCategoryById(transaction.categoryId) : undefined;

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (id) {
              deleteTransaction.mutate(id, {
                onSuccess: () => router.back(),
              });
            }
          },
        },
      ]
    );
  };

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={{ color: colors.text }}>Transaction not found</Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  const isIncome = transaction.type === 'income';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction Details</Text>
        <TouchableOpacity
          onPress={() => router.push(`/transaction/edit/${id}`)}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt }]}
          accessibilityRole="button"
          accessibilityLabel="Edit transaction"
        >
          <MaterialCommunityIcons name="pencil-outline" size={22} color={accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Amount Hero */}
        <View
          style={[
            styles.hero,
            { backgroundColor: isIncome
                ? (isDark ? 'rgba(74,222,128,0.12)' : Colors.success.background)
                : (isDark ? 'rgba(248,113,113,0.12)' : Colors.error.background) },
          ]}
        >
          <CategoryIcon
            icon={category?.icon ?? 'help-circle'}
            color={category?.color ?? colors.textTertiary}
            size={64}
          />
          <Text
            style={[
              styles.heroAmount,
              { color: isIncome
                ? (isDark ? Colors.success.light : Colors.success.main)
                : (isDark ? Colors.error.light : Colors.error.main) },
            ]}
          >
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
          </Text>
          <Text style={[styles.heroDescription, { color: colors.text }]}>
            {transaction.description}
          </Text>
          <Badge
            label={isIncome ? 'Income' : 'Expense'}
            variant={isIncome ? 'success' : 'error'}
          />
        </View>

        {/* Details */}
        <View style={[styles.details, { backgroundColor: colors.surface }]}>
          <DetailRow label="Category" value={category?.name ?? 'Unknown'} icon="tag-outline" colors={colors} />
          <DetailRow label="Date" value={formatFullDate(transaction.date)} icon="calendar" colors={colors} />
          <DetailRow label="Payment Method" value={formatPaymentMethod(transaction.paymentMethod)} icon="credit-card-outline" colors={colors} />
          {transaction.notes && (
            <DetailRow label="Notes" value={transaction.notes} icon="note-text-outline" colors={colors} />
          )}
          {transaction.tags.length > 0 && (
            <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
              <MaterialCommunityIcons name="tag-multiple" size={20} color={colors.textSecondary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tags</Text>
                <View style={styles.tagsRow}>
                  {transaction.tags.map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: colors.surfaceAlt }]}>
                      <Text style={[styles.tagText, { color: accent }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
          <DetailRow
            label="Sync Status"
            value={transaction.isSynced ? 'Synced' : 'Pending sync'}
            icon={transaction.isSynced ? 'cloud-check' : 'cloud-sync-outline'}
            colors={colors}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            onPress={() => {}}
            variant="outlined"
            icon="content-duplicate"
            style={styles.actionBtn}
          >
            Duplicate
          </Button>
          <Button
            onPress={handleDelete}
            variant="outlined"
            color="error"
            icon="trash-can-outline"
            loading={deleteTransaction.isPending}
            style={styles.actionBtn}
          >
            Delete
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string;
  icon: string;
  colors: any;
}) {
  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
      <MaterialCommunityIcons name={icon as any} size={20} color={colors.textSecondary} />
      <View style={styles.detailContent}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function formatPaymentMethod(method: string): string {
  return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Space.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
  },
  iconBtn: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...Type.title, fontWeight: '700' },
  hero: {
    alignItems: 'center',
    paddingVertical: Space.xxl,
    paddingHorizontal: Space.xl,
    gap: Space.md,
    marginHorizontal: Space.lg,
    borderRadius: Radius.lg,
    marginBottom: Space.lg,
  },
  heroAmount: { ...Type.display },
  heroDescription: { ...Type.title, textAlign: 'center' },
  details: {
    marginHorizontal: Space.lg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Space.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Space.lg,
    gap: Space.md,
    borderBottomWidth: 1,
  },
  detailContent: { flex: 1 },
  detailLabel: { ...Type.caption, marginBottom: 2 },
  detailValue: { ...Type.body, fontWeight: '500' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.xs },
  tag: {
    borderRadius: Radius.sm,
    paddingHorizontal: Space.sm,
    paddingVertical: 2,
  },
  tagText: { ...Type.caption, fontWeight: '500' },
  actions: {
    flexDirection: 'row',
    gap: Space.md,
    paddingHorizontal: Space.lg,
    paddingBottom: Space.xxl,
  },
  actionBtn: { flex: 1 },
});
