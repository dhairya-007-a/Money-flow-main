import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  Transaction, 
  Category, 
  FilterOptions
} from '../types/finance';
import { StorageService } from '../services/storageService';
import { SecurityService } from '../services/securityService';
import { INITIAL_CATEGORIES, getSampleTransactions } from '../data/initialData';
import { FinanceContext } from './financeContextDefinition';
import confetti from 'canvas-confetti';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currency = '₹';

  // First time launch detection
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(() => StorageService.isFirstLaunch());

  // Security State - if password was set previously, lock app; if not, open dashboard directly
  const [hasPasswordSet, setHasPasswordSet] = useState<boolean>(() => SecurityService.hasPasswordSet());
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (StorageService.isFirstLaunch()) return false;
    return SecurityService.hasPasswordSet();
  });
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);

  const lockApp = useCallback(() => {
    setIsLocked(true);
  }, []);

  // Initialize state via StorageService backend
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.getTransactions());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);

  // Persistence & Save Status Tracking
  const [saveStatus, setSaveStatus] = useState<import('../types/finance').StorageSaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Toast Notification System
  const [toasts, setToasts] = useState<import('../types/finance').ToastNotification[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: import('../types/finance').ToastNotification = { id, message, type, timestamp: Date.now() };
    setToasts((prev) => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    categoryId: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    sortBy: 'date-desc'
  });

  // Subscribe to storage persistence lifecycle
  useEffect(() => {
    const unsubscribe = StorageService.subscribeSaveStatus((status, info) => {
      setSaveStatus(status);
      if (info?.lastSaved) {
        setLastSavedTime(info.lastSaved);
      }
    });
    return unsubscribe;
  }, []);

  // Hydrate from Desktop Electron file backend on startup
  useEffect(() => {
    async function hydrate() {
      const backendData = await StorageService.hydrateFromBackend();
      if (backendData) {
        if (backendData.transactions) setTransactions(backendData.transactions);
        if (backendData.categories) setCategories(backendData.categories);
        if (backendData.hasPasswordSet !== undefined) {
          setHasPasswordSet(backendData.hasPasswordSet);
          if (backendData.hasPasswordSet) setIsLocked(true);
        }
      }
    }
    hydrate();
  }, []);

  // Sync state mutations to storage via StorageService backend
  useEffect(() => {
    StorageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    StorageService.saveCategories(categories);
  }, [categories]);

  // Transaction CRUD Backend Operations
  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      amount: Number(txData.amount) || 0,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    setTransactions((prev) => [newTx, ...prev]);
    addToast(`Logged ${currency}${newTx.amount.toLocaleString('en-IN')} at ${newTx.merchant}`, 'success');
    StorageService.sendSystemNotification('Spend Logged', `${currency}${newTx.amount} at ${newTx.merchant}`);
  }, [currency, addToast]);

  const updateTransaction = useCallback((id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updated, amount: updated.amount !== undefined ? Number(updated.amount) || 0 : tx.amount } : tx))
    );
    addToast('Transaction updated successfully', 'info');
  }, [addToast]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    addToast('Transaction removed', 'warning');
  }, [addToast]);

  // Category CRUD Backend Operations
  const addCategory = useCallback((catData: Omit<Category, 'id' | 'isCustom'>): Category => {
    const id = catData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + `-${Date.now()}`;
    const newCat: Category = {
      ...catData,
      id,
      isCustom: true
    };
    setCategories((prev) => [...prev, newCat]);
    addToast(`Created category "${newCat.name}"`, 'success');
    return newCat;
  }, [addToast]);

  const updateCategory = useCallback((id: string, category: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...category } : cat))
    );
    addToast('Category updated', 'info');
  }, [addToast]);

  const deleteCategory = useCallback((id: string) => {
    const fallbackCategory = categories.find((c) => c.id !== id)?.id || 'food';
    setTransactions((prev) =>
      prev.map((tx) => (tx.categoryId === id ? { ...tx, categoryId: fallbackCategory } : tx))
    );
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    addToast('Category deleted and items reallocated', 'info');
  }, [categories, addToast]);

  const resetToSampleData = useCallback(() => {
    setTransactions([]);
    setCategories(INITIAL_CATEGORIES);
    addToast('Reset to default initial categories', 'info');
  }, [addToast]);

  const completeFirstLaunch = useCallback((withSampleData = false) => {
    StorageService.markOnboarded();
    setIsFirstLaunch(false);
    if (withSampleData) {
      const samples = getSampleTransactions();
      setTransactions(samples);
      addToast('Loaded sample transactions to showcase analytics', 'success');
    } else {
      addToast('Welcome to Finance Flow! Ready to log your first spend', 'success');
    }
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  }, [addToast]);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    addToast('Cleared all transactions', 'warning');
  }, [addToast]);

  const exportData = useCallback((): string => {
    return StorageService.exportDataJSON();
  }, []);

  const importData = useCallback((jsonStr: string): boolean => {
    const success = StorageService.importDataJSON(jsonStr);
    if (success) {
      setTransactions(StorageService.getTransactions());
      setCategories(StorageService.getCategories());
      addToast('Data restored successfully', 'success');
    } else {
      addToast('Invalid backup file format', 'error');
    }
    return success;
  }, [addToast]);

  // Computed Values from Backend Calculation Engine
  const filteredTransactions = useMemo(() => {
    return StorageService.filterAndSortTransactions(transactions, filters);
  }, [transactions, filters]);

  const summary = useMemo(() => {
    return StorageService.calculateSummary(transactions);
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    return StorageService.calculateCategoryBreakdown(transactions, categories);
  }, [transactions, categories]);

  const dailyTrends = useMemo(() => {
    return StorageService.calculateDailyTrends(transactions);
  }, [transactions]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        currency,
        filters,
        setFilters,
        activeTab,
        setActiveTab,
        isAddModalOpen,
        setIsAddModalOpen,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        isDatabaseModalOpen,
        setIsDatabaseModalOpen,
        isFirstLaunch,
        completeFirstLaunch,
        saveStatus,
        lastSavedTime,
        toasts,
        addToast,
        removeToast,
        hasPasswordSet,
        setHasPasswordSet,
        isLocked,
        setIsLocked,
        lockApp,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        resetToSampleData,
        clearAllData,
        exportData,
        importData,
        filteredTransactions,
        summary,
        categoryBreakdown,
        dailyTrends
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
