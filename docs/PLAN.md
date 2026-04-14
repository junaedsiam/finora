# Finora - Implementation Plan

## Context

Finora is a personal finance tracker for iOS and Android, built with Expo SDK 55 + TypeScript. It's fully local (SQLite, no backend server) with planned Google Drive backup. The app tracks accounts, wallets, transactions (income/expense/transfer), budgets, debts, and recurring transactions. The design features a dark gradient header, colored wallet cards, progress bars, and a custom tab bar with a centered FAB.

**Resolved**: Recurring transactions have a wallet assigned at setup, used for auto-confirmation at end of day. User can change it when confirming manually.

---

## 1. UI Library: NativeWind v4

The design is custom (dark gradients, colored cards, custom nav) -- not Material Design. NativeWind v4 is the best fit because:

- **Zero design opinions** -- write exactly the UI from the mockups via Tailwind utility classes
- **Compile-time CSS** -- near-zero runtime cost
- **Dark mode** via `dark:` variant, perfect for the gradient header
- **Full Expo SDK 55 compatibility** via `withNativeWind` Metro wrapper

Pair with standalone libraries for specific needs (bottom sheets, date pickers, charts).

---

## 2. Tech Stack

### Core
| Library | Purpose |
|---|---|
| `expo` ~55.0.0 | Core framework |
| `expo-router` ~5.0.0 | File-based navigation |
| `typescript` ~5.7.0 | Type safety |

### Styling & UI
| Library | Purpose |
|---|---|
| `nativewind` ^4.1 | Tailwind CSS for React Native |
| `tailwindcss` ^3.4 | Tailwind compiler |
| `react-native-reanimated` ~3.17 | Animations |
| `react-native-gesture-handler` ~2.24 | Swipe gestures |
| `expo-linear-gradient` ~14.0 | Dark gradient header |
| `@gorhom/bottom-sheet` ^5.0 | Transaction modal |
| `expo-haptics` ~14.0 | Haptic feedback |

### Data Layer
| Library | Purpose |
|---|---|
| `expo-sqlite` ~15.0 | SQLite database (synchronous API, used directly) |

### State Management
| Library | Purpose |
|---|---|
| `zustand` ^5.0 | UI state (active account, filters, modals) |
| `@tanstack/react-query` ^5.75 | Async data caching over SQLite |

### Forms & Validation
| Library | Purpose |
|---|---|
| `react-hook-form` ^7.55 | Form state |
| `zod` ^3.24 | Schema validation |

### Icons, Charts, Dates
| Library | Purpose |
|---|---|
| `@expo/vector-icons` (bundled) | Icons |
| `react-native-svg` ~15.11 | SVG rendering |
| `victory-native` ^41.0 | Charts for Stats screen |
| `dayjs` ^1.11 | Date manipulation |
| `react-native-date-picker` ^5.0 | Native date picker |

### Backup & Export (Phase 10)
| Library | Purpose |
|---|---|
| `expo-file-system` ~18.0 | File I/O |
| `expo-sharing` ~13.0 | Share exported files |
| `expo-document-picker` ~13.0 | Import files |
| `expo-auth-session` ~6.0 | Google OAuth for Drive |

### Dev Tooling
| Library | Purpose |
|---|---|
| `eslint` ^9.0 + `prettier` ^3.4 | Linting & formatting |
| `@testing-library/react-native` ^12.9 | Component testing |
| `jest-expo` ~55.0 | Test runner |

---

## 3. Directory Structure

