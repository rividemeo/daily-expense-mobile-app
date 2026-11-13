import React from 'react';
import { ScrollView, StyleSheet, View, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
import { Space, Type, TOUCH } from '@/shared/constants/theme';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { LargeTitle } from '@/shared/components/ui/LargeTitle';
import { ListGroup, ListRow } from '@/shared/components/ui/ListGroup';
import { useTransactionStore } from '@/stores/transactionStore';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAuthStore } from '@/stores/authStore';
import { formatFullDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useTheme } from '@/hooks/useTheme';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, sys, accent, isDark } = useTheme();
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
        <LargeTitle back title="Transaction" />
        <View style={styles.notFound}>
          <Text style={{ color: colors.textSecondary }}>Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isIncome = transaction.type === 'income' || transaction.amount < 0; // paybacks are money in

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LargeTitle
        back
        title="Transaction"
        right={
          <Pressable
            onPress={() => router.push(`/transaction/edit/${id}`)}
            style={styles.edit}
            accessibilityRole="button"
            accessibilityLabel="Edit transaction"
            hitSlop={8}
          >
            <Text style={[Type.bodyLg, { color: accent }]}>Edit</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <CategoryIcon icon={category?.icon ?? 'help-circle'} color={category?.color ?? sys.gray} size={60} />
          <Text
            style={[styles.amount, { color: isIncome ? (isDark ? sys.green : Colors.success.main) : colors.text }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {isIncome ? '+' : '−'}{formatCurrency(Math.abs(transaction.amount), currency)}
          </Text>
          <Text style={[Type.bodyLg, styles.center, { color: colors.textSecondary }]}>{transaction.description}</Text>
        </View>

        <ListGroup>
          <ListRow title="Type" value={isIncome ? 'Income' : 'Expense'} />
          <ListRow title="Category" value={category?.name ?? 'Unknown'} />
          <ListRow title="Date" value={formatFullDate(transaction.date)} />
          <ListRow title="Payment" value={formatPaymentMethod(transaction.paymentMethod)} />
          {transaction.tags.length > 0 && (
            <ListRow title="Tags" value={transaction.tags.map((t) => `#${t}`).join(' ')} />
          )}
        </ListGroup>

        {transaction.notes ? (
          <ListGroup header="Notes">
            <Text style={[Type.bodyLg, styles.notes, { color: colors.text }]}>{transaction.notes}</Text>
          </ListGroup>
        ) : null}

        <ListGroup>
          <Pressable
            onPress={handleDelete}
            disabled={deleteTransaction.isPending}
            accessibilityRole="button"
            accessibilityLabel="Delete transaction"
            style={({ pressed }) => [styles.deleteRow, pressed && { backgroundColor: colors.pressed }]}
          >
            <Text style={[Type.bodyLg, { color: deleteTransaction.isPending ? colors.textTertiary : sys.red }]}>
              Delete Transaction
            </Text>
          </Pressable>
        </ListGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatPaymentMethod(method: string): string {
  return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  edit: { minHeight: TOUCH, justifyContent: 'center', paddingHorizontal: Space.sm },
  content: { paddingBottom: Space.xxl, gap: Space.xl },
  hero: { alignItems: 'center', gap: Space.sm, paddingHorizontal: Space.xl, paddingTop: Space.lg },
  amount: { ...Type.display, fontSize: 40, lineHeight: 48 },
  center: { textAlign: 'center' },
  notes: { paddingHorizontal: Space.lg, paddingVertical: 11 },
  deleteRow: { minHeight: TOUCH, alignItems: 'center', justifyContent: 'center' },
});
