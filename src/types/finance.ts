export type PaymentMethod = 'cash' | 'online';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  imageUrl?: string;
  color: string;
  bgGradient?: string;
  isCustom?: boolean;
  budgetLimit?: number;
}

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;     // Where
  description: string;  // Why
  date: string;         // YYYY-MM-DD
  time: string;         // HH:mm
  categoryId: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface FilterOptions {
  searchQuery: string;
  categoryId: string;
  paymentMethod: 'all' | 'cash' | 'online';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface FinanceSummary {
  totalSpent: number;
  cashTotal: number;
  onlineTotal: number;
  transactionCount: number;
  cashPercentage: number;
  onlinePercentage: number;
}

export type StorageSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface BackendStatus {
  isElectron: boolean;
  storageType: 'file' | 'local_storage';
  dbFilePath?: string;
  backupsDir?: string;
  sizeBytes?: number;
  lastSaved?: string | null;
  backupCount?: number;
  platform?: string;
  version?: string;
  error?: string;
}

export interface FinanceDataPayload {
  version: string;
  appName: string;
  lastSaved: string;
  transactions: Transaction[];
  categories: Category[];
  security?: {
    passwordHash: string | null;
    passwordHint: string | null;
    hasPasswordSet: boolean;
  };
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}

// Global declaration for window.financeBackend bridge
declare global {
  interface Window {
    financeBackend?: {
      isElectron: boolean;
      getStatus: () => Promise<BackendStatus>;
      loadAll: () => Promise<FinanceDataPayload | null>;
      saveAll: (data: FinanceDataPayload) => Promise<{ success: boolean; lastSaved?: string; sizeBytes?: number; error?: string }>;
      createBackup: (note?: string) => Promise<{ success: boolean; fileName?: string; filePath?: string; error?: string }>;
      openDataFolder: () => Promise<{ success: boolean; error?: string }>;
      exportFile: (options: { defaultFileName: string; content: string; filterName?: string; extension?: string }) => Promise<{ success: boolean; canceled?: boolean; filePath?: string; error?: string }>;
      importFile: () => Promise<{ success: boolean; canceled?: boolean; data?: FinanceDataPayload; filePath?: string; error?: string }>;
      showNotification: (options: { title: string; body: string }) => Promise<{ success: boolean }>;
    };
  }
}
