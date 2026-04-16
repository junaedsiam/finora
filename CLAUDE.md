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

> **Strategy**: UI-first. Build all screens with hardcoded mock data first, then wire up the data layer behind them. This lets us validate the design early and build reusable components along the way.

### Phase 1: Project Scaffolding ✅ DONE
- Expo SDK 55 + TypeScript, NativeWind v4 configured
- Expo Router tab layout with placeholder screens
- Custom tab bar with centered FAB
- Color constants, Inter font loaded
- `tailwind.config.js`, `metro.config.js`, `global.css` configured

---

### Phase 2: UI — Reusable Components & Home Screen
Build the Home screen from `assets/images/Home.png` using hardcoded data. Extract reusable primitives as you go.

**2A. Reusable UI Primitives (`src/components/ui/`)**

Create these as generic, themeable building blocks — they will be reused across all screens:

- **`Card.tsx`** — Base card wrapper with rounded corners, shadow, and optional background color prop. Used for wallet cards, overview cards, budget cards, upcoming cost rows, etc.
- **`ProgressBar.tsx`** — Horizontal bar with filled portion + percentage label. Takes `value`, `max`, `color` props. Used in budget cards.
- **`Badge.tsx`** — Small rounded pill for labels (e.g., account selector pill on balance header). Takes `label`, `variant` props.
- **`SectionHeader.tsx`** — Row with left title ("Wallets", "Budgets") and right action link ("View All >"). Takes `title`, `actionLabel`, `onAction` props.
- **`IconCircle.tsx`** — Colored circle with a centered icon inside. Used for wallet card icons, transaction list icons, upcoming cost icons. Takes `icon`, `bgColor`, `size` props.
- **`AmountText.tsx`** — Formatted currency text with optional color coding (green for income, red for expense). Takes `amount`, `type`, `size` props. Uses `Intl.NumberFormat`.

**2B. Home Screen Sections (`src/components/home/`)**

Build top-to-bottom matching the mockup, all with hardcoded mock data:

1. **`HomeHeader.tsx`** — Greeting row: user avatar (placeholder circle), "Hi, {name}!" with date below, edit & settings icons on the right.

2. **`BalanceCard.tsx`** — Large blue/indigo gradient card (use `expo-linear-gradient`):
   - Top-left: account selector pill ("Main Account ▾") — tappable but no-op for now
   - Top-right: 3-dot menu icon
   - Center: "Total Balance" label + large formatted amount + eye toggle icon to show/hide
   - Bottom: divider line, then Income (green arrow ↗) and Expense (red arrow ↘) with amounts side by side

3. **`WalletSection.tsx`** — Section header "Wallets" + "View All >", then a horizontally scrolling row of `WalletCard` components.

4. **`WalletCard.tsx`** — Compact colored card (~half screen width). Each has a distinct background color (green, blue, yellow, purple from mockup). Shows: `IconCircle` with wallet type icon, wallet name, 3-dot menu, balance amount. Last card is a dashed-border "+" add card.

5. **`BudgetSection.tsx`** — Section header "Budgets" + "View All >", then vertically stacked `BudgetProgressCard` components.

6. **`BudgetProgressCard.tsx`** — White card with: budget name, `ProgressBar` (colored fill matching budget theme), "Spent: $X / $Y" text on left, percentage on right.

7. **`UpcomingCosts.tsx`** — Section header "Upcoming Costs" + "Manage Recurring >", then a list of upcoming items. Each row: `IconCircle`, title + "Due {date} - Today" subtitle, amount on the right.

**2C. Home Screen Composition (`src/app/(tabs)/index.tsx`)**

Compose all sections into a `ScrollView`. The screen itself should be thin — just imports and layout, no logic.

**Critical files**: `src/components/ui/*`, `src/components/home/*`, `src/app/(tabs)/index.tsx`, `src/constants/colors.ts`

---

### Phase 3: UI — Add Transaction Modal
Build the Add Transaction screen from `assets/images/new-transaction.png` as a modal route.

**3A. Reusable UI Primitives (new or extended)**

- **`TabPill.tsx`** — Horizontal toggle with 3 options (Income / Expense / Transfer). The active tab has a dark filled pill, others are plain text. Takes `options`, `activeIndex`, `onChange` props.
- **`DropdownField.tsx`** — Row with icon + label + chevron, styled as a tappable field. Used for Category, From Wallet, To Wallet selectors. Takes `icon`, `label`, `value`, `onPress` props. (Selection UI is a future concern — for now just show the field.)
- **`Button.tsx`** — Full-width rounded button. Primary variant = solid blue. Takes `label`, `variant`, `onPress`, `disabled` props.

**3B. Transaction Form (`src/components/forms/TransactionForm.tsx`)**

Build the form layout matching the mockup, all static/hardcoded:

1. **Tab row** — `TabPill` with Income (default active) / Expense / Transfer. Switching tabs is functional (local state) but doesn't change the form yet.
2. **Amount display** — "Amount" label above, large formatted dollar amount below. Tapping could later open a number pad — for now, just display a hardcoded value.
3. **Field grid** — Two columns:
   - Row 1: `DropdownField` for Category (left) + `DropdownField` for Date showing "21 Dec, 2025" (right)
   - Row 2: `DropdownField` for "From - Wallet" (left) + `DropdownField` for "To - Wallet" (right, visible only in Transfer mode)
