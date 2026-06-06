import * as SQLite from 'expo-sqlite';
import { DB_NAME, MIGRATIONS } from './schema';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;
  database = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(database);
  return database;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const result = await db.getFirstAsync<{ max_version: number }>(
    'SELECT MAX(version) as max_version FROM schema_version'
  );
  const currentVersion = result?.max_version ?? 0;

  const versions = Object.keys(MIGRATIONS)
    .map(Number)
    .sort((a, b) => a - b);

  for (const version of versions) {
    if (version > currentVersion) {
      await db.withTransactionAsync(async () => {
        await db.execAsync(MIGRATIONS[version]);
        await db.runAsync(
          'INSERT INTO schema_version (version, applied_at) VALUES (?, ?)',
          [version, new Date().toISOString()]
        );
      });
    }
  }
}

export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.closeAsync();
    database = null;
  }
}
