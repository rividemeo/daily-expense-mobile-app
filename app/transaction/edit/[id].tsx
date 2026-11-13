import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LargeTitle } from '@/shared/components/ui/LargeTitle';
import { useUpdateTransaction } from '@/hooks/useTransactions';
import { useTransactionStore } from '@/stores/transactionStore';
import { useTheme } from '@/hooks/useTheme';
import { useQueryClient } from '@tanstack/react-query';
import { TransactionFormScreen } from '../new';
import { signedAmount } from '@/shared/constants/categories';
import type { TransactionType } from '@/types/models';
import { rememberCategory } from '@/features/import/categoryMemory';
import { countSameName, recategorizeSameName } from '@/services/database/repositories/transactionRepository';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const transaction = useTransactionStore((s) => s.transactions.find((t) => t.id === id));
  const updateTransaction = useUpdateTransaction();
  const queryClient = useQueryClient();

  // A new category for "Warung Bu" is remembered for future imports, and the user can
  // move every other "Warung Bu" along with it.
  const learn = async (description: string, type: TransactionType, categoryId: string) => {
    await rememberCategory(description, type, categoryId);
    const others = await countSameName(description, type, categoryId);
    if (!others) return router.back();
    Alert.alert(
      `Move ${others} more?`,
      `${others} other "${description}" transaction${others > 1 ? 's are' : ' is'} in a different category.`,
      [
        { text: 'Only this one', style: 'cancel', onPress: () => router.back() },
        {
          text: 'Move all',
          onPress: async () => {
            await recategorizeSameName(description, type, categoryId);
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-stats'] });
            router.back();
          },
        },
      ],
    );
  };

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LargeTitle back title="Edit Transaction" />
        <View style={styles.notFound}>
          <Text style={{ color: colors.textSecondary }}>Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TransactionFormScreen
      title="Edit Transaction"
      saveLabel="Save"
      pending={updateTransaction.isPending}
      initialType={transaction.type}
      initialTags={transaction.tags}
      defaults={{
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.description,
        categoryId: transaction.categoryId,
        date: transaction.date,
        notes: transaction.notes ?? '',
        paymentMethod: transaction.paymentMethod,
      }}
      onSave={(data, type, tags) =>
        updateTransaction.mutate(
          {
            id: transaction.id,
            data: {
              amount: signedAmount(parseFloat(data.amount), data.categoryId),
              type,
              categoryId: data.categoryId,
              description: data.description,
              date: data.date,
              tags,
              paymentMethod: data.paymentMethod,
              notes: data.notes,
              updatedAt: new Date().toISOString(),
            },
          },
          {
            onSuccess: () =>
              data.categoryId !== transaction.categoryId
                ? learn(data.description, type, data.categoryId)
                : router.back(),
          }
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
