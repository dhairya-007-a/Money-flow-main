import { createContext } from 'react';
import type { 
  Transaction, 
  Category, 
  FilterOptions, 
  FinanceSummary, 
  StorageSaveStatus, 
  ToastNotification 
} from '../types/finance';
import type { CategoryBreakdownItem, DailyTrendItem } from '../services/storageService';

export interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (open: boolean) => void;
  isDatabaseModalOpen: boolean;
  setIsDatabaseModalOpen: (open: boolean) => void;
  isFirstLaunch: boolean;
  completeFirstLaunch: (withSampleData?: boolean) => void;

  // Backend Persistence & Auto-Save State
  saveStatus: StorageSaveStatus;
  lastSavedTime: string | null;

  // Toasts
  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Password Security State & Methods
  hasPasswordSet: boolean;
  setHasPasswordSet: (has: boolean) => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  lockApp: () => void;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id' | 'isCustom'>) => Category;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  
  // Computed values from backend calculation engine
  filteredTransactions: Transaction[];
  summary: FinanceSummary;
  categoryBreakdown: CategoryBreakdownItem[];
  dailyTrends: DailyTrendItem[];
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);
