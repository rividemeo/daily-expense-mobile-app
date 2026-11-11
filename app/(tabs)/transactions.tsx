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
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
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
  const { colors, accent, isDark } = useTheme();
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
              style={[styles.filterButton, { backgroundColor: colors.surfaceAlt }]}
              accessibilityRole="button"
              accessibilityLabel="Filter and sort options"
            >
              <MaterialCommunityIcons name="filter-variant" size={22} color={colors.text} />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={() => router.push('/settings/export')} title="Export" leadingIcon="export" />
          <Menu.Item onPress={() => router.push('/settings/import')} title="Import" leadingIcon="import" />
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
        style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
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
            hitSlop={{ top: 6, bottom: 6 }}
            style={[
              styles.chip,
              { backgroundColor: colors.surfaceAlt },
              typeFilter === t && { backgroundColor: accent },
            ]}
            textStyle={[
              styles.chipText,
              { color: colors.textSecondary },
              typeFilter === t && { color: isDark ? Colors.primary[900] : Colors.white },
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
              tintColor={accent}
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
    paddingHorizontal: Space.lg,
    paddingTop: Space.sm,
    paddingBottom: Space.md,
  },
  title: { ...Type.headline },
  filterButton: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    marginHorizontal: Space.lg,
    marginBottom: Space.md,
    borderRadius: Radius.md,
    elevation: 0,
    borderWidth: 1,
  },
  chips: {
    flexDirection: 'row',
    paddingHorizontal: Space.lg,
    gap: Space.sm,
    marginBottom: Space.sm,
  },
  chip: { borderRadius: Radius.pill },
  chipText: { ...Type.body },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
  },
  dateLabel: { ...Type.body, fontWeight: '600' },
  dateTotal: { ...Type.caption },
  listContent: { paddingBottom: 100 },
});
