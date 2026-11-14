import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { signedAmount } from '@/shared/constants/categories';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { ListGroup } from '@/shared/components/ui/ListGroup';
import { SegmentedControl } from '@/shared/components/ui/SegmentedControl';
import { CurrencyInput } from '@/shared/components/ui/CurrencyInput';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useAuthStore } from '@/stores/authStore';
import { useCategoryStore } from '@/stores/categoryStore';
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

export type TransactionForm = z.infer<typeof transactionSchema>;

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit' },
  { value: 'debit_card', label: 'Debit' },
  { value: 'bank_transfer', label: 'Bank' },
  { value: 'digital_wallet', label: 'Wallet' },
];

interface TransactionFormScreenProps {
  title: string;
  saveLabel: string;
  defaults: TransactionForm;
  initialType?: TransactionType;
  initialTags?: string[];
  pending: boolean;
  onSave: (data: TransactionForm, type: TransactionType, tags: string[]) => void;
}

// Shared iOS modal form used by both the new and edit transaction routes.
export function TransactionFormScreen({
  title,
  saveLabel,
  defaults,
  initialType = 'expense',
  initialTags = [],
  pending,
  onSave,
}: TransactionFormScreenProps) {
  const { colors, accent, sys } = useTheme();
  const currency = useAuthStore((s) => s.user?.currency);
  const [type, setType] = useState<TransactionType>(initialType);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const getCategoriesByType = useCategoryStore((s) => s.getCategoriesByType);

  const categories = getCategoriesByType(type);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionForm>({ resolver: zodResolver(transactionSchema), defaultValues: defaults });

  const selectedCategoryId = watch('categoryId');
  const selectedPaymentMethod = watch('paymentMethod');

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const error = (msg?: string) => (msg ? <Text style={[styles.error, { color: sys.red }]}>{msg}</Text> : null);
  const inputStyle = [styles.textRow, { color: colors.text }];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} style={styles.barBtn} accessibilityRole="button" accessibilityLabel="Cancel" hitSlop={8}>
          <Text style={[Type.bodyLg, { color: accent }]}>Cancel</Text>
        </Pressable>
        <Text style={[styles.barTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
        <Pressable
          onPress={handleSubmit((data) => onSave(data, type, tags))}
          disabled={pending}
          style={[styles.barBtn, styles.barRight]}
          accessibilityRole="button"
          accessibilityLabel={saveLabel}
          accessibilityState={{ disabled: pending }}
          hitSlop={8}
        >
          <Text style={[Type.title, { color: pending ? colors.textTertiary : accent }]}>{saveLabel}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <SegmentedControl
            value={type}
            onChange={(v) => {
              setType(v);
              setValue('categoryId', '');
            }}
            options={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]}
            style={styles.segment}
          />

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <CurrencyInput large value={value} onChangeValue={onChange} currency={currency} error={errors.amount?.message} style={styles.amount} />
            )}
          />

          <View>
            <ListGroup>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Description"
                    placeholderTextColor={colors.textTertiary}
                    accessibilityLabel="Description"
                    maxLength={100}
                    style={inputStyle}
                  />
                )}
              />
              <View style={styles.row}>
                <Text style={[Type.bodyLg, { color: colors.text }]}>Date</Text>
                <Controller
                  control={control}
                  name="date"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textTertiary}
                      accessibilityLabel="Date"
                      style={[styles.rowValue, { color: colors.textSecondary }]}
                    />
                  )}
                />
              </View>
            </ListGroup>
            {error(errors.description?.message)}
          </View>

          <View>
            <ListGroup header="Category">
              <View style={styles.catGrid}>
                {categories.map((cat) => {
                  const on = selectedCategoryId === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      style={styles.catCell}
                      onPress={() => setValue('categoryId', cat.id, { shouldValidate: true })}
                      accessibilityRole="button"
                      accessibilityLabel={cat.name}
                      accessibilityState={{ selected: on }}
                    >
                      <View style={[styles.ring, { borderColor: on ? accent : 'transparent' }]}>
                        <CategoryIcon icon={cat.icon} color={cat.color} size={44} />
                      </View>
                      <Text style={[Type.caption, { color: on ? accent : colors.text }]} numberOfLines={1}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ListGroup>
            {error(errors.categoryId?.message)}
          </View>

          <ListGroup header="Payment Method">
            <View style={styles.capsules}>
              {PAYMENT_METHODS.map((pm) => (
                <Capsule
                  key={pm.value}
                  label={pm.label}
                  selected={selectedPaymentMethod === pm.value}
                  onPress={() => setValue('paymentMethod', pm.value)}
                />
              ))}
            </View>
          </ListGroup>

          <ListGroup header="Tags">
            <View style={styles.row}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                placeholder="Add tag"
                placeholderTextColor={colors.textTertiary}
                accessibilityLabel="Add tag"
                returnKeyType="done"
                style={[styles.flex, Type.bodyLg, { color: colors.text }]}
              />
              <Pressable onPress={addTag} accessibilityRole="button" accessibilityLabel="Add tag" hitSlop={10}>
                <Ionicons name="add-circle" size={26} color={tagInput.trim() ? accent : colors.textTertiary} />
              </Pressable>
            </View>
            {tags.length > 0 && (
              <View style={styles.capsules}>
                {tags.map((tag) => (
                  <Capsule key={tag} label={`#${tag}`} onPress={() => setTags(tags.filter((t) => t !== tag))} removable />
                ))}
              </View>
            )}
          </ListGroup>

          <ListGroup>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value ?? ''}
                  onChangeText={onChange}
                  placeholder="Notes"
                  placeholderTextColor={colors.textTertiary}
                  accessibilityLabel="Notes"
                  multiline
                  style={[inputStyle, styles.notes]}
                />
              )}
            />
          </ListGroup>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Capsule({ label, selected, removable, onPress }: { label: string; selected?: boolean; removable?: boolean; onPress: () => void }) {
  const { colors, accent } = useTheme();
  const fg = selected ? '#FFFFFF' : colors.text;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={removable ? `Remove ${label}` : label}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [styles.capsule, { backgroundColor: selected ? accent : colors.surfaceAlt, opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={[Type.body, { color: fg, fontWeight: selected ? '600' : '400' }]}>{label}</Text>
      {removable ? <Ionicons name="close" size={14} color={colors.textSecondary} /> : null}
    </Pressable>
  );
}

export default function NewTransactionScreen() {
  const user = useAuthStore((s) => s.user);
  const createTransaction = useCreateTransaction();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  return (
    <TransactionFormScreen
      title="New Transaction"
      saveLabel="Add"
      pending={createTransaction.isPending}
      defaults={{
        amount: '',
        description: '',
        categoryId: categoryId ?? '', // opened from a category screen
        date: formatDateInput(new Date()),
        notes: '',
        paymentMethod: 'cash',
      }}
      onSave={(data, type, tags) =>
        createTransaction.mutate(
          {
            amount: signedAmount(parseFloat(data.amount), data.categoryId),
            type,
            categoryId: data.categoryId,
            description: data.description,
            date: data.date,
            tags,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            userId: user?.id ?? '',
            isRecurring: false,
          },
          { onSuccess: () => router.back() }
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  bar: { height: TOUCH + 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Space.lg },
  barBtn: { minWidth: 70, minHeight: TOUCH, justifyContent: 'center' },
  barRight: { alignItems: 'flex-end' },
  barTitle: { ...Type.title, flex: 1, textAlign: 'center' },
  content: { paddingTop: Space.sm, paddingBottom: Space.xxl, gap: Space.xl },
  segment: { marginHorizontal: Space.lg },
  amount: { paddingHorizontal: Space.lg, paddingVertical: Space.sm },
  error: { ...Type.footnote, marginHorizontal: Space.xxl, marginTop: 6 },
  textRow: { ...Type.bodyLg, minHeight: TOUCH, paddingHorizontal: Space.lg, paddingVertical: 11 },
  notes: { minHeight: 88, textAlignVertical: 'top' },
  row: { minHeight: TOUCH, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Space.lg, gap: Space.md },
  rowValue: { ...Type.bodyLg, flex: 1, textAlign: 'right', paddingVertical: 11 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: Space.md, paddingHorizontal: Space.xs },
  catCell: { width: '25%', alignItems: 'center', gap: Space.xs, paddingVertical: Space.xs, paddingHorizontal: 2 },
  ring: { padding: 2, borderWidth: 2.5, borderRadius: Radius.pill },
  capsules: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, padding: Space.md },
  capsule: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
  },
});