```
finora/
├── app/                              # Expo Router (file-based routing)
│   ├── _layout.tsx                   # Root layout (providers, fonts, splash, DB init)
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Custom tab bar with FAB
│   │   ├── index.tsx                 # Home screen
│   │   ├── transactions.tsx          # Transaction list
│   │   ├── calendar.tsx              # Calendar view
│   │   └── stats.tsx                 # Statistics
│   ├── (modals)/
│   │   ├── _layout.tsx               # Modal presentation config
│   │   ├── add-transaction.tsx       # Add/Edit transaction
│   │   ├── add-wallet.tsx            # Add/Edit wallet
│   │   ├── add-budget.tsx            # Add/Edit budget
│   │   ├── add-debt.tsx              # Add/Edit debt
│   │   └── add-recurring.tsx         # Add/Edit recurring
│   ├── wallet/[id].tsx               # Wallet detail
│   ├── budget/[id].tsx               # Budget detail
│   ├── debt/[id].tsx                 # Debt detail
│   ├── recurring/[id].tsx            # Recurring detail
│   ├── settings/
│   │   ├── index.tsx                 # Settings main
│   │   ├── accounts.tsx              # Account management
│   │   ├── categories.tsx            # Category management
│   │   ├── backup.tsx                # Backup & restore
│   │   └── export.tsx                # Export & import
│   └── +not-found.tsx
│
├── src/
│   ├── db/
│   │   ├── client.ts                 # expo-sqlite database instance
│   │   ├── migrations/               # Plain SQL migration files (001_initial.sql, etc.)
│   │   └── migrate.ts                # Version-tracked migration runner (PRAGMA user_version)
│   │
│   ├── repositories/                 # Data access (raw SQL + typed results)
│   │   ├── account.repository.ts
│   │   ├── wallet.repository.ts
│   │   ├── transaction.repository.ts
│   │   ├── category.repository.ts
│   │   ├── budget.repository.ts
│   │   ├── debt.repository.ts
│   │   └── recurring.repository.ts
│   │
│   ├── services/                     # Business logic
│   │   ├── transaction.service.ts    # Atomic balance updates
│   │   ├── budget.service.ts         # Period calc, spent aggregation
│   │   ├── recurring.service.ts      # Pending generation, auto-confirm
│   │   ├── debt.service.ts           # Settlement, remaining calc
│   │   ├── balance.service.ts        # Total/committed/available
│   │   └── export.service.ts         # CSV/JSON export
│   │
│   ├── hooks/                        # React Query hooks (bridge UI <-> services)
│   │   ├── useAccount.ts
│   │   ├── useWallets.ts
│   │   ├── useTransactions.ts
│   │   ├── useCategories.ts
│   │   ├── useBudgets.ts
│   │   ├── useDebts.ts
│   │   ├── useRecurring.ts
│   │   ├── useBalance.ts
│   │   └── useCalendar.ts
│   │
│   ├── stores/                       # Zustand (synchronous UI state only)
│   │   ├── account.store.ts          # Active account ID (persisted)
│   │   ├── transaction-filter.store.ts # Period, date range, type filters
│   │   └── ui.store.ts               # Theme, bottom sheet state
│   │
│   ├── components/
│   │   ├── ui/                       # Generic primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── TabPill.tsx           # Income/Expense/Transfer toggle
│   │   │   ├── AmountInput.tsx
│   │   │   ├── IconPicker.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── home/
│   │   │   ├── BalanceHeader.tsx      # Dark gradient + balance
│   │   │   ├── IncomeExpensePills.tsx
│   │   │   ├── WalletCarousel.tsx
│   │   │   ├── WalletCard.tsx
│   │   │   ├── BudgetSection.tsx
│   │   │   ├── BudgetProgressCard.tsx
│   │   │   ├── DebtSection.tsx
│   │   │   └── UpcomingCosts.tsx
│   │   ├── transaction/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionItem.tsx
│   │   │   ├── TransactionDateGroup.tsx
│   │   │   ├── PeriodSelector.tsx
│   │   │   ├── DateNavigator.tsx
│   │   │   └── OverviewBar.tsx
│   │   ├── forms/
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── WalletForm.tsx
│   │   │   ├── BudgetForm.tsx
│   │   │   ├── DebtForm.tsx
│   │   │   ├── RecurringForm.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   └── WalletPicker.tsx
│   │   ├── calendar/
│   │   │   ├── CalendarGrid.tsx
│   │   │   └── DayCell.tsx
│   │   ├── stats/
│   │   │   ├── PieChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── StatsSummary.tsx
│   │   └── navigation/
│   │       ├── CustomTabBar.tsx
│   │       └── FAB.tsx
│   │
│   ├── types/
│   │   ├── database.ts               # Row types for each table (manually defined)
│   │   ├── domain.ts                 # Business/domain types
│   │   ├── navigation.ts             # Route params
│   │   └── enums.ts                  # TransactionType, Period, Frequency
│   │
│   ├── utils/
│   │   ├── currency.ts               # Format/parse amounts
│   │   ├── date.ts                   # Period boundaries, ranges
│   │   ├── color.ts                  # Color manipulation
│   │   └── seed.ts                   # Dev seed data
│   │
│   └── constants/
│       ├── colors.ts                 # Design palette
│       ├── categories.ts             # Default categories with icons/colors
│       └── config.ts                 # App config
│
├── assets/
│   ├── fonts/
│   └── images/
│
├── tailwind.config.ts
├── nativewind-env.d.ts
├── global.css                        # @tailwind directives
├── app.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js                   # withNativeWind wrapper
└── package.json
```

