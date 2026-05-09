import { db } from "@/db/client";
import type { CategoryRow, CategoryType } from "@/types/database";

export function getCategoriesByAccount(accountId: number): CategoryRow[] {
  return db.getAllSync<CategoryRow>(
    "SELECT * FROM categories WHERE account_id = ? ORDER BY type, sort_order, name",
    [accountId],
  );
}

export function getCategoriesByType(
  accountId: number,
  type: CategoryType,
): CategoryRow[] {
  return db.getAllSync<CategoryRow>(
    "SELECT * FROM categories WHERE account_id = ? AND type = ? AND parent_id IS NULL ORDER BY sort_order, name",
    [accountId, type],
  );
}

export function getRootCategories(
  accountId: number,
  type: CategoryType,
): CategoryRow[] {
  return db.getAllSync<CategoryRow>(
    "SELECT * FROM categories WHERE account_id = ? AND type = ? AND parent_id IS NULL ORDER BY sort_order, name",
    [accountId, type],
  );
}

export function getSubCategories(parentId: number): CategoryRow[] {
  return db.getAllSync<CategoryRow>(
    "SELECT * FROM categories WHERE parent_id = ? ORDER BY sort_order, name",
    [parentId],
  );
}

export function getCategoryById(id: number): CategoryRow | null {
  return db.getFirstSync<CategoryRow>("SELECT * FROM categories WHERE id = ?", [
    id,
  ]);
}

export function getCategoriesForPicker(
  accountId: number,
  type: CategoryType,
): (CategoryRow & { subCategories: CategoryRow[] })[] {
  const parents = db.getAllSync<CategoryRow>(
    "SELECT * FROM categories WHERE account_id = ? AND type = ? AND parent_id IS NULL ORDER BY sort_order, name",
    [accountId, type],
  );

  return parents.map((parent) => ({
    ...parent,
    subCategories: getSubCategories(parent.id),
  }));
}

export async function createCategory(
  accountId: number,
  name: string,
  type: CategoryType,
  icon: string,
  color: string,
): Promise<number> {
  console.log("Hitting create category");
  const result = db.runSync(
    `INSERT INTO categories (account_id, name, type, icon, color)
     VALUES (?, ?, ?, ?, ?)`,
    [accountId, name, type, icon, color],
  );
  return result.lastInsertRowId;
}

export async function createSubCategory(
  parentId: number,
  name: string,
): Promise<number> {
  const result = db.runSync(
    `INSERT INTO categories (account_id, name, type, icon, color, parent_id)
     SELECT account_id, ?, type, '', '', ? FROM categories WHERE id = ?`,
    [name, parentId, parentId],
  );
  return result.lastInsertRowId;
}

export async function updateCategory(
  id: number,
  name: string,
  icon: string,
  color: string,
): Promise<void> {
  db.runSync(
    `UPDATE categories SET name = ?, icon = ?, color = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [name, icon, color, id],
  );
}

export async function updateSubCategory(
  id: number,
  name: string,
): Promise<void> {
  db.runSync(
    `UPDATE categories SET name = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [name, id],
  );
}

export async function updateCategorySortOrder(
  ids: { id: number; sort_order: number }[],
): Promise<void> {
  ids.forEach(({ id, sort_order }) => {
    db.runSync("UPDATE categories SET sort_order = ? WHERE id = ?", [
      sort_order,
      id,
    ]);
  });
}

export async function updateSubCategorySortOrder(
  ids: { id: number; sort_order: number }[],
): Promise<void> {
  ids.forEach(({ id, sort_order }) => {
    db.runSync("UPDATE categories SET sort_order = ? WHERE id = ?", [
      sort_order,
      id,
    ]);
  });
}

export async function deleteCategory(id: number): Promise<void> {
  db.runSync("DELETE FROM categories WHERE id = ?", [id]);
}

export async function deleteSubCategory(id: number): Promise<void> {
  db.runSync("DELETE FROM categories WHERE id = ?", [id]);
}
