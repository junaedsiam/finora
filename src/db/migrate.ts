import { db } from "./client";

const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `-- Finora initial schema

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'cash',
  balance REAL NOT NULL DEFAULT 0,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_excluded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  wallet_id INTEGER NOT NULL,
  destination_wallet_id INTEGER,
  category_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount REAL NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'skipped')),
  recurring_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (recurring_id) REFERENCES recurring(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budget_categories (
  budget_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (budget_id, category_id),
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS debts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('borrow', 'lend')),
  original_amount REAL NOT NULL,
  remaining_amount REAL NOT NULL,
  due_date TEXT,
  wallet_id INTEGER,
  is_settled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS recurring (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  wallet_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount REAL NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_due_date TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_account_created ON transactions(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_due ON recurring(next_due_date);
CREATE INDEX IF NOT EXISTS idx_wallets_account ON wallets(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_account ON budgets(account_id);
CREATE INDEX IF NOT EXISTS idx_debts_account ON debts(account_id);
CREATE INDEX IF NOT EXISTS idx_categories_account ON categories(account_id);

CREATE TRIGGER IF NOT EXISTS tr_wallets_updated AFTER UPDATE ON wallets
BEGIN UPDATE wallets SET updated_at = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS tr_categories_updated AFTER UPDATE ON categories
BEGIN UPDATE categories SET updated_at = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS tr_transactions_updated AFTER UPDATE ON transactions
BEGIN UPDATE transactions SET updated_at = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS tr_budgets_updated AFTER UPDATE ON budgets
BEGIN UPDATE budgets SET updated_at = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS tr_debts_updated AFTER UPDATE ON debts
BEGIN UPDATE debts SET updated_at = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS tr_recurring_updated AFTER UPDATE ON recurring
BEGIN UPDATE recurring SET updated_at = datetime('now') WHERE id = NEW.id; END;`,
  },
  {
    version: 2,
    sql: `
ALTER TABLE wallets ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE accounts ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
`,
  },
  {
    version: 3,
    sql: `
ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
DROP INDEX IF EXISTS idx_categories_account;
CREATE INDEX IF NOT EXISTS idx_categories_account ON categories(account_id, type, parent_id);
`,
  },
];

function splitSql(sql: string): string[] {
  return sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function runMigrations(): void {
  const currentVersion =
    db.getFirstSync<{ user_version: number }>("PRAGMA user_version")
      ?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      const statements = splitSql(migration.sql);
      for (const stmt of statements) {
        if (stmt) db.runSync(stmt);
      }
      db.runSync(`PRAGMA user_version = ${migration.version}`);
    }
  }
}
