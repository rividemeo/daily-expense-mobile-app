import { Platform } from 'react-native';
import { getDatabase } from '../db';
import { Budget } from '@/types/models';

function rowToBudget(row: Record<string, unknown>): Budget {
  return {
    id: row.id as string,
    name: row.name as string,
    categoryId: row.category_id as string | undefined,
    amount: row.amount as number,
    spent: row.spent as number,
    period: row.period as Budget['period'],
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    alertThreshold50: Boolean(row.alert_threshold_50),
    alertThreshold80: Boolean(row.alert_threshold_80),
    alertThreshold100: Boolean(row.alert_threshold_100),
    userId: row.user_id as string,
    familyId: row.family_id as string | undefined,
    isShared: Boolean(row.is_shared),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function insertBudget(budget: Budget): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO budgets (
      id, name, category_id, amount, spent, period, start_date, end_date,
      alert_threshold_50, alert_threshold_80, alert_threshold_100,
      user_id, family_id, is_shared, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      budget.id, budget.name, budget.categoryId ?? null, budget.amount, budget.spent,
      budget.period, budget.startDate, budget.endDate,
      budget.alertThreshold50 ? 1 : 0, budget.alertThreshold80 ? 1 : 0, budget.alertThreshold100 ? 1 : 0,
      budget.userId, budget.familyId ?? null, budget.isShared ? 1 : 0,
      budget.createdAt, budget.updatedAt,
    ]
  );
}

export async function updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE budgets SET name = COALESCE(?, name), amount = COALESCE(?, amount), spent = COALESCE(?, spent), updated_at = ? WHERE id = ?`,
    [updates.name ?? null, updates.amount ?? null, updates.spent ?? null, now, id]
  );
}

export async function deleteBudget(id: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  await db.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
}

export async function getBudgets(userId: string): Promise<Budget[]> {
  if (Platform.OS === 'web') return [];
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows.map(rowToBudget);
}

export async function updateBudgetSpent(budgetId: string, spentDelta: number): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE budgets SET spent = MAX(0, spent + ?), updated_at = ? WHERE id = ?',
    [spentDelta, now, budgetId]
  );
}
