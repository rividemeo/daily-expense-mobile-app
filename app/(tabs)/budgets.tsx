import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, Portal, Modal, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/shared/constants/colors';
import { ProgressBar } from '@/shared/components/ui/ProgressBar';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { CurrencyInput } from '@/shared/components/ui/CurrencyInput';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { CardSkeleton } from '@/shared/components/ui/Skeleton';
import { FAB } from '@/shared/components/ui/FAB';
import { useBudgetsQuery, useCreateBudget, useDeleteBudget } from '@/hooks/useBudgets';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { getCurrentMonthRange } from '@/shared/utils/formatDate';
import { Budget } from '@/types/models';

const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  amount: z.string().min(1, 'Amount required').refine((v) => parseFloat(v) > 0, 'Must be > 0'),
  categoryId: z.string().optional(),
  period: z.enum(['monthly', 'weekly', 'yearly']),
});

type BudgetForm = z.infer<typeof budgetSchema>;

export default function BudgetsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: budgets, isLoading } = useBudgetsQuery();
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();
  const getCategoriesByType = useCategoryStore((s) => s.getCategoriesByType);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);

  const expenseCategories = getCategoriesByType('expense');
  const currency = user?.currency ?? 'IDR';
  const { startDate, endDate } = getCurrentMonthRange();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { name: '', amount: '', categoryId: '', period: 'monthly' },
  });

  const selectedCategoryId = watch('categoryId');
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['budgets'] });
    setRefreshing(false);
  };

  const onSubmit = (data: BudgetForm) => {
    createBudget.mutate(
      {
        name: data.name,
        amount: parseFloat(data.amount),
        categoryId: data.categoryId || undefined,
        period: data.period,
        startDate,
        endDate,
        alertThreshold50: true,
        alertThreshold80: true,
        alertThreshold100: true,
        userId: user?.id ?? '',
        isShared: false,
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          reset();
        },
      }
    );
  };

  const totalBudget = budgets?.reduce((s, b) => s + b.amount, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;
  const totalRemaining = totalBudget - totalSpent;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Budgets</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary.main} />}
      >
        {/* Summary */}
        {!isLoading && budgets && budgets.length > 0 && (
          <View style={[styles.summary, { backgroundColor: Colors.primary.main }]}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Budget</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalBudget, currency, { compact: true })}</Text>
            </View>
            <View style={styles.summarySep} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalSpent, currency, { compact: true })}</Text>
            </View>
            <View style={styles.summarySep} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={[styles.summaryValue, { color: totalRemaining < 0 ? Colors.error.light : Colors.success.light }]}>
                {formatCurrency(totalRemaining, currency, { compact: true })}
              </Text>
            </View>
          </View>
        )}

        {isLoading ? (
          [1, 2, 3].map((i) => <CardSkeleton key={i} />)
        ) : budgets && budgets.length > 0 ? (
          budgets.map((budget) => <BudgetCard key={budget.id} budget={budget} currency={currency} getCategoryById={getCategoryById} onDelete={() => deleteBudget.mutate(budget.id)} colors={colors} />)
        ) : (
          <EmptyState
            icon="wallet-outline"
            title="No budgets set"
            description="Create budgets to track your spending and stay on target"
            actionLabel="Create Budget"
            onAction={() => setModalVisible(true)}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB icon="plus" onPress={() => setModalVisible(true)} />

      {/* Add Budget Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => { setModalVisible(false); reset(); }}
          contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Budget</Text>
            <TouchableOpacity onPress={() => { setModalVisible(false); reset(); }}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input label="Budget name" value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="tag-outline" />
                )}
              />
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, value } }) => (
                  <CurrencyInput value={value} onChangeValue={onChange} currency={currency} error={errors.amount?.message} />
                )}
              />

              <Controller
                control={control}
                name="period"
                render={({ field: { onChange, value } }) => (
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={[
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'yearly', label: 'Yearly' },
                    ]}
                  />
                )}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                <TouchableOpacity
                  style={[styles.catChip, !selectedCategoryId && styles.catChipSelected]}
                  onPress={() => setValue('categoryId', '')}
                >
                  <MaterialCommunityIcons name="all-inclusive" size={20} color={!selectedCategoryId ? Colors.primary.main : colors.textSecondary} />
                  <Text style={{ fontSize: 10, color: !selectedCategoryId ? Colors.primary.main : colors.textSecondary }}>All</Text>
                </TouchableOpacity>
                {expenseCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, selectedCategoryId === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '15' }]}
                    onPress={() => setValue('categoryId', cat.id)}
                  >
                    <CategoryIcon icon={cat.icon} color={cat.color} size={24} />
                    <Text style={{ fontSize: 10, color: selectedCategoryId === cat.id ? cat.color : colors.text }} numberOfLines={1}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Button onPress={handleSubmit(onSubmit)} loading={createBudget.isPending} fullWidth size="large">
                Create Budget
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

function BudgetCard({
  budget,
  currency,
  getCategoryById,
  onDelete,
  colors,
}: {
  budget: Budget;
  currency: string;
  getCategoryById: (id: string) => any;
  onDelete: () => void;
  colors: any;
}) {
  const category = budget.categoryId ? getCategoryById(budget.categoryId) : null;
  const progress = budget.amount > 0 ? budget.spent / budget.amount : 0;
  const remaining = budget.amount - budget.spent;
  const isOverBudget = remaining < 0;

  return (
    <View style={[styles.budgetCard, { backgroundColor: colors.surface }]}>
      <View style={styles.budgetCardHeader}>
        <View style={styles.budgetCardLeft}>
          {category ? (
            <CategoryIcon icon={category.icon} color={category.color} size={40} />
          ) : (
            <View style={[styles.budgetAllIcon, { backgroundColor: Colors.primary[50] }]}>
              <MaterialCommunityIcons name="all-inclusive" size={20} color={Colors.primary.main} />
            </View>
          )}
          <View>
            <Text style={[styles.budgetCardName, { color: colors.text }]}>{budget.name}</Text>
            <Text style={[styles.budgetCardPeriod, { color: colors.textSecondary }]}>
              {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error.main} />
        </TouchableOpacity>
      </View>

      <ProgressBar
        progress={progress}
        height={8}
        showLabel
        label={`${formatCurrency(budget.spent, currency, { compact: true })} / ${formatCurrency(budget.amount, currency, { compact: true })}`}
        style={styles.progressBar}
      />

      <View style={styles.budgetCardFooter}>
        <Text style={[styles.remainingText, { color: isOverBudget ? Colors.error.main : Colors.success.main }]}>
          {isOverBudget
            ? `${formatCurrency(Math.abs(remaining), currency)} over budget`
            : `${formatCurrency(remaining, currency)} remaining`}
        </Text>
        {progress >= 0.8 && progress < 1 && (
          <View style={styles.alertBadge}>
            <MaterialCommunityIcons name="alert-circle" size={14} color={Colors.warning.main} />
            <Text style={styles.alertText}>Warning</Text>
          </View>
        )}
        {progress >= 1 && (
          <View style={[styles.alertBadge, { backgroundColor: Colors.error.background }]}>
            <MaterialCommunityIcons name="alert" size={14} color={Colors.error.main} />
            <Text style={[styles.alertText, { color: Colors.error.main }]}>Over budget!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '800' },
  content: { padding: 16, gap: 12, paddingBottom: 100 },
  summary: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 },
  summaryValue: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  summarySep: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  budgetCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  budgetCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  budgetAllIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCardName: { fontSize: 16, fontWeight: '600' },
  budgetCardPeriod: { fontSize: 12 },
  deleteBtn: { padding: 4 },
  progressBar: {},
  budgetCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remainingText: { fontSize: 13, fontWeight: '600' },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.warning.background,
  },
  alertText: { fontSize: 11, fontWeight: '600', color: Colors.warning.main },
  modal: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[200],
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalContent: { padding: 20, gap: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600' },
  catRow: { gap: 10 },
  catChip: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.grey[200],
    width: 68,
    gap: 4,
  },
  catChipSelected: { borderColor: Colors.primary.main, backgroundColor: Colors.primary[50] },
});
