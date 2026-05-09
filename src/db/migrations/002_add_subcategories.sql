-- Migration 002: Add parent_id and sort_order to categories
-- parent_id: NULL = root category, points to parent category = sub-category
-- sort_order: user-defined ordering for both root categories and sub-categories

ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Backfill existing categories as root categories (parent_id = NULL) with sort_order = 0
-- Existing data remains as-is, only new columns are populated

-- Reorder index to include parent_id for efficient sub-category queries
DROP INDEX IF EXISTS idx_categories_account;
CREATE INDEX IF NOT EXISTS idx_categories_account ON categories(account_id, type, parent_id);
