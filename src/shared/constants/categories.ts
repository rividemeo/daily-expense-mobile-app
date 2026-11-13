import { Category } from '@/types/models';

export const DEFAULT_EXPENSE_CATEGORIES: Omit<
  Category,
  'userId' | 'familyId' | 'createdAt' | 'updatedAt'
>[] = [
  {
    id: 'cat_food',
    name: 'Food & Drink',
    icon: 'food-fork-drink',
    color: '#FF3B30',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_transport',
    name: 'Transportation',
    icon: 'car',
    color: '#007AFF',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_shopping',
    name: 'Shopping',
    icon: 'shopping',
    color: '#AF52DE',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_utilities',
    name: 'Utilities',
    icon: 'flash',
    color: '#FF9500',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_entertainment',
    name: 'Entertainment',
    icon: 'television-play',
    color: '#FF2D55',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_health',
    name: 'Health',
    icon: 'heart-pulse',
    color: '#34C759',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_education',
    name: 'Education',
    icon: 'school',
    color: '#30B0C7',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_travel',
    name: 'Travel',
    icon: 'airplane',
    color: '#32ADE6',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_household',
    name: 'Household',
    icon: 'home',
    color: '#00C7BE',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_family',
    name: 'Family & Housing',
    icon: 'home-heart',
    color: '#FF2D55',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_topup',
    name: 'Top-up & Cash',
    icon: 'wallet-plus',
    color: '#5AC8FA',
    type: 'expense',
    isDefault: true,
  },
  {
    // Friends paying back a split bill. Stored as a negative expense so it lowers spending
    // instead of counting as income (income is salary only).
    id: 'cat_payback',
    name: 'Split-bill Payback',
    icon: 'cash-refund',
    color: '#34C759',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_expense_other',
    name: 'Other',
    icon: 'dots-horizontal',
    color: '#8E8E93',
    type: 'expense',
    isDefault: true,
  },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<
  Category,
  'userId' | 'familyId' | 'createdAt' | 'updatedAt'
>[] = [
  {
    id: 'cat_salary',
    name: 'Salary',
    icon: 'briefcase',
    color: '#34C759',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_freelance',
    name: 'Freelance',
    icon: 'laptop',
    color: '#5AC8FA',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_business',
    name: 'Business',
    icon: 'store',
    color: '#5856D6',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_investment',
    name: 'Investment',
    icon: 'chart-line',
    color: '#FF9500',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_bonus',
    name: 'Bonus',
    icon: 'star',
    color: '#FF2D55',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_gift',
    name: 'Gift',
    icon: 'gift',
    color: '#FF3B30',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_income_other',
    name: 'Other',
    icon: 'dots-horizontal',
    color: '#8E8E93',
    type: 'income',
    isDefault: true,
  },
];

export const ALL_DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

export const CATEGORY_ICONS = [
  'food-fork-drink', 'car', 'shopping', 'flash', 'television-play',
  'heart-pulse', 'school', 'airplane', 'home', 'briefcase',
  'laptop', 'store', 'chart-line', 'star', 'gift',
  'camera', 'music', 'gamepad-variant', 'dumbbell', 'coffee',
  'book', 'bus', 'train', 'bicycle', 'baby-carriage',
  'paw', 'flower', 'tree', 'water', 'fire',
  'bank', 'credit-card', 'cash', 'wallet', 'piggy-bank',
  'chart-bar', 'trending-up', 'percent', 'tag', 'receipt',
];

/** Paybacks are stored negative so they lower spending totals; every other amount is positive. */
export const signedAmount = (amount: number, categoryId: string) =>
  categoryId === 'cat_payback' ? -Math.abs(amount) : Math.abs(amount);
