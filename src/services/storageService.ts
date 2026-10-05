import type { 
  Transaction, 
  Category, 
  FilterOptions, 
  FinanceSummary, 
  BackendStatus, 
  FinanceDataPayload, 
  StorageSaveStatus 
} from '../types/finance';
import { INITIAL_CATEGORIES, USER_SAVED_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'antigravity_finance_transactions_inr_v2',
  CATEGORIES: 'antigravity_finance_categories_inr_v2',
  SECURITY: 'antigravity_finance_security_v2',
  METADATA: 'antigravity_finance_metadata_v2',
};

export interface CategoryBreakdownItem {
  category: Category;
  amount: number;
  percentage: number;
  count: number;
  budgetUtilization: number;
  isOverBudget: boolean;
}

export interface DailyTrendItem {
  date: string;
  displayDate: string;
  total: number;
  cash: number;
  online: number;
}

type SaveStatusListener = (status: StorageSaveStatus, info?: { lastSaved?: string; error?: string }) => void;
const saveStatusListeners = new Set<SaveStatusListener>();

let currentSaveStatus: StorageSaveStatus = 'idle';
let lastSavedTimestamp: string | null = null;
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function notifyStatus(status: StorageSaveStatus, info?: { lastSaved?: string; error?: string }) {
  currentSaveStatus = status;
  if (info?.lastSaved) lastSavedTimestamp = info.lastSaved;
  saveStatusListeners.forEach(listener => {
    try {
      listener(status, info);
    } catch (e) {
      console.error('[StorageService] Error in status listener:', e);
    }
  });
}

/**
 * Enterprise Data Storage & Backend Calculation Service
 * Provides seamless dual-mode persistence:
 * 1. Native Electron Desktop Backend (Atomic JSON storage on disk in AppData + Backups)
 * 2. Web LocalStorage / IndexedDB fallback (when loaded in browser)
 */
