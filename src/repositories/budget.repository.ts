import { db } from "@/db/client";
import type { BudgetRow } from "@/types/database";

export function getBudgetsByAccount(accountId: number): BudgetRow[] {
  return db.getAllSync<BudgetRow>(
    "SELECT * FROM budgets WHERE account_id = ? ORDER BY start_date DESC, id DESC",
    [accountId],
  );
}

export function getBudgetById(id: number): BudgetRow | null {
  return db.getFirstSync<BudgetRow>("SELECT * FROM budgets WHERE id = ?", [id]);
}

export function getBudgetCategories(budgetId: number): number[] {
  const rows = db.getAllSync<{ category_id: number }>(
    "SELECT category_id FROM budget_categories WHERE budget_id = ?",
    [budgetId],
  );
  return rows.map((r) => r.category_id);
}

export function getBudgetWithCategories(budgetId: number): {
  budget: BudgetRow;
  categoryIds: number[];
  spent: number;
} | null {
  const budget = getBudgetById(budgetId);
  if (!budget) return null;
  const categoryIds = getBudgetCategories(budgetId);
  const today = new Date().toISOString().split("T")[0];
  const endDate = budget.end_date ?? today;
  const spent = getBudgetSpent(budgetId, budget.start_date, endDate);
  return { budget, categoryIds, spent };
}

export function getBudgetSpent(
  budgetId: number,
  startDate: string,
  endDate: string,
): number {
  const categoryIds = getBudgetCategories(budgetId);
  if (categoryIds.length === 0) return 0;

  const placeholders = categoryIds.map(() => "?").join(",");
  const result = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM transactions
     WHERE type = 'expense'
       AND status = 'confirmed'
       AND category_id IN (${placeholders})
       AND date(created_at) BETWEEN ? AND ?`,
    [...categoryIds, startDate, endDate],
  );
  return result?.total ?? 0;
}

export function createBudget(params: {
  accountId: number;
  name: string;
  amount: number;
  period: BudgetRow["period"];
  startDate: string;
  endDate?: string | null;
  categoryIds: number[];
}): number {
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO budgets (account_id, name, amount, period, start_date, end_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.accountId,
      params.name,
      params.amount,
      params.period,
      params.startDate,
      params.endDate ?? null,
      now,
      now,
    ],
  );
  const budgetId = result.lastInsertRowId;

  // Link categories
  for (const catId of params.categoryIds) {
    db.runSync(
      "INSERT INTO budget_categories (budget_id, category_id) VALUES (?, ?)",
      [budgetId, catId],
    );
  }

  return budgetId;
}

export function updateBudget(
  id: number,
  params: {
    name?: string;
    amount?: number;
    period?: BudgetRow["period"];
    startDate?: string;
    endDate?: string | null;
    categoryIds?: number[];
  },
): void {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (params.name !== undefined) {
    updates.push("name = ?");
    values.push(params.name);
  }
  if (params.amount !== undefined) {
    updates.push("amount = ?");
    values.push(params.amount);
  }
  if (params.period !== undefined) {
    updates.push("period = ?");
    values.push(params.period);
  }
  if (params.startDate !== undefined) {
    updates.push("start_date = ?");
    values.push(params.startDate);
  }
  if (params.endDate !== undefined) {
    updates.push("end_date = ?");
    values.push(params.endDate ?? null);
  }

  if (updates.length === 0 && !params.categoryIds) return;

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(id);
    db.runSync(`UPDATE budgets SET ${updates.join(", ")} WHERE id = ?`, values);
  }

  // Update category links if provided
  if (params.categoryIds !== undefined) {
    db.runSync("DELETE FROM budget_categories WHERE budget_id = ?", [id]);
    for (const catId of params.categoryIds) {
      db.runSync(
        "INSERT INTO budget_categories (budget_id, category_id) VALUES (?, ?)",
        [id, catId],
      );
    }
  }
}

export function deleteBudget(id: number): void {
  db.runSync("DELETE FROM budgets WHERE id = ?", [id]);
  // budget_categories cascade deleted via FK
}

export function getBudgetsWithProgress(accountId: number): {
  id: number;
  name: string;
  amount: number;
  period: string;
  start_date: string;
  end_date: string | null;
  spent: number;
  remaining: number;
  percentage: number;
  categoryIds: number[];
}[] {
  const budgets = getBudgetsByAccount(accountId);
  const today = new Date().toISOString().split("T")[0];

  return budgets.map((budget) => {
    const startDate = budget.start_date;
    const endDate = budget.end_date ?? today;
    const categoryIds = getBudgetCategories(budget.id);
    const spent = getBudgetSpent(budget.id, startDate, endDate);
    const remaining = Math.max(0, budget.amount - spent);
    const percentage = budget.amount > 0
      ? Math.round((spent / budget.amount) * 100)
      : 0;

    return {
      id: budget.id,
      name: budget.name,
      amount: budget.amount,
      period: budget.period,
      start_date: startDate,
      end_date: budget.end_date,
      spent,
      remaining,
      percentage,
      categoryIds,
    };
  });
}
