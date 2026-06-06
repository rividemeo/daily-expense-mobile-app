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

export async function getMonthlyStats(
  userId: string,
  year: number,
  month: number
): Promise<{ totalIncome: number; totalExpenses: number }> {
  if (Platform.OS === 'web') return { totalIncome: 0, totalExpenses: 0 };
  const db = await getDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const result = await db.getFirstAsync<{ total_income: number; total_expenses: number }>(
    `SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
    FROM transactions
    WHERE user_id = ? AND date BETWEEN ? AND ?`,
    [userId, startDate, endDate]
  );

  return {
    totalIncome: result?.total_income ?? 0,
    totalExpenses: result?.total_expenses ?? 0,
  };
}
