import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { getSalaryDates } from '@/services/database/repositories/transactionRepository';
import { paydayMonth, paydayYear } from '@/shared/utils/payday';

/** Days a salary arrived. Keyed under 'transactions' so any change to transactions refreshes it. */
export function useSalaryDates(): string[] {
  const user = useAuthStore((s) => s.user);
  const store = useTransactionStore((s) => s.transactions);
  const query = useQuery({
    queryKey: ['transactions', 'salary-dates', user?.id],
    queryFn: () => getSalaryDates(user?.id ?? ''),
    enabled: !!user && Platform.OS !== 'web',
  });
  if (Platform.OS === 'web') {
    return store.filter((t) => t.type === 'income' && t.categoryId === 'cat_salary').map((t) => t.date);
  }
  return query.data ?? [];
}

/** The payday month we're in now, e.g. November = 30 Oct – 29 Nov. */
export function usePaydayMonth() {
  const salaryDates = useSalaryDates();
  const key = salaryDates.join();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => paydayMonth(salaryDates), [key]);
}

/** The twelve payday months of this year. */
export function usePaydayYear() {
  const salaryDates = useSalaryDates();
  const key = salaryDates.join();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => paydayYear(new Date().getFullYear(), salaryDates), [key]);
}