export const StorageService = {
  isElectron(): boolean {
    return typeof window !== 'undefined' && Boolean(window.financeBackend?.isElectron);
  },

  isFirstLaunch(): boolean {
    return false;
  },

  markOnboarded(): void {
    try {
      localStorage.setItem('antigravity_finance_onboarded_v2', 'true');
    } catch (e) {
      console.error(e);
    }
  },

  subscribeSaveStatus(listener: SaveStatusListener): () => void {
    saveStatusListeners.add(listener);
    listener(currentSaveStatus, { lastSaved: lastSavedTimestamp || undefined });
    return () => {
      saveStatusListeners.delete(listener);
    };
  },

  // Synchronous Local Load (for instantaneous initial React mount)
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(USER_SAVED_TRANSACTIONS));
        return USER_SAVED_TRANSACTIONS;
      }
      const parsed: Transaction[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(USER_SAVED_TRANSACTIONS));
        return USER_SAVED_TRANSACTIONS;
      }
      return parsed;
    } catch (error) {
      console.error('[Backend StorageService] Error reading transactions:', error);
      return USER_SAVED_TRANSACTIONS;
    }
  },

  // Synchronous Category Load with seed migration
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
        return INITIAL_CATEGORIES;
      }
      
      const parsed: Category[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_CATEGORIES;

      const existingMap = new Map(parsed.map((c) => [c.id, c]));
      let hasUpdates = false;

      INITIAL_CATEGORIES.forEach((defCat) => {
        const existing = existingMap.get(defCat.id);
        if (!existing) {
          existingMap.set(defCat.id, defCat);
          hasUpdates = true;
        } else {
          if (defCat.imageUrl && !existing.imageUrl) {
            existing.imageUrl = defCat.imageUrl;
            hasUpdates = true;
          }
          if (defCat.budgetLimit && !existing.budgetLimit) {
            existing.budgetLimit = defCat.budgetLimit;
            hasUpdates = true;
          }
        }
      });

      const merged = Array.from(existingMap.values());
      if (hasUpdates) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(merged));
      }
      return merged;
    } catch (error) {
      console.error('[Backend StorageService] Error reading categories:', error);
      return INITIAL_CATEGORIES;
    }
  },

  // Save Transactions (Local Cache + Async Backend Disk Sync)
  saveTransactions(transactions: Transaction[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      this.triggerDebouncedBackendSync();
      return true;
    } catch (error) {
      console.error('[Backend StorageService] Error saving transactions:', error);
      return false;
    }
  },

  // Save Categories (Local Cache + Async Backend Disk Sync)
  saveCategories(categories: Category[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      this.triggerDebouncedBackendSync();
      return true;
    } catch (error) {
      console.error('[Backend StorageService] Error saving categories:', error);
      return false;
    }
  },

  // Asynchronous Debounced Backend Persistence (Writes atomically to disk in Electron)
  triggerDebouncedBackendSync() {
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
    }

    notifyStatus('saving');

    saveDebounceTimer = setTimeout(async () => {
      try {
        const txs = this.getTransactions();
        const cats = this.getCategories();
        const now = new Date().toISOString();

        const payload: FinanceDataPayload = {
          version: '2.0.0',
          appName: 'Personal Finance Spendar',
          lastSaved: now,
          transactions: txs,
          categories: cats,
          security: {
            passwordHash: localStorage.getItem('antigravity_finance_password_hash'),
            passwordHint: localStorage.getItem('antigravity_finance_password_hint'),
            hasPasswordSet: Boolean(localStorage.getItem('antigravity_finance_password_hash'))
          }
        };

        if (this.isElectron() && window.financeBackend) {
          const res = await window.financeBackend.saveAll(payload);
          if (res.success) {
            notifyStatus('saved', { lastSaved: res.lastSaved || now });
          } else {
            notifyStatus('error', { error: res.error });
          }
        } else {
          // Local environment fallback
          localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify({ lastSaved: now, version: '2.0.0' }));
          notifyStatus('saved', { lastSaved: now });
        }
      } catch (err: any) {
        console.error('[Backend StorageService] Sync failure:', err);
        notifyStatus('error', { error: err.message });
      }
    }, 350);
  },

  // Hydrate Data from Electron Disk Backend (if available on startup)
  async hydrateFromBackend(): Promise<{ transactions: Transaction[]; categories: Category[]; hasPasswordSet?: boolean } | null> {
    try {
      if (this.isElectron() && window.financeBackend) {
        const data = await window.financeBackend.loadAll();
        if (data && Array.isArray(data.transactions)) {
          const categories = Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : INITIAL_CATEGORIES;
          // Update local cache
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
          
          if (data.security?.passwordHash) {
            localStorage.setItem('antigravity_finance_password_hash', data.security.passwordHash);
          }
          if (data.security?.passwordHint) {
            localStorage.setItem('antigravity_finance_password_hint', data.security.passwordHint);
          }

          notifyStatus('saved', { lastSaved: data.lastSaved });
          return {
            transactions: data.transactions,
            categories: categories,
            hasPasswordSet: Boolean(data.security?.passwordHash)
          };
        }
      }
      return null;
    } catch (e) {
      console.error('[Backend StorageService] Error hydrating from backend:', e);
      return null;
    }
  },

  // Get Detailed Backend & Database Diagnostics
  async getBackendDiagnostics(): Promise<BackendStatus> {
    if (this.isElectron() && window.financeBackend) {
      try {
        return await window.financeBackend.getStatus();
      } catch (err: any) {
        return {
          isElectron: true,
          storageType: 'file',
          error: err.message
        };
      }
    }

    // Browser metrics
    const txData = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]';
    const catData = localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]';
    const sizeBytes = new Blob([txData, catData]).size;

    return {
      isElectron: false,
      storageType: 'local_storage',
      sizeBytes,
      lastSaved: lastSavedTimestamp,
      backupCount: 0,
      platform: navigator.userAgent
    };
  },

  // Create Instant Snapshot Backup
  async createSnapshotBackup(note?: string): Promise<{ success: boolean; filePath?: string; fileName?: string; error?: string }> {
    if (this.isElectron() && window.financeBackend) {
      return await window.financeBackend.createBackup(note);
    }

    // In browser, create downloadable snapshot
    try {
      const json = this.exportDataJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName = `spendar_backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, fileName };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // Open AppData storage directory (Electron only)
  async openStorageFolder(): Promise<{ success: boolean; error?: string }> {
    if (this.isElectron() && window.financeBackend) {
      return await window.financeBackend.openDataFolder();
    }
    return { success: false, error: 'Only available in desktop app.' };
  },

  // Native File Export Dialog
  async exportWithNativeDialog(filename: string, content: string, filterName: string, extension: string): Promise<boolean> {
    if (this.isElectron() && window.financeBackend) {
      const res = await window.financeBackend.exportFile({
        defaultFileName: filename,
        content,
        filterName,
        extension
      });
      return Boolean(res.success);
    }

    // Browser fallback
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  },

  // Native File Import Dialog
  async importWithNativeDialog(): Promise<boolean> {
    if (this.isElectron() && window.financeBackend) {
      const res = await window.financeBackend.importFile();
      if (res.success && res.data) {
        return this.importDataPayload(res.data);
      }
      return false;
    }
    return false;
  },

  // Send OS notification
  async sendSystemNotification(title: string, body: string) {
    if (this.isElectron() && window.financeBackend) {
      window.financeBackend.showNotification({ title, body });
    }
  },

  // Calculation Engine: Summary Totals
  calculateSummary(transactions: Transaction[]): FinanceSummary {
    let totalSpent = 0;
    let cashTotal = 0;
    let onlineTotal = 0;

    transactions.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      totalSpent += amount;
      if (tx.paymentMethod === 'cash') {
        cashTotal += amount;
      } else {
        onlineTotal += amount;
      }
    });

    const cashPercentage = totalSpent > 0 ? Math.round((cashTotal / totalSpent) * 100) : 0;
    const onlinePercentage = totalSpent > 0 ? 100 - cashPercentage : 0;

    return {
      totalSpent,
      cashTotal,
      onlineTotal,
      transactionCount: transactions.length,
      cashPercentage,
      onlinePercentage,
    };
  },

  // Calculation Engine: Category Breakdown & Budget Tracking
  calculateCategoryBreakdown(transactions: Transaction[], categories: Category[]): CategoryBreakdownItem[] {
    const summary = this.calculateSummary(transactions);
    const amountMap: Record<string, { amount: number; count: number }> = {};

    transactions.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      if (!amountMap[tx.categoryId]) {
        amountMap[tx.categoryId] = { amount: 0, count: 0 };
      }
      amountMap[tx.categoryId].amount += amount;
      amountMap[tx.categoryId].count += 1;
    });

    return categories.map((cat) => {
      const data = amountMap[cat.id] || { amount: 0, count: 0 };
      const percentage = summary.totalSpent > 0 ? Math.round((data.amount / summary.totalSpent) * 100) : 0;
      const budgetLimit = cat.budgetLimit || 10000;
      const budgetUtilization = Math.round((data.amount / budgetLimit) * 100);
      
      return {
        category: cat,
        amount: data.amount,
        percentage,
        count: data.count,
        budgetUtilization,
        isOverBudget: data.amount > budgetLimit,
      };
    }).sort((a, b) => b.amount - a.amount);
  },

  // Calculation Engine: Daily Spending Timeline
  calculateDailyTrends(transactions: Transaction[]): DailyTrendItem[] {
    const dayMap: Record<string, { total: number; cash: number; online: number }> = {};

    transactions.forEach((tx) => {
      const dateKey = tx.date;
      const amount = Number(tx.amount) || 0;
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { total: 0, cash: 0, online: 0 };
      }
      dayMap[dateKey].total += amount;
      if (tx.paymentMethod === 'cash') {
        dayMap[dateKey].cash += amount;
      } else {
        dayMap[dateKey].online += amount;
      }
    });

    const sortedDates = Object.keys(dayMap).sort((a, b) => a.localeCompare(b));

    return sortedDates.map((dateStr) => {
      const dateObj = new Date(dateStr);
      const displayDate = isNaN(dateObj.getTime())
        ? dateStr
        : dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        displayDate,
        total: dayMap[dateStr].total,
        cash: dayMap[dateStr].cash,
        online: dayMap[dateStr].online,
      };
    });
  },

  // Backend Filter & Search Engine
  filterAndSortTransactions(transactions: Transaction[], filters: FilterOptions): Transaction[] {
    return transactions
      .filter((tx) => {
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase().trim();
          const matchMerchant = tx.merchant.toLowerCase().includes(query);
          const matchDesc = tx.description.toLowerCase().includes(query);
          const matchAmount = tx.amount.toString().includes(query);
          if (!matchMerchant && !matchDesc && !matchAmount) return false;
        }

        if (filters.categoryId !== 'all' && tx.categoryId !== filters.categoryId) {
          return false;
        }

        if (filters.paymentMethod !== 'all' && tx.paymentMethod !== filters.paymentMethod) {
          return false;
        }

        if (filters.dateRange !== 'all') {
          const txDate = new Date(tx.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (filters.dateRange === 'today') {
            const txDay = new Date(txDate);
            txDay.setHours(0, 0, 0, 0);
            if (txDay.getTime() !== today.getTime()) return false;
          } else if (filters.dateRange === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (txDate < weekAgo) return false;
          } else if (filters.dateRange === 'month') {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            if (txDate < monthAgo) return false;
          } else if (filters.dateRange === 'year') {
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            if (txDate < yearAgo) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'date-desc') {
          return new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        } else if (filters.sortBy === 'date-asc') {
          return new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${a.time || '00:00'}`).getTime();
        } else if (filters.sortBy === 'amount-desc') {
          return b.amount - a.amount;
        } else if (filters.sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  },

  // Export Data JSON Snapshot
  exportDataJSON(): string {
    const transactions = this.getTransactions();
    const categories = this.getCategories();
    const snapshot: FinanceDataPayload = {
      appName: 'Finance Flow • Personal Finance Suite',
      version: '2.0.0',
      lastSaved: new Date().toISOString(),
      transactions,
      categories,
      security: {
        passwordHash: localStorage.getItem('antigravity_finance_password_hash'),
        passwordHint: localStorage.getItem('antigravity_finance_password_hint'),
        hasPasswordSet: Boolean(localStorage.getItem('antigravity_finance_password_hash'))
      }
    };
    return JSON.stringify(snapshot, null, 2);
  },

  // Import Data JSON Snapshot
  importDataJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      return this.importDataPayload(parsed);
    } catch (e) {
      console.error('[Backend StorageService] Failed to import JSON backup data:', e);
      return false;
    }
  },

  importDataPayload(payload: any): boolean {
    try {
      if (payload && Array.isArray(payload.transactions) && Array.isArray(payload.categories)) {
        this.saveTransactions(payload.transactions);
        this.saveCategories(payload.categories);
        if (payload.security?.passwordHash) {
          localStorage.setItem('antigravity_finance_password_hash', payload.security.passwordHash);
        }
        if (payload.security?.passwordHint) {
          localStorage.setItem('antigravity_finance_password_hint', payload.security.passwordHint);
        }
        this.triggerDebouncedBackendSync();
        return true;
      }
      return false;
    } catch (e) {
      console.error('[Backend StorageService] Failed to import payload:', e);
      return false;
    }
  }
};
