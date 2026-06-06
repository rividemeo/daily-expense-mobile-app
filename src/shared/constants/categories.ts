import { Category } from '@/types/models';

export const DEFAULT_EXPENSE_CATEGORIES: Omit<
  Category,
  'userId' | 'familyId' | 'createdAt' | 'updatedAt'
>[] = [
  {
    id: 'cat_food',
    name: 'Food & Drink',
    icon: 'food-fork-drink',
    color: '#EF4444',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_transport',
    name: 'Transportation',
    icon: 'car',
    color: '#3B82F6',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_shopping',
    name: 'Shopping',
    icon: 'shopping',
    color: '#8B5CF6',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_utilities',
    name: 'Utilities',
    icon: 'flash',
    color: '#F59E0B',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_entertainment',
    name: 'Entertainment',
    icon: 'television-play',
    color: '#EC4899',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_health',
    name: 'Health',
    icon: 'heart-pulse',
    color: '#10B981',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_education',
    name: 'Education',
    icon: 'school',
    color: '#14B8A6',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_travel',
    name: 'Travel',
    icon: 'airplane',
    color: '#06B6D4',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_household',
    name: 'Household',
    icon: 'home',
    color: '#84CC16',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_expense_other',
    name: 'Other',
    icon: 'dots-horizontal',
    color: '#9CA3AF',
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
    color: '#16A34A',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_freelance',
    name: 'Freelance',
    icon: 'laptop',
    color: '#0EA5E9',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_business',
    name: 'Business',
    icon: 'store',
    color: '#6366F1',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_investment',
    name: 'Investment',
    icon: 'chart-line',
    color: '#F59E0B',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_bonus',
    name: 'Bonus',
    icon: 'star',
    color: '#EC4899',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_gift',
    name: 'Gift',
    icon: 'gift',
    color: '#EF4444',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_income_other',
    name: 'Other',
    icon: 'dots-horizontal',
    color: '#9CA3AF',
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
