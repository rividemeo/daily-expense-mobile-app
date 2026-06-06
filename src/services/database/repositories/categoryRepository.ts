import { Platform } from 'react-native';
import { getDatabase } from '../db';
import { Category } from '@/types/models';

function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    icon: row.icon as string,
    color: row.color as string,
    type: row.type as Category['type'],
    isDefault: Boolean(row.is_default),
    userId: row.user_id as string | undefined,
    familyId: row.family_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function insertCategory(category: Category): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO categories (id, name, icon, color, type, is_default, user_id, family_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      category.id, category.name, category.icon, category.color, category.type,
      category.isDefault ? 1 : 0, category.userId ?? null, category.familyId ?? null,
      category.createdAt, category.updatedAt,
    ]
  );
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE categories SET name = COALESCE(?, name), icon = COALESCE(?, icon), color = COALESCE(?, color), updated_at = ? WHERE id = ? AND is_default = 0`,
    [updates.name ?? null, updates.icon ?? null, updates.color ?? null, now, id]
  );
}

export async function deleteCategory(id: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ? AND is_default = 0', [id]);
}

export async function getCategories(userId?: string): Promise<Category[]> {
  if (Platform.OS === 'web') return [];
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM categories WHERE is_default = 1 OR user_id = ? ORDER BY is_default DESC, name ASC`,
    [userId ?? null]
  );
  return rows.map(rowToCategory);
}

export async function seedDefaultCategories(categories: Category[]): Promise<void> {
  if (Platform.OS === 'web') return;
  for (const category of categories) {
    await insertCategory(category);
  }
}