### Key Structural Decisions

- **`app/` for routing only** -- route files are thin (import + compose from `src/`), keeping all logic testable outside the routing layer
- **Repository pattern** -- raw SQL via `expo-sqlite` with typed return values, returns typed rows
- **Service layer** -- contains business logic (balance updates, budget calc), testable without DB
- **React Query hooks** -- bridge UI to services with caching, invalidation, optimistic updates
- **Zustand stores** -- ephemeral UI state only (`activeAccountId` persisted via `persist` middleware)

---

## 4. Data Layer Architecture

No ORM. Use `expo-sqlite` directly with typed repository functions. Raw SQL is simpler, faster to debug, and the queries in this app are straightforward enough that an ORM adds complexity without meaningful benefit.

### Database Client (`src/db/client.ts`)
`openDatabaseSync('finora.db')` -- opened once at app startup in `_layout.tsx`, exported for use in repositories.

### Row Types (`src/types/database.ts`)
Manually defined TypeScript interfaces matching each table:
```typescript
type TransactionRow = {
  id: number;
  account_id: number;
  wallet_id: number;
  destination_wallet_id: number | null;
  category_id: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  note: string | null;
  status: 'confirmed' | 'pending' | 'skipped';
  recurring_id: number | null;
  created_at: string;
  updated_at: string;
};
// ... similar for all 8 tables
```

### Repository Pattern
Each repository uses `db.getAllSync<RowType>()` and `db.runSync()` with raw SQL:
```typescript
export function getByPeriod(accountId: number, start: string, end: string) {
  return db.getAllSync<TransactionRow>(
    `SELECT * FROM transactions
     WHERE account_id = ? AND created_at BETWEEN ? AND ?
     ORDER BY created_at DESC`,
    [accountId, start, end]
  );
}
```
Type safety on outputs (what the repository returns), Zod validation on inputs (at the service layer boundary).

### Migrations (`src/db/migrations/`)
Plain numbered SQL files, tracked via SQLite's `PRAGMA user_version`:
```
src/db/migrations/
  001_initial.sql       -- all 8 tables, indexes
  002_add_feature.sql   -- future schema changes
```
Migration runner (~30 lines) reads current version, applies unapplied files in order.

Indexes on: `transaction(account_id, created_at)`, `transaction(wallet_id)`, `transaction(category_id)`, `recurring(next_due_date)`.

### Type Safety Chain
```
database.ts (row types) -> repository (typed queries) -> service -> hook -> component
```
Row type changes propagate type errors through repositories and up.

---

## 5. State Architecture

```
┌──────────────────────────────────────────┐
│              UI Components               │
├──────────────────────────────────────────┤
│  Zustand Stores        React Query       │
│  (sync UI state)       (async DB state)  │
│  - activeAccountId     - wallets[]       │
│  - selectedPeriod      - transactions[]  │
│  - dateRange           - budgets[]       │
│  - typeFilter          - categories[]    │
│  - bottomSheetOpen     - debts[]         │
│                        - recurring[]     │
│                        - balances        │
├──────────────────────────────────────────┤
│          Service Layer                   │
├──────────────────────────────────────────┤
│          Repository Layer (raw SQL)      │
├──────────────────────────────────────────┤
│          SQLite (expo-sqlite)            │
└──────────────────────────────────────────┘
```