4. **Description** — Row with icon + "Add Description" text, tappable.
5. **Submit button** — `Button` with "Add Transaction" label, full-width at bottom.

**3C. Modal Route (`src/app/(modals)/`)**

- Create `src/app/(modals)/_layout.tsx` — modal presentation config (transparent background, slide-up animation)
- Create `src/app/(modals)/add-transaction.tsx` — renders `TransactionForm`
- Wire FAB `onPress` in `CustomTabBar.tsx` to `router.push('/(modals)/add-transaction')`

**Critical files**: `src/components/ui/TabPill.tsx`, `src/components/ui/DropdownField.tsx`, `src/components/ui/Button.tsx`, `src/components/forms/TransactionForm.tsx`, `src/app/(modals)/*`, `src/components/navigation/CustomTabBar.tsx`

---

### Phase 4: UI — Transaction History Screen
Build the Transaction list screen from `assets/images/transaction.png` with hardcoded data.

**4A. Reusable UI Primitives (new or extended)**

- **`FilterPills.tsx`** — Horizontal row of pill buttons (All / Income / Expense / Transfer). Single-select, active pill is filled dark. Reuses pill styling from `TabPill` but semantically a filter. Takes `options`, `activeValue`, `onChange` props.
- **`DateNavigator.tsx`** — "< Mon, 21 Dec 2026 >" row with left/right arrows and a calendar icon on the far right. Takes `date`, `onPrev`, `onNext`, `onCalendarPress` props.

**4B. Transaction Screen Sections (`src/components/transaction/`)**

1. **`DateNavigator.tsx`** — (see above, placed at top of screen)
2. **`TransactionFilters.tsx`** — Renders `FilterPills` below the date navigator.
3. **`OverviewBar.tsx`** — Three cards in a column:
   - Balance card: `IconCircle` + "Balance" label + amount (red if negative)
   - Income/Expense row: two side-by-side cards each showing icon + label + amount + "±X% than last month" comparison text (green for income, red for expense)
4. **`TransactionDateGroup.tsx`** — Date header row: large day number + day name + month.year, with a horizontal divider. Groups a list of `TransactionItem` below it.
5. **`TransactionItem.tsx`** — Single transaction row: `IconCircle` (category color + icon) on left, title + wallet name below, amount (color-coded) + time on right.
6. **`TransactionList.tsx`** — Composes date groups with items. Takes a flat list of mock transactions, groups by date, renders `TransactionDateGroup` > `TransactionItem[]`.

**4C. Screen Composition (`src/app/(tabs)/transactions.tsx`)**

Compose `DateNavigator` + `TransactionFilters` + `OverviewBar` + `TransactionList` in a `ScrollView`. Filter pill selection is functional (local state toggling) but just filters the hardcoded data.

**Critical files**: `src/components/ui/FilterPills.tsx`, `src/components/ui/DateNavigator.tsx`, `src/components/transaction/*`, `src/app/(tabs)/transactions.tsx`

---

### Phase 5: Data Layer Foundation
Now wire real data behind the UIs built in Phases 2–4.

- Define row types in `src/types/database.ts` for all 8 tables
- Write initial SQL migration (`001_initial.sql`) with tables and indexes
- Build migration runner using `PRAGMA user_version`
- Create default categories constant with icons/colors
- Write dev seed data script
- Repository + service layers for Account, Wallet, Category, Transaction
- React Query hooks for all entities
- Zustand stores for active account, filters
- Replace hardcoded data in Home, Transaction History, and Add Transaction screens with real hooks

**Critical files**: `src/types/database.ts`, `src/db/*`, `src/repositories/*`, `src/services/*`, `src/hooks/*`, `src/stores/*`

---

### Phase 6: Transaction System Logic
- Full transaction CRUD with atomic balance updates
- Connect Add Transaction form to real mutation (create transaction + update wallet balance)
- Category picker, wallet picker, date picker — real selection UIs
- Swipe-to-delete on transaction list
- Transaction editing

**Critical files**: `src/services/transaction.service.ts`, `src/repositories/transaction.repository.ts`

---

### Phase 7: Budget System
- Budget CRUD with category linking
- Budget progress calculation service
- Connect Home screen budget section to real data

**Critical files**: `src/services/budget.service.ts`, `src/repositories/budget.repository.ts`

---

### Phase 8: Recurring Transactions
- Recurring CRUD, pending transaction generation engine
- Auto-confirmation, confirm/skip/modify actions
- Committed balance, connect Upcoming Costs section to real data

**Critical files**: `src/services/recurring.service.ts`, `src/repositories/recurring.repository.ts`

---

### Phase 9: Debt Tracking
- Debt CRUD (borrow/lend), settlement recording
- Home screen debt section with real data

**Critical files**: `src/services/debt.service.ts`, `src/repositories/debt.repository.ts`

---

### Phase 10: Calendar & Statistics Screens
- Calendar grid with monthly data, day tap to see transactions
- Pie chart, bar chart, period selector, trend analysis

**Critical files**: `src/components/calendar/*`, `src/components/stats/*`

---

### Phase 11: Polish & Advanced Features
- Onboarding flow, empty states, haptic feedback
- Animations, error boundaries, FlashList for long lists

### Phase 12: Backup, Export & Import
- CSV/JSON export/import, Google Drive backup via `expo-auth-session`

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
