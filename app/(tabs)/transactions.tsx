import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, TextInput, Pressable } from 'react-native';
import { Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { TransactionItem, TX_ROW_INSET } from '@/features/transactions/components/TransactionItem';
import { TransactionSkeleton } from '@/shared/components/ui/Skeleton';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { LargeTitle, HeaderButton } from '@/shared/components/ui/LargeTitle';
import { ListGroup } from '@/shared/components/ui/ListGroup';
import { SegmentedControl } from '@/shared/components/ui/SegmentedControl';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';
import { groupTransactionsByDate } from '@/shared/utils/formatDate';
import { Transaction } from '@/types/models';

type TypeFilter = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
  const { colors, accent } = useTheme();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [menuVisible, setMenuVisible] = useState(false);

  const filters = {
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    pageSize: 50,
  };

  const { data: transactions, isLoading } = useTransactionsQuery(filters);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    setRefreshing(false);
  }, [queryClient]);

  const currency = user?.currency ?? 'IDR';
  const grouped = groupTransactionsByDate(transactions ?? []);

  const renderItem = ({ item }: { item: { date: string; label: string; items: Transaction[] } }) => (
    <ListGroup header={item.label} separatorInset={TX_ROW_INSET} style={styles.group}>
      {item.items.map((tx) => (
        <TransactionItem
          key={tx.id}
          transaction={tx}
          currency={currency}
          onPress={() => router.push(`/transaction/${tx.id}`)}
        />
      ))}
    </ListGroup>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <LargeTitle
        title="Transactions"
        right={
          <>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <HeaderButton icon="ellipsis-horizontal-circle" label="Filter and sort options" onPress={() => setMenuVisible(true)} />
              }
            >
              <Menu.Item onPress={() => router.push('/settings/export')} title="Export" leadingIcon="export" />
              <Menu.Item onPress={() => router.push('/settings/import')} title="Import" leadingIcon="import" />
            </Menu>
            <HeaderButton icon="add" label="Add transaction" onPress={() => router.push('/transaction/new')} />
          </>
        }
      />

      <View style={[styles.search, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name="search" size={17} color={colors.textTertiary} />
        <TextInput
          placeholder="Search"
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
          accessibilityLabel="Search transactions"
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={17} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      <SegmentedControl<TypeFilter>
        value={typeFilter}
        onChange={setTypeFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'expense', label: 'Expenses' },
          { value: 'income', label: 'Income' },
        ]}
        style={styles.segments}
      />

      {isLoading ? (
        <ListGroup separatorInset={TX_ROW_INSET} style={styles.group}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TransactionSkeleton key={i} />
          ))}
        </ListGroup>
      ) : grouped.length > 0 ? (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.date}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} colors={[accent]} />
          }
        />
      ) : (
        <EmptyState
          icon="swap-horizontal"
          title="No transactions found"
          description={search ? `No results for "${search}"` : 'Add your first transaction to get started'}
          actionLabel={search ? undefined : 'Add Transaction'}
          onAction={search ? undefined : () => router.push('/transaction/new')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: Space.lg,
    paddingHorizontal: Space.sm,
    borderRadius: Radius.md,
  },
  searchInput: { flex: 1, ...Type.bodyLg, paddingVertical: 0 },
  segments: { marginHorizontal: Space.lg, marginTop: Space.md, marginBottom: Space.sm },
  group: { marginTop: Space.xl },
  listContent: { paddingBottom: Space.xxl },
});
