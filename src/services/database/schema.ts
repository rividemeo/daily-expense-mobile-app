export const DB_NAME = 'expenseflow.db';
export const DB_VERSION = 1;

export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    currency TEXT NOT NULL DEFAULT 'IDR',
    language TEXT NOT NULL DEFAULT 'en',
    theme TEXT NOT NULL DEFAULT 'system',
    family_id TEXT,
    family_role TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    is_default INTEGER NOT NULL DEFAULT 0,
    user_id TEXT,
    family_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    category_id TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    payment_method TEXT NOT NULL DEFAULT 'cash',
    notes TEXT,
    attachment_url TEXT,
    attachment_path TEXT,
    is_recurring INTEGER NOT NULL DEFAULT 0,
    recurring_id TEXT,
    user_id TEXT NOT NULL,
    family_id TEXT,
    is_synced INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT,
    amount REAL NOT NULL,
    spent REAL NOT NULL DEFAULT 0,
    period TEXT NOT NULL DEFAULT 'monthly',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    alert_threshold_50 INTEGER NOT NULL DEFAULT 1,
    alert_threshold_80 INTEGER NOT NULL DEFAULT 1,
    alert_threshold_100 INTEGER NOT NULL DEFAULT 1,
    user_id TEXT NOT NULL,
    family_id TEXT,
    is_shared INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recurring_transactions (
    id TEXT PRIMARY KEY,
    template_transaction_id TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    next_due_date TEXT NOT NULL,
    last_generated_date TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (template_transaction_id) REFERENCES transactions(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    data TEXT DEFAULT '{}',
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK(operation IN ('create', 'update', 'delete')),
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
  CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
  CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
  CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
`;

export const MIGRATIONS: Record<number, string> = {
  1: CREATE_TABLES_SQL,
};