### Query Key Strategy
```
['accounts']
['account', accountId]
['wallets', accountId]
['wallet', walletId]
['transactions', accountId, { start, end, type }]
['transaction', transactionId]
['categories', type?]
['budgets', accountId]
['budget', budgetId, { periodStart, periodEnd }]
['debts', accountId]
['recurring', accountId]
['balance', accountId]
['calendar', accountId, year, month]
['stats', accountId, { start, end, groupBy }]
```

### Mutation Invalidation Map
| Mutation | Invalidated Queries |
|---|---|
| Create/delete transaction | `wallets`, `transactions`, `balance`, `budgets`, `calendar`, `stats` |
| Create/edit wallet | `wallets`, `balance` |
| Confirm recurring | `wallets`, `transactions`, `balance`, `recurring` |
| Skip recurring | `recurring` |
| Settle debt | `wallets`, `debts`, `balance`, `transactions` |

---

## 6. Key Business Logic

### 6.1 Transaction Creation (atomic)
```
1. Validate input (Zod)
2. db.transaction(() => {
3.   Insert transaction row
4.   income  -> wallet.balance += amount
5.   expense -> wallet.balance -= amount
6.   transfer -> source.balance -= amount, dest.balance += amount
7. })
```
All balance mutations happen inside SQLite transactions to prevent inconsistency.

### 6.2 Recurring Processing (on app open)
1. Query active recurring where `next_due_date <= today`
2. For each, generate pending transaction with wallet from recurring entry
3. Advance `next_due_date` based on frequency
4. **Auto-confirm**: if pending transaction date is before today, set `status = 'confirmed'` and update wallet balance
5. **Handle gaps**: if app not opened for 3 days with daily recurring, generate 3 pending transactions

**User actions on pending transactions**:
- **Confirm**: Set `status = 'confirmed'`, update wallet balance
- **Skip**: Set `status = 'skipped'`, no balance change
- **Modify**: Update amount, then confirm

### 6.3 Committed Balance
```
total     = SUM(wallet.balance) WHERE NOT is_excluded
committed = SUM(pending_transaction.amount) WHERE status = 'pending'
available = total - committed_expenses + committed_income
```

### 6.4 Budget Spending (computed dynamically)
1. Determine current period window from `budget.period` + `budget.start_date`
2. `SUM(transaction.amount)` where type = 'expense', status = 'confirmed', category_id in budget's linked categories, within period window
3. Return `{ budgetAmount, spent, remaining, percentage }`

### 6.5 Debt Settlement
1. Create transaction for the payment
2. Decrease `debt.remaining_amount`
3. If `remaining_amount === 0`, set `is_settled = true`
4. All within single SQLite transaction

### 6.6 Custom Tab Bar with FAB
Expo Router's tab layout `tabBar` prop renders 4 tab icons with a gap in the middle. A circular FAB sits absolutely positioned in the center, opening the Add Transaction modal via `router.push('/(modals)/add-transaction')`.

### 6.7 Calendar Screen Data
Single query for all confirmed transactions in a month, grouped by day in JS using `dayjs`. Each day: `{ income: sum, expense: sum, net: income - expense }`.

### 6.8 Currency Formatting
`formatCurrency(amount, currencyCode)` using `Intl.NumberFormat`. Active account's currency comes from Zustand store.

---

## 7. Implementation Phases

### Phase 1: Project Scaffolding & Core Infrastructure
- Initialize Expo SDK 55 project with TypeScript
- Configure NativeWind v4 (`metro.config.js`, `tailwind.config.ts`, `global.css`)
- Set up Expo Router with tab layout and placeholder screens
- Build custom tab bar with FAB (navigation only)
- Define row types in `src/types/database.ts` for all 8 tables
- Write initial SQL migration (`001_initial.sql`) with tables and indexes
- Build migration runner using `PRAGMA user_version`
- Create constants (color palette, default categories)
- Write dev seed data script

