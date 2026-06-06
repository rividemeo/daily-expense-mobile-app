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
  const { colors } = useTheme();
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction Details</Text>
        <TouchableOpacity
          onPress={() => router.push(`/transaction/edit/${id}`)}
          style={styles.editBtn}
        >
          <MaterialCommunityIcons name="pencil-outline" size={22} color={Colors.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Amount Hero */}
        <View
          style={[
            styles.hero,
            { backgroundColor: isIncome ? Colors.success.background : Colors.error.background },
          ]}
        >
          <CategoryIcon
            icon={category?.icon ?? 'help-circle'}
            color={category?.color ?? Colors.grey[400]}
            size={64}
          />
          <Text
            style={[
              styles.heroAmount,
              { color: isIncome ? Colors.success.main : Colors.error.main },
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
        <View style={styles.details}>
          <DetailRow label="Category" value={category?.name ?? 'Unknown'} icon="tag-outline" colors={colors} />
          <DetailRow label="Date" value={formatFullDate(transaction.date)} icon="calendar" colors={colors} />
          <DetailRow label="Payment Method" value={formatPaymentMethod(transaction.paymentMethod)} icon="credit-card-outline" colors={colors} />
          {transaction.notes && (
            <DetailRow label="Notes" value={transaction.notes} icon="note-text-outline" colors={colors} />
          )}
          {transaction.tags.length > 0 && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="tag-multiple" size={20} color={colors.textSecondary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tags</Text>
                <View style={styles.tagsRow}>
                  {transaction.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
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
    <View style={styles.detailRow}>
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
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
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
  headerTitle: { fontSize: 18, fontWeight: '700' },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroAmount: { fontSize: 36, fontWeight: '800' },
  heroDescription: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  details: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[100],
  },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '500' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: {
    backgroundColor: Colors.primary[50],
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { color: Colors.primary.main, fontSize: 12, fontWeight: '500' },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  actionBtn: { flex: 1 },
});
