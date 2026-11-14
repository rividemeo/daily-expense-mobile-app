import { Platform } from 'react-native';
import { getDatabase } from '../db';
import { Transaction } from '@/types/models';
import { TransactionFilters } from '@/types/api';

function rowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    amount: row.amount as number,
    type: row.type as Transaction['type'],
    categoryId: row.category_id as string,
    description: row.description as string,
    date: row.date as string,
    tags: JSON.parse((row.tags as string) || '[]'),
    paymentMethod: row.payment_method as Transaction['paymentMethod'],
    notes: row.notes as string | undefined,
    attachmentUrl: row.attachment_url as string | undefined,
    attachmentPath: row.attachment_path as string | undefined,
    isRecurring: Boolean(row.is_recurring),
    recurringId: row.recurring_id as string | undefined,
    userId: row.user_id as string,
    familyId: row.family_id as string | undefined,
    isSynced: Boolean(row.is_synced),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function insertTransaction(transaction: Transaction): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO transactions (
      id, amount, type, category_id, description, date, tags,
      payment_method, notes, attachment_url, attachment_path,
      is_recurring, recurring_id, user_id, family_id, is_synced,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.id,
      transaction.amount,
      transaction.type,
      transaction.categoryId,
      transaction.description,
      transaction.date,
      JSON.stringify(transaction.tags),
      transaction.paymentMethod,
      transaction.notes ?? null,
      transaction.attachmentUrl ?? null,
      transaction.attachmentPath ?? null,
      transaction.isRecurring ? 1 : 0,
      transaction.recurringId ?? null,
      transaction.userId,
      transaction.familyId ?? null,
      transaction.isSynced ? 1 : 0,
      transaction.createdAt,
      transaction.updatedAt,
    ]
  );
}

export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>
): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE transactions SET
      amount = COALESCE(?, amount),
      type = COALESCE(?, type),
      category_id = COALESCE(?, category_id),
      description = COALESCE(?, description),
      date = COALESCE(?, date),
      tags = COALESCE(?, tags),
      payment_method = COALESCE(?, payment_method),
      notes = ?,
      attachment_url = ?,
      attachment_path = ?,
      is_synced = 0,
      updated_at = ?
    WHERE id = ?`,
    [
      updates.amount ?? null,
      updates.type ?? null,
      updates.categoryId ?? null,
      updates.description ?? null,
      updates.date ?? null,
      updates.tags ? JSON.stringify(updates.tags) : null,
      updates.paymentMethod ?? null,
      updates.notes ?? null,
      updates.attachmentUrl ?? null,
      updates.attachmentPath ?? null,
      now,
      id,
    ]
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function getTransactions(
  userId: string,
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  if (Platform.OS === 'web') return [];
  const db = await getDatabase();
  const conditions: string[] = ['t.user_id = ?'];
  const params: (string | number)[] = [userId];

  if (filters.type) {
    conditions.push('t.type = ?');
    params.push(filters.type);
  }
  if (filters.categoryId) {
    conditions.push('t.category_id = ?');
    params.push(filters.categoryId);
  }
  if (filters.startDate) {
    conditions.push('t.date >= ?');
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push('t.date <= ?');
    params.push(filters.endDate);
  }
  if (filters.minAmount !== undefined) {
    conditions.push('t.amount >= ?');
    params.push(filters.minAmount);
  }
  if (filters.maxAmount !== undefined) {
    conditions.push('t.amount <= ?');
    params.push(filters.maxAmount);
  }
  if (filters.search) {
    conditions.push('(t.description LIKE ? OR t.notes LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const where = conditions.join(' AND ');
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT t.* FROM transactions t WHERE ${where} ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return rows.map(rowToTransaction);
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );
  return row ? rowToTransaction(row) : null;
}

export async function getUnsyncedTransactions(userId: string): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM transactions WHERE user_id = ? AND is_synced = 0',
    [userId]
  );
  return rows.map(rowToTransaction);
}

/** Income and spending between two dates (inclusive): the payday month on the Summary screen. */
export async function getMonthlyStats(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ totalIncome: number; totalExpenses: number }> {
  if (Platform.OS === 'web') return { totalIncome: 0, totalExpenses: 0 };
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ total_income: number; total_expenses: number }>(
    `SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
    FROM transactions
    WHERE user_id = ? AND substr(date, 1, 10) BETWEEN ? AND ?`,
    [userId, startDate, endDate]
  );

  return {
    totalIncome: result?.total_income ?? 0,
    totalExpenses: result?.total_expenses ?? 0,
  };
}

/** Other transactions with the same name that sit in a different category. */
export async function countSameName(description: string, type: string, categoryId: string): Promise<number> {
  if (Platform.OS === 'web') return 0;
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM transactions WHERE description = ? AND type = ? AND category_id != ?',
    [description, type, categoryId]
  );
  return row?.n ?? 0;
}

/** Move every transaction with this name into one category (paybacks become negative). */
export async function recategorizeSameName(description: string, type: string, categoryId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  const sign = categoryId === 'cat_payback' ? '-ABS(amount)' : 'ABS(amount)';
  await db.runAsync(
    `UPDATE transactions SET category_id = ?, amount = ${sign}, is_synced = 0, updated_at = ? WHERE description = ? AND type = ?`,
    [categoryId, new Date().toISOString(), description, type]
  );
}

/** Days a salary arrived; they decide where each payday month starts. */
export async function getSalaryDates(userId: string): Promise<string[]> {
  if (Platform.OS === 'web') return [];
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string }>(
    "SELECT date FROM transactions WHERE user_id = ? AND type = 'income' AND category_id = 'cat_salary'",
    [userId]
  );
  return rows.map((r) => r.date);
}

/** Total spent between two dates (inclusive), optionally in one category. Paybacks are negative. */
export async function sumExpenses(userId: string, startDate: string, endDate: string, categoryId?: string): Promise<number> {
  if (Platform.OS === 'web') return 0;
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT SUM(amount) as total FROM transactions
     WHERE user_id = ? AND type = 'expense' AND substr(date, 1, 10) BETWEEN ? AND ? AND (? IS NULL OR category_id = ?)`,
    [userId, startDate, endDate, categoryId ?? null, categoryId ?? null]
  );
  return Math.max(0, row?.total ?? 0);
}
