import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors } from '@/shared/constants/colors';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { Transaction, Category } from '@/types/models';
import { formatTransactionDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useCategoryStore } from '@/stores/categoryStore';

interface TransactionItemProps {
  transaction: Transaction;
  currency: string;
  onPress?: () => void;
  onDelete?: () => void;
}

export function TransactionItem({
  transaction,
  currency,
  onPress,
  onDelete,
}: TransactionItemProps) {
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const category = getCategoryById(transaction.categoryId);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.97); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <CategoryIcon
          icon={category?.icon ?? 'help-circle'}
          color={category?.color ?? Colors.grey[400]}
          size={44}
        />

        <View style={styles.details}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.category}>{category?.name ?? 'Uncategorized'}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.date}>{formatTransactionDate(transaction.date)}</Text>
          </View>
          {transaction.tags.length > 0 && (
            <View style={styles.tags}>
              {transaction.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.amountSection}>
          <Text
            style={[
              styles.amount,
              { color: transaction.type === 'income' ? Colors.income : Colors.expense },
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount, currency)}
          </Text>
          <View style={styles.methodBadge}>
            <Text style={styles.methodText}>
              {PAYMENT_ICONS[transaction.paymentMethod] ?? '💳'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const PAYMENT_ICONS: Record<string, string> = {
  cash: '💵',
  credit_card: '💳',
  debit_card: '🏧',
  bank_transfer: '🏦',
  digital_wallet: '📱',
  other: '💰',
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 1,
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.grey[900],
    marginBottom: 3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: { fontSize: 12, color: Colors.grey[500] },
  dot: { color: Colors.grey[400], fontSize: 12 },
  date: { fontSize: 12, color: Colors.grey[400] },
  tags: { flexDirection: 'row', gap: 4, marginTop: 4 },
  tag: {
    backgroundColor: Colors.primary[50],
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tagText: { fontSize: 10, color: Colors.primary.main },
  amountSection: { alignItems: 'flex-end', gap: 4 },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  methodBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.grey[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: { fontSize: 12 },
});
