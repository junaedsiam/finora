## Account
- id: int
- name: string
- currency: string
- is_active: boolean

## Wallet
- id: int
- account_id: int
- name: string
- balance: float
- color: string
- icon: string
- is_excluded: boolean
- created_at: datetime
- updated_at: datetime

## Category
- id: int
- type: enum (income / expense)
- name: string
- color: string
- icon: string

## Budget
- id: int
- account_id: int
- name: string
- amount: float
- period: enum (weekly / monthly / quaterly / yearly)
- start_date: date
- created_at: datetime
- updated_at: datetime

## BudgetCategory
Join table linking budgets to categories. Spending on linked categories is accumulated in the budget calculation.
- id: int
- budget_id: int
- category_id: int

## Transaction
- id: int
- account_id: int
- wallet_id: int
- destination_wallet_id: int (nullable, for transfers)
- category_id: int
- type: enum (income / expense / transfer)
- amount: float
- note: string (nullable)
- status: enum (confirmed / pending / skipped)
- recurring_id: int (nullable)
- debt_id: int (nullable)
- created_at: datetime
- updated_at: datetime

## Recurring
Wallet is assigned at setup and used for auto-confirmation at end of day. Can be edited later.
- id: int
- account_id: int
- wallet_id: int
- destination_wallet_id: int (nullable, for transfers)
- category_id: int
- type: enum (income / expense / transfer)
- amount: float
- frequency: enum (daily / weekly / monthly / yearly)
- start_date: date
- next_due_date: date
- is_active: boolean
- created_at: datetime
- updated_at: datetime

## Debt
- id: int
- account_id: int
- wallet_id: int
- type: enum (borrow / lend)
- person_name: string
- amount: float
- remaining_amount: float
- due_date: date (nullable)
- is_settled: boolean
- created_at: datetime
- updated_at: datetime
