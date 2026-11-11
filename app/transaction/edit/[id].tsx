import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, SegmentedButtons, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { CurrencyInput } from '@/shared/components/ui/CurrencyInput';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { useUpdateTransaction } from '@/hooks/useTransactions';
import { useAuthStore } from '@/stores/authStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { TransactionType, PaymentMethod } from '@/types/models';
import { formatDateInput } from '@/shared/utils/formatDate';
import { useTheme } from '@/hooks/useTheme';

const transactionSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(100),
  categoryId: z.string().min(1, 'Please select a category'),
  date: z.string(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other']),
});

type TransactionForm = z.infer<typeof transactionSchema>;

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash', icon: 'cash' },
  { value: 'credit_card', label: 'Credit', icon: 'credit-card' },
  { value: 'debit_card', label: 'Debit', icon: 'credit-card-outline' },
  { value: 'bank_transfer', label: 'Bank', icon: 'bank-transfer' },
  { value: 'digital_wallet', label: 'Wallet', icon: 'wallet' },
];

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, accent, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);
  const transactions = useTransactionStore((s) => s.transactions);
  const getCategoriesByType = useCategoryStore((s) => s.getCategoriesByType);
  const updateTransaction = useUpdateTransaction();

  const transaction = transactions.find((t) => t.id === id);

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [tags, setTags] = useState<string[]>(transaction?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  const categories = getCategoriesByType(type);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: transaction?.amount.toString() ?? '',
      description: transaction?.description ?? '',
      categoryId: transaction?.categoryId ?? '',
      date: transaction?.date ?? formatDateInput(new Date()),
      notes: transaction?.notes ?? '',
      paymentMethod: transaction?.paymentMethod ?? 'cash',
    },
  });

  const selectedCategoryId = watch('categoryId');
  const selectedPaymentMethod = watch('paymentMethod');

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={{ color: colors.text }}>Transaction not found</Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  const onSubmit = (data: TransactionForm) => {
    updateTransaction.mutate(
      {
        id: transaction.id,
        data: {
          amount: parseFloat(data.amount),
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
      { onSuccess: () => router.back() }
    );
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Transaction</Text>
        <View style={{ width: TOUCH }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SegmentedButtons
            value={type}
            onValueChange={(v) => {
              setType(v as TransactionType);
              setValue('categoryId', '');
            }}
            buttons={[
              {
                value: 'expense',
                label: 'Expense',
                icon: 'arrow-up-circle',
                checkedColor: Colors.white,
                uncheckedColor: colors.textSecondary,
                style: type === 'expense'
                  ? { backgroundColor: Colors.expense }
                  : { backgroundColor: colors.surfaceAlt },
              },
              {
                value: 'income',
                label: 'Income',
                icon: 'arrow-down-circle',
                checkedColor: Colors.white,
                uncheckedColor: colors.textSecondary,
                style: type === 'income'
                  ? { backgroundColor: Colors.income }
                  : { backgroundColor: colors.surfaceAlt },
              },
            ]}
            style={styles.typeToggle}
          />

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <CurrencyInput
                value={value}
                onChangeValue={onChange}
                currency={user?.currency}
                error={errors.amount?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description"
                value={value}
                onChangeText={onChange}
                leftIcon="text"
                error={errors.description?.message}
              />
            )}
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
          {errors.categoryId && (
            <Text style={[styles.fieldError, { color: isDark ? Colors.error.light : Colors.error.main }]}>{errors.categoryId.message}</Text>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  { borderColor: colors.border },
                  selectedCategoryId === cat.id && {
                    backgroundColor: cat.color + '1F',
                    borderColor: cat.color,
                  },
                ]}
                onPress={() => setValue('categoryId', cat.id, { shouldValidate: true })}
                accessibilityRole="button"
                accessibilityLabel={cat.name}
              >
                <CategoryIcon icon={cat.icon} color={cat.color} size={28} />
                <Text
                  style={[
                    styles.categoryChipLabel,
                    { color: selectedCategoryId === cat.id ? cat.color : colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Date"
                value={value}
                onChangeText={onChange}
                leftIcon="calendar"
              />
            )}
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Payment Method</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paymentRow}>
            {PAYMENT_METHODS.map((pm) => (
              <TouchableOpacity
                key={pm.value}
                style={[
                  styles.paymentChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedPaymentMethod === pm.value && {
                    backgroundColor: accent + '1F',
                    borderColor: accent,
                  },
                ]}
                onPress={() => setValue('paymentMethod', pm.value)}
                accessibilityRole="button"
                accessibilityLabel={pm.label}
              >
                <MaterialCommunityIcons
                  name={pm.icon as any}
                  size={20}
                  color={selectedPaymentMethod === pm.value ? accent : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.paymentLabel,
                    { color: selectedPaymentMethod === pm.value ? accent : colors.textSecondary },
                  ]}
                >
                  {pm.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tags</Text>
          <View style={styles.tagInputRow}>
            <Input
              label="Add tag"
              value={tagInput}
              onChangeText={setTagInput}
              style={styles.tagInput}
            />
            <TouchableOpacity
              onPress={addTag}
              style={[styles.tagAddBtn, { borderColor: accent }]}
              accessibilityRole="button"
              accessibilityLabel="Add tag"
            >
              <MaterialCommunityIcons name="plus" size={22} color={accent} />
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagsList}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  onClose={() => setTags(tags.filter((t) => t !== tag))}
                  style={[styles.tagChip, { backgroundColor: colors.surfaceAlt }]}
                  compact
                >
                  #{tag}
                </Chip>
              ))}
            </View>
          )}

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Notes (optional)"
                value={value ?? ''}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                leftIcon="note-text-outline"
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={updateTransaction.isPending}
            fullWidth
            size="large"
            color={type === 'expense' ? 'error' : 'success'}
          >
            Save Changes
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Space.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
  },
  closeBtn: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...Type.title, fontWeight: '700' },
  content: { padding: Space.lg, gap: Space.lg, paddingBottom: Space.xxl + Space.sm },
  typeToggle: { borderRadius: Radius.md },
  fieldLabel: { ...Type.body, fontWeight: '600', marginBottom: Space.sm },
  fieldError: { ...Type.caption, marginTop: -Space.sm, marginBottom: Space.xs },
  categoriesRow: { gap: Space.sm, paddingBottom: Space.xs },
  categoryChip: {
    alignItems: 'center',
    padding: Space.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    width: 72,
    gap: Space.xs,
  },
  categoryChipLabel: { ...Type.caption, textAlign: 'center', fontWeight: '500' },
  paymentRow: { gap: Space.sm, paddingBottom: Space.xs },
  paymentChip: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Space.xs,
    minWidth: 72,
  },
  paymentLabel: { ...Type.caption, fontWeight: '500' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  tagInput: { flex: 1 },
  tagAddBtn: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space.xs,
  },
  tagsList: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  tagChip: {},
});
