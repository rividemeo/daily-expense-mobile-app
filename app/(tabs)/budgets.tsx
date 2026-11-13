import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, RefreshControl } from 'react-native';
import { Text, Portal, Modal } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { ProgressBar } from '@/shared/components/ui/ProgressBar';
import { Input } from '@/shared/components/ui/Input';
import { CurrencyInput } from '@/shared/components/ui/CurrencyInput';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { CardSkeleton } from '@/shared/components/ui/Skeleton';
import { LargeTitle, HeaderButton } from '@/shared/components/ui/LargeTitle';
import { ListGroup } from '@/shared/components/ui/ListGroup';
import { SegmentedControl } from '@/shared/components/ui/SegmentedControl';
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

const ICON = 32;
const BUDGET_ROW_INSET = Space.lg + ICON + Space.md;

export default function BudgetsScreen() {
  const { colors, sys, accent, isDark } = useTheme();
  const insets = useSafeAreaInsets();
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
  const positive = isDark ? sys.green : '#248A3D';

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

  const closeModal = () => {
    setModalVisible(false);
    reset();
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
      { onSuccess: closeModal }
    );
  };

  const totalBudget = budgets?.reduce((s, b) => s + b.amount, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;
  const totalRemaining = totalBudget - totalSpent;

  const summary: [string, number, string][] = [
    ['Budget', totalBudget, colors.text],
    ['Spent', totalSpent, colors.text],
    ['Remaining', totalRemaining, totalRemaining < 0 ? sys.red : positive],
  ];

  const capsule = (selected: boolean, label: string, onPress: () => void, icon: React.ReactNode, key?: string) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[styles.capsule, { backgroundColor: selected ? accent : colors.surfaceAlt }]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      {icon}
      <Text style={[Type.body, { color: selected ? '#FFFFFF' : colors.text }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <LargeTitle
        title="Budgets"
        right={<HeaderButton icon="add" label="Add budget" onPress={() => setModalVisible(true)} />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} colors={[accent]} />}
      >
        {isLoading ? (
          <View style={styles.skeletons}>
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </View>
        ) : budgets && budgets.length > 0 ? (
          <>
            <View style={[styles.summary, { backgroundColor: colors.surface }]}>
              {summary.map(([label, value, color]) => (
                <View key={label} style={styles.summaryItem}>
                  <Text style={[Type.footnote, { color: colors.textSecondary }]}>{label}</Text>
                  <Text style={[styles.summaryValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
                    {formatCurrency(value, currency, { compact: true })}
                  </Text>
                </View>
              ))}
            </View>

            <ListGroup header="This period" separatorInset={BUDGET_ROW_INSET}>
              {budgets.map((budget) => (
                <BudgetRow
                  key={budget.id}
                  budget={budget}
                  currency={currency}
                  getCategoryById={getCategoryById}
                  onDelete={() => deleteBudget.mutate(budget.id)}
                />
              ))}
            </ListGroup>
          </>
        ) : (
          <EmptyState
            icon="wallet-outline"
            title="No budgets set"
            description="Create budgets to track your spending and stay on target"
            actionLabel="Create Budget"
            onAction={() => setModalVisible(true)}
          />
        )}
      </ScrollView>

      {/* Add Budget sheet */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          style={styles.sheetWrap}
          contentContainerStyle={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + Space.lg }]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.textTertiary }]} />
          <View style={styles.sheetBar}>
            <Pressable onPress={closeModal} style={styles.sheetBtn} accessibilityRole="button" accessibilityLabel="Cancel">
              <Text style={[Type.bodyLg, { color: accent }]}>Cancel</Text>
            </Pressable>
            <Text style={[Type.title, { color: colors.text }]}>New Budget</Text>
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={createBudget.isPending}
              style={[styles.sheetBtn, styles.sheetBtnRight]}
              accessibilityRole="button"
              accessibilityLabel="Add budget"
              accessibilityState={{ disabled: createBudget.isPending, busy: createBudget.isPending }}
            >
              <Text style={[Type.title, { color: accent, opacity: createBudget.isPending ? 0.4 : 1 }]}>Add</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.sheetContent}>
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
                  <SegmentedControl
                    value={value}
                    onChange={onChange}
                    options={[
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'yearly', label: 'Yearly' },
                    ]}
                  />
                )}
              />

              <Text style={[Type.footnote, styles.fieldLabel, { color: colors.textSecondary }]}>CATEGORY (OPTIONAL)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.capsuleRow}>
                {capsule(
                  !selectedCategoryId,
                  'All',
                  () => setValue('categoryId', ''),
                  <MaterialCommunityIcons name="all-inclusive" size={16} color={!selectedCategoryId ? '#FFFFFF' : colors.textSecondary} />
                )}
                {expenseCategories.map((cat) => {
                  const on = selectedCategoryId === cat.id;
                  return capsule(
                    on,
                    cat.name,
                    () => setValue('categoryId', cat.id),
                    <MaterialCommunityIcons name={cat.icon as any} size={16} color={on ? '#FFFFFF' : cat.color} />,
                    cat.id
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

function BudgetRow({
  budget,
  currency,
  getCategoryById,
  onDelete,
}: {
  budget: Budget;
  currency: string;
  getCategoryById: (id: string) => any;
  onDelete: () => void;
}) {
  const { colors, sys, isDark } = useTheme();
  const category = budget.categoryId ? getCategoryById(budget.categoryId) : null;
  const progress = budget.amount > 0 ? budget.spent / budget.amount : 0;
  const remaining = budget.amount - budget.spent;
  const isOverBudget = remaining < 0;

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <CategoryIcon icon={category?.icon ?? 'all-inclusive'} color={category?.color ?? sys.gray} size={ICON} />
        <View style={styles.rowTexts}>
          <Text style={[Type.bodyLg, { color: colors.text }]} numberOfLines={1}>{budget.name}</Text>
          <Text style={[Type.footnote, { color: colors.textSecondary }]}>
            {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
          </Text>
        </View>
        <Pressable
          onPress={onDelete}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel={`Delete budget ${budget.name}`}
        >
          {({ pressed }) => <Ionicons name="trash-outline" size={20} color={sys.red} style={{ opacity: pressed ? 0.4 : 1 }} />}
        </Pressable>
      </View>

      <View style={styles.rowBody}>
        <ProgressBar
          progress={progress}
          height={6}
          showLabel
          label={`${formatCurrency(budget.spent, currency, { compact: true })} of ${formatCurrency(budget.amount, currency, { compact: true })}`}
        />
        <Text
          style={[
            Type.footnote,
            styles.remaining,
            { color: isOverBudget ? sys.red : progress >= 0.8 ? sys.orange : isDark ? sys.green : '#248A3D' },
          ]}
        >
          {isOverBudget
            ? `${formatCurrency(Math.abs(remaining), currency)} over budget`
            : `${formatCurrency(remaining, currency)} left${progress >= 0.8 ? ' · Near limit' : ''}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: Space.sm, paddingBottom: Space.xxl, gap: Space.xl },
  skeletons: { marginHorizontal: Space.lg, gap: Space.md },
  summary: { marginHorizontal: Space.lg, borderRadius: Radius.lg, padding: Space.lg, flexDirection: 'row', gap: Space.md },
  summaryItem: { flex: 1, gap: 2 },
  summaryValue: { ...Type.headline },
  row: { paddingHorizontal: Space.lg, paddingVertical: Space.md, gap: Space.sm },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  rowTexts: { flex: 1 },
  rowBody: { marginLeft: ICON + Space.md, gap: Space.xs },
  remaining: { fontWeight: '500' },
  deleteBtn: { width: TOUCH, height: TOUCH, alignItems: 'flex-end', justifyContent: 'center', marginVertical: -Space.sm },
  sheetWrap: { justifyContent: 'flex-end', margin: 0 },
  sheet: { borderTopLeftRadius: 14, borderTopRightRadius: 14, maxHeight: '90%' },
  grabber: { width: 36, height: 5, borderRadius: 2.5, alignSelf: 'center', marginTop: 6, opacity: 0.5 },
  sheetBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Space.lg },
  sheetBtn: { minWidth: 70, minHeight: TOUCH, justifyContent: 'center' },
  sheetBtnRight: { alignItems: 'flex-end' },
  sheetContent: { padding: Space.lg, gap: Space.lg },
  fieldLabel: { marginBottom: -Space.sm, paddingHorizontal: Space.xs },
  capsuleRow: { gap: Space.sm },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: Space.md,
    borderRadius: Radius.pill,
  },
});