**Critical files**: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `src/types/database.ts`, `src/db/client.ts`, `src/db/migrate.ts`, `src/db/migrations/001_initial.sql`, `tailwind.config.ts`, `metro.config.js`

### Phase 2: Account, Wallet & Category Foundation
- Repository + service layers for Account, Wallet, Category
- React Query hooks for all three
- Zustand store for active account
- Home screen: gradient header, balance, income/expense pills, wallet carousel
- Settings: account management, category management
- Wallet create/edit form

**Critical files**: `src/repositories/account|wallet|category.repository.ts`, `src/services/balance.service.ts`, `src/hooks/useAccount|useWallets|useBalance.ts`, `src/components/home/*`

### Phase 3: Transaction System
- Full transaction CRUD
- Add Transaction modal with Income/Expense/Transfer tabs
- Category icon grid picker, wallet dropdown, date picker
- Transaction list with date navigation and period selector
- Date grouping, color-coded amounts, overview bar
- Swipe-to-delete

**Critical files**: `src/services/transaction.service.ts`, `src/repositories/transaction.repository.ts`, `app/(modals)/add-transaction.tsx`, `src/components/transaction/*`, `src/components/forms/TransactionForm.tsx`

### Phase 4: Budget System
- Budget CRUD with category linking (BudgetCategory)
- Budget progress calculation service
- Home screen budget section with progress bars
- Budget detail with per-category breakdown

**Critical files**: `src/services/budget.service.ts`, `src/repositories/budget.repository.ts`, `src/components/home/BudgetSection|BudgetProgressCard.tsx`

### Phase 5: Recurring Transactions
- Recurring CRUD
- Pending transaction generation engine (runs on app open)
- Auto-confirmation for past-due pending transactions
- Confirm/Skip/Modify actions
- Committed balance on home screen (Total | Committed | Available)
- "Upcoming Costs" section on home screen

**Critical files**: `src/services/recurring.service.ts`, `src/repositories/recurring.repository.ts`, `src/hooks/useRecurring.ts`, `src/components/home/UpcomingCosts.tsx`

### Phase 6: Debt Tracking
- Debt CRUD (borrow/lend)
- Settlement recording (partial + full)
- Home screen debt section
- Debt detail with payment history

**Critical files**: `src/services/debt.service.ts`, `src/repositories/debt.repository.ts`, `src/components/home/DebtSection.tsx`

### Phase 7: Calendar Screen
- Monthly calendar grid with daily income/expense/net
- Month navigation, day tap to see transactions
- Color-coded cells (green = positive, red = negative)

**Critical files**: `src/hooks/useCalendar.ts`, `src/components/calendar/*`, `app/(tabs)/calendar.tsx`

### Phase 8: Statistics Screen
- Pie chart (expense by category), bar chart (income vs expense over time)
- Period selector, top spending categories, trend analysis

**Critical files**: `src/components/stats/*`, `app/(tabs)/stats.tsx`

### Phase 9: Polish & Advanced Features
- Onboarding flow (first account + wallet setup)
- Empty states for all sections
- Haptic feedback, splash screen, app icon
- Error boundaries, `@shopify/flash-list` for long lists
- Animations (card press, transaction add, progress bar fill)

### Phase 10: Backup, Export & Import
- Export to CSV/JSON, import from CSV/JSON
- Google Drive backup (upload SQLite file) and restore
- Google OAuth via `expo-auth-session`

---

## 8. Verification

After each phase, verify by:
1. **Run the app**: `npx expo start` -- all new screens render without crashes
2. **Test data flow**: Create/edit/delete entities and verify balances update correctly
3. **Check persistence**: Kill and relaunch the app -- data survives
4. **Edge cases**: Zero-balance wallets, empty lists, budget over 100%
5. **Cross-platform**: Test on both iOS simulator and Android emulator

### Transaction system verification (Phase 3):
- Create income -> wallet balance increases
- Create expense -> wallet balance decreases
- Create transfer -> source decreases, destination increases
- Delete any of the above -> balances revert
- Budget progress updates after expense creation
