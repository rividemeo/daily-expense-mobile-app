export type TransactionType = 'income' | 'expense';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type FamilyRole = 'owner' | 'member';

export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'digital_wallet'
  | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  language: string;
  theme: ThemeMode;
  familyId?: string;
  familyRole?: FamilyRole;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
  userId?: string;
  familyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  category?: Category;
  description: string;
  date: string;
  tags: string[];
  paymentMethod: PaymentMethod;
  notes?: string;
  attachmentUrl?: string;
  attachmentPath?: string;
  isRecurring: boolean;
  recurringId?: string;
  userId: string;
  familyId?: string;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  categoryId?: string;
  category?: Category;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  alertThreshold50: boolean;
  alertThreshold80: boolean;
  alertThreshold100: boolean;
  userId: string;
  familyId?: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransaction {
  id: string;
  templateTransactionId: string;
  template?: Transaction;
  frequency: RecurringFrequency;
  nextDueDate: string;
  lastGeneratedDate?: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  user?: User;
  familyId: string;
  role: FamilyRole;
  invitedBy?: string;
  joinedAt: string;
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'budget_alert' | 'recurring_transaction' | 'monthly_summary' | 'general';
  isRead: boolean;
  data?: Record<string, unknown>;
  userId: string;
  createdAt: string;
}

export interface DashboardStats {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  budgetUsagePercent: number;
}

export interface SpendingByCategory {
  categoryId: string;
  category: Category;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  spendingByCategory: SpendingByCategory[];
  dailyExpenses: { date: string; amount: number }[];
}

export interface SyncStatus {
  lastSyncedAt: string | null;
  pendingChanges: number;
  isSyncing: boolean;
}

// Future-ready schema extensions (not yet implemented)
export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  userId: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  userId: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  currentValue: number;
  purchaseValue: number;
  userId: string;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  outstandingBalance: number;
  interestRate: number;
  monthlyPayment: number;
  userId: string;
}
