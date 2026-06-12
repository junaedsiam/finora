import { db } from "@/db/client";
import type { BudgetRow } from "@/types/database";

export function getBudgetsWithSpent(accountId: number): {
  budget: BudgetRow;
  categoryIds: number[];
  spent: number;
  remaining: number;
  percentage: number;
}[] {
  const budgets = db.getAllSync<BudgetRow>(
    "SELECT * FROM budgets WHERE account_id = ? ORDER BY start_date DESC, id DESC",
    [accountId],
  );

  const today = new Date().toISOString().split("T")[0];

  return budgets.map((budget) => {
    const categoryIds = db
      .getAllSync<{ category_id: number }>(
        "SELECT category_id FROM budget_categories WHERE budget_id = ?",
        [budget.id],
      )
      .map((r) => r.category_id);

    const startDate = budget.start_date;
    const endDate = budget.end_date ?? today;

    let spent = 0;
    if (categoryIds.length > 0) {
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
      spent = result?.total ?? 0;
    }

    const remaining = Math.max(0, budget.amount - spent);
    const percentage = budget.amount > 0
      ? Math.round((spent / budget.amount) * 100)
      : 0;

    return { budget, categoryIds, spent, remaining, percentage };
  });
}

export function getBudgetProgress(
  budgetId: number,
  startDate: string,
  endDate: string,
): {
  spent: number;
  remaining: number;
  percentage: number;
} {
  const categoryIds = db
    .getAllSync<{ category_id: number }>(
      "SELECT category_id FROM budget_categories WHERE budget_id = ?",
      [budgetId],
    )
    .map((r) => r.category_id);

  let spent = 0;
  if (categoryIds.length > 0) {
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
    spent = result?.total ?? 0;
  }

  const budget = db.getFirstSync<{ amount: number }>(
    "SELECT amount FROM budgets WHERE id = ?",
    [budgetId],
  );
  const amount = budget?.amount ?? 0;
  const remaining = Math.max(0, amount - spent);
  const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0;

  return { spent, remaining, percentage };
}
