import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';
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
  const { colors, accent, isDark } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.97); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.surface }, animatedStyle]}>
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
      >
        <CategoryIcon
          icon={category?.icon ?? 'help-circle'}
          color={category?.color ?? colors.textTertiary}
          size={44}
        />

        <View style={styles.details}>
          <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
            {transaction.description}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.category, { color: colors.textSecondary }]}>{category?.name ?? 'Uncategorized'}</Text>
            <Text style={[styles.dot, { color: colors.textTertiary }]}>·</Text>
            <Text style={[styles.date, { color: colors.textTertiary }]}>{formatTransactionDate(transaction.date)}</Text>
          </View>
          {transaction.tags.length > 0 && (
            <View style={styles.tags}>
              {transaction.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.tagText, { color: accent }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.amountSection}>
          <Text
            style={[
              styles.amount,
              {
                color:
                  transaction.type === 'income'
                    ? isDark ? Colors.success.light : Colors.income
                    : isDark ? Colors.error.light : Colors.expense,
              },
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount, currency)}
          </Text>
          <View style={[styles.methodBadge, { backgroundColor: colors.surfaceAlt }]}>
            <MaterialCommunityIcons
              name={PAYMENT_ICONS[transaction.paymentMethod] ?? 'credit-card-outline'}
              size={14}
              color={colors.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const PAYMENT_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  cash: 'cash',
  credit_card: 'credit-card-outline',
  debit_card: 'credit-card-chip-outline',
  bank_transfer: 'bank-outline',
  digital_wallet: 'cellphone',
  other: 'wallet-outline',
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Space.lg,
    marginBottom: Space.sm,
    borderRadius: Radius.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.md,
    gap: Space.md,
  },
  details: {
    flex: 1,
  },
  description: {
    ...Type.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  category: { ...Type.caption },
  dot: { ...Type.caption },
  date: { ...Type.caption },
  tags: { flexDirection: 'row', gap: Space.xs, marginTop: Space.xs },
  tag: {
    borderRadius: Radius.sm,
    paddingHorizontal: Space.sm,
    paddingVertical: 1,
  },
  tagText: { ...Type.caption },
  amountSection: { alignItems: 'flex-end', gap: Space.xs },
  amount: {
    ...Type.body,
    fontWeight: '600',
  },
  methodBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
