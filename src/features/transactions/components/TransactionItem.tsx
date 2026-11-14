import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Space, Type, TOUCH } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { Transaction } from '@/types/models';
import { formatTransactionDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useCategoryStore } from '@/stores/categoryStore';

interface TransactionItemProps {
  transaction: Transaction;
  currency: string;
  onPress?: () => void;
  onDelete?: () => void;
}

/** Separator inset for a ListGroup of these rows (lines start under the text). */
export const TX_ROW_INSET = Space.lg + 44 + Space.md;

// A plain row (no background of its own): put these inside a <ListGroup separatorInset={TX_ROW_INSET}>.
export function TransactionItem({ transaction, currency, onPress }: TransactionItemProps) {
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const category = getCategoryById(transaction.categoryId);
  const { colors, sys, isDark } = useTheme();
  const income = transaction.type === 'income' || transaction.amount < 0; // paybacks are money in

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.pressed }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <CategoryIcon icon={category?.icon ?? 'help-circle'} color={category?.color ?? sys.gray} size={44} />

      <View style={styles.details}>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {formatTransactionDate(transaction.date)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: income ? (isDark ? sys.green : '#248A3D') : colors.text }]}>
          {income ? '+' : '−'}
          {formatCurrency(Math.abs(transaction.amount), currency)}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {category?.name ?? 'Uncategorized'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.lg,
    paddingVertical: 10,
    gap: Space.md,
  },
  details: { flex: 1 },
  description: { ...Type.bodyLg, marginBottom: 1 },
  meta: { ...Type.footnote },
  right: { alignItems: 'flex-end', maxWidth: '45%' },
  amount: { ...Type.bodyLg, fontWeight: '600' },
});
