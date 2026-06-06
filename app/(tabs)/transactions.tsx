import React, { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Chip, Searchbar, Menu, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/shared/constants/colors';
import { TransactionItem } from '@/features/transactions/components/TransactionItem';
import { TransactionSkeleton } from '@/shared/components/ui/Skeleton';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { FAB } from '@/shared/components/ui/FAB';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';
import { groupTransactionsByDate } from '@/shared/utils/formatDate';
import { Transaction } from '@/types/models';

export default function TransactionsScreen() {
  const { colors, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [menuVisible, setMenuVisible] = useState(false);

  const filters = {
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    pageSize: 50,
  };

  const { data: transactions, isLoading, refetch } = useTransactionsQuery(filters);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    setRefreshing(false);
  }, [queryClient]);

  const currency = user?.currency ?? 'IDR';
  const grouped = groupTransactionsByDate(transactions ?? []);

  const renderItem = ({ item }: { item: { date: string; label: string; items: Transaction[] } }) => (
    <View>
      <View style={[styles.dateHeader, { backgroundColor: colors.background }]}>
        <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{item.label}</Text>
        <Text style={[styles.dateTotal, { color: colors.textSecondary }]}>
          {item.items.length} transaction{item.items.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {item.items.map((tx) => (
        <TransactionItem
          key={tx.id}
          transaction={tx}
          currency={currency}
          onPress={() => router.push(`/transaction/${tx.id}`)}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.filterButton}
            >
              <MaterialCommunityIcons name="filter-variant" size={22} color={colors.text} />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={() => router.push('/transaction/export')} title="Export" leadingIcon="export" />
          <Menu.Item onPress={() => router.push('/transaction/import')} title="Import" leadingIcon="import" />
          <Divider />
          <Menu.Item onPress={() => {}} title="Sort by Date" leadingIcon="sort-calendar-descending" />
          <Menu.Item onPress={() => {}} title="Sort by Amount" leadingIcon="sort-numeric-descending" />
        </Menu>
      </View>

      {/* Search */}
      <Searchbar
        placeholder="Search transactions..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchBar, { backgroundColor: colors.surface }]}
        inputStyle={{ color: colors.text }}
        iconColor={colors.textSecondary}
      />

      {/* Filter Chips */}
      <View style={styles.chips}>
        {(['all', 'income', 'expense'] as const).map((t) => (
          <Chip
            key={t}
            selected={typeFilter === t}
            onPress={() => setTypeFilter(t)}
            style={[
              styles.chip,
              typeFilter === t && {
                backgroundColor:
                  t === 'income'
                    ? Colors.success.background
                    : t === 'expense'
                    ? Colors.error.background
                    : Colors.primary[50],
              },
            ]}
            textStyle={[
              styles.chipText,
              typeFilter === t && {
                color:
                  t === 'income'
                    ? Colors.success.main
                    : t === 'expense'
                    ? Colors.error.main
                    : Colors.primary.main,
              },
            ]}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Chip>
        ))}
      </View>

      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <TransactionSkeleton />}
        />
      ) : grouped.length > 0 ? (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.date}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary.main}
            />
          }
        />
      ) : (
        <EmptyState
          icon="swap-horizontal"
          title="No transactions found"
          description={
            search
              ? `No results for "${search}"`
              : 'Add your first transaction to get started'
          }
          actionLabel={search ? undefined : 'Add Transaction'}
          onAction={search ? undefined : () => router.push('/transaction/new')}
        />
      )}

      <FAB icon="plus" onPress={() => router.push('/transaction/new')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '800' },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.grey[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.grey[200],
  },
  chips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  chip: { borderRadius: 20 },
  chipText: { fontSize: 13 },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateLabel: { fontSize: 13, fontWeight: '600' },
  dateTotal: { fontSize: 12 },
  listContent: { paddingBottom: 100 },
});
