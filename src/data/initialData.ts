import type { Category, Transaction } from '../types/finance';

export const PALETTE = {
  CELADON_LIGHT: '#b7e4c7',
  CELADON: '#95d5b2',
  MINT_LEAF_LIGHT: '#74c69d',
  MINT_LEAF: '#52b788',
  SEA_GREEN: '#40916c',
  DARK_EMERALD: '#2d6a4f',
};

export const AVAILABLE_ICONS = [
  { name: 'CreditCard', label: 'Here I Paid / Cards' },
  { name: 'Shirt', label: 'Laundry / Clothes' },
  { name: 'Utensils', label: 'Food & Dining' },
  { name: 'Car', label: 'Travel / Transport' },
  { name: 'ShoppingBag', label: 'Shopping' },
  { name: 'Zap', label: 'Bills / Utilities' },
  { name: 'Gamepad2', label: 'Entertainment' },
  { name: 'HeartPulse', label: 'Health & Medical' },
  { name: 'Coffee', label: 'Cafes & Drinks' },
  { name: 'Film', label: 'Movies & Shows' },
  { name: 'Home', label: 'Rent / Home' },
  { name: 'BookOpen', label: 'Education / Books' },
  { name: 'Gift', label: 'Gifts & Donations' },
  { name: 'Plane', label: 'Flights / Vacations' },
  { name: 'Dumbbell', label: 'Fitness & Gym' },
  { name: 'Wrench', label: 'Maintenance' },
  { name: 'Sparkles', label: 'Other / Custom' },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'here-i-paid',
    name: 'Here I Paid',
    iconName: 'CreditCard',
    imageUrl: './dollars.png',
    color: '#74c69d',
    bgGradient: 'from-[#74c69d] to-[#52b788]',
    budgetLimit: 10000,
  },
  {
    id: 'food',
    name: 'Food & Dining',
    iconName: 'Utensils',
    imageUrl: './food.png',
    color: '#52b788',
    bgGradient: 'from-[#52b788] to-[#40916c]',
    budgetLimit: 12000,
  },
  {
    id: 'laundry',
    name: 'Laundry & Clean',
    iconName: 'Shirt',
    color: '#b7e4c7',
    bgGradient: 'from-[#b7e4c7] to-[#95d5b2]',
    budgetLimit: 3000,
  },
  {
    id: 'travel',
    name: 'Travel & Transport',
    iconName: 'Car',
    color: '#2d6a4f',
    bgGradient: 'from-[#40916c] to-[#2d6a4f]',
    budgetLimit: 8000,
  },
  {
    id: 'shopping',
    name: 'Shopping & Clothes',
    iconName: 'ShoppingBag',
    color: '#95d5b2',
    bgGradient: 'from-[#95d5b2] to-[#74c69d]',
    budgetLimit: 10000,
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    iconName: 'Zap',
    imageUrl: './budget.png',
    color: '#40916c',
    bgGradient: 'from-[#40916c] to-[#2d6a4f]',
    budgetLimit: 15000,
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    iconName: 'Gamepad2',
    color: '#52b788',
    bgGradient: 'from-[#52b788] to-[#2d6a4f]',
    budgetLimit: 5000,
  },
  {
    id: 'health',
    name: 'Health & Medical',
    iconName: 'HeartPulse',
    color: '#b7e4c7',
    bgGradient: 'from-[#b7e4c7] to-[#52b788]',
    budgetLimit: 4000,
  }
];

export const USER_SAVED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-demo-1",
    amount: 1450,
    merchant: "Green Valley Supermarket",
    description: "Weekly organic groceries & produce",
    date: "2026-10-01",
    time: "14:30",
    categoryId: "food",
    paymentMethod: "online",
    createdAt: "2026-10-01T09:00:00.000Z"
  },
  {
    id: "tx-demo-2",
    amount: 2199,
    merchant: "FiberNet Broadband",
    description: "Monthly fiber internet utility",
    date: "2026-10-02",
    time: "10:15",
    categoryId: "bills",
    paymentMethod: "online",
    createdAt: "2026-10-02T04:45:00.000Z"
  },
  {
    id: "tx-demo-3",
    amount: 320,
    merchant: "Artisan Roasters Cafe",
    description: "Cold brew coffee & pastry",
    date: "2026-10-03",
    time: "11:20",
    categoryId: "food",
    paymentMethod: "cash",
    createdAt: "2026-10-03T05:50:00.000Z"
  },
  {
    id: "tx-demo-4",
    amount: 650,
    merchant: "Metro Transit System",
    description: "Weekly commute metro card refill",
    date: "2026-10-04",
    time: "08:45",
    categoryId: "travel",
    paymentMethod: "online",
    createdAt: "2026-10-04T03:15:00.000Z"
  },
  {
    id: "tx-demo-5",
    amount: 1200,
    merchant: "Paperback Bookstore",
    description: "Financial planning & productivity books",
    date: "2026-10-05",
    time: "16:10",
    categoryId: "shopping",
    paymentMethod: "online",
    createdAt: "2026-10-05T10:40:00.000Z"
  }
];

export const SAMPLE_TRANSACTIONS: Transaction[] = USER_SAVED_TRANSACTIONS;
export const getSampleTransactions = (): Transaction[] => USER_SAVED_TRANSACTIONS;
