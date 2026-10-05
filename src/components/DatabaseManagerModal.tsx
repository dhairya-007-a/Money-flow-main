import React, { useState, useEffect, useCallback } from 'react';
import { useFinance } from '../context/useFinance';
import { StorageService } from '../services/storageService';
import type { BackendStatus } from '../types/finance';
import { 
  Database, 
  X, 
  HardDrive, 
  FolderOpen, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  Archive, 
  Trash2
} from 'lucide-react';

interface ContentProps {
  onClose: () => void;
}

const DatabaseManagerModalContent: React.FC<ContentProps> = ({ onClose }) => {
  const { 
    transactions, 
    categories, 
    addToast,
    exportData,
    importData,
    resetToSampleData,
    clearAllData,
    lastSavedTime
  } = useFinance();

  const [diagnostics, setDiagnostics] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [backupNote, setBackupNote] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const refreshDiagnostics = useCallback(async () => {
    const info = await StorageService.getBackendDiagnostics();
    setDiagnostics(info);
  }, []);

  useEffect(() => {
    let active = true;
    StorageService.getBackendDiagnostics().then((info) => {
      if (active) setDiagnostics(info);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleCreateBackup = async () => {
    setLoading(true);
    const res = await StorageService.createSnapshotBackup(backupNote);
    setLoading(false);
    if (res.success) {
      addToast(`Backup created: ${res.fileName || 'Snapshot saved'}`, 'success');
      setBackupNote('');
      refreshDiagnostics();
    } else {
      addToast(res.error || 'Failed to create backup', 'error');
    }
  };

  const handleOpenFolder = async () => {
    const res = await StorageService.openStorageFolder();
    if (!res.success) {
      addToast(res.error || 'Could not open folder', 'warning');
    }
  };

  const handleExportJSON = async () => {
    const jsonStr = exportData();
    const fileName = `spendar_financial_backup_${new Date().toISOString().split('T')[0]}.json`;
    const success = await StorageService.exportWithNativeDialog(
      fileName,
      jsonStr,
      'JSON Backup',
      'json'
    );
    if (success) {
      addToast('Database exported successfully', 'success');
    }
  };

  const handleImportFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            const success = importData(content);
            if (success) {
              addToast('Database imported & restored successfully', 'success');
              refreshDiagnostics();
            } else {
              addToast('Failed to parse financial database file', 'error');
            }
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formattedSize = diagnostics?.sizeBytes !== undefined
    ? `${(diagnostics.sizeBytes / 1024).toFixed(1)} KB`
    : 'Unknown';

  const isElectron = StorageService.isElectron();

  const formattedSavedTime = lastSavedTime
    ? new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Synced';

  return (
    <div className="glass-modal-container w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-scaleUp">
      
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#11241A] via-[#1A3828] to-[#11241A] text-[#F0F5F1] flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#52B788]/20 flex items-center justify-center text-[#52B788] border border-[#52B788]/30 shadow-md">
            <Database className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg sm:text-xl tracking-tight text-[#F0F5F1]">
                Backend & Database Console
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#52B788]/20 text-[#B7E4C7] rounded-full border border-[#52B788]/30">
                {isElectron ? 'Desktop IPC File Storage' : 'Web Engine'}
              </span>
            </div>
            <p className="text-xs text-[#95D5B2] font-semibold mt-0.5">
              Atomic local persistence, snapshots, auto-sync and data integrity
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8.5 h-8.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F0F5F1] transition border border-white/15"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
        
        {/* Status Diagnostics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#080D0B]/60 border border-white/10 rounded-2xl">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0B0A5] block">Persistence</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#74C69D] flex items-center gap-1 mt-1">
              <HardDrive className="w-3.5 h-3.5" /> {isElectron ? 'Local File' : 'LocalStorage'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0B0A5] block">Database Size</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#F0F5F1] mt-1 block">
              {formattedSize}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0B0A5] block">Total Records</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#F0F5F1] mt-1 block">
              {transactions.length} Txs • {categories.length} Cats
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0B0A5] block">Last Saved</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#52B788] flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {formattedSavedTime}
            </span>
          </div>
        </div>

        {/* Disk Location Display (Electron) */}
        {diagnostics?.dbFilePath && (
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#A0B0A5] uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-[#52B788]" /> Active Database File On Disk
              </span>
              <button
                onClick={handleOpenFolder}
                className="text-xs text-[#74C69D] hover:underline font-bold flex items-center gap-1"
              >
                <span>Open Folder</span>
              </button>
            </div>
            <p className="text-xs font-mono text-[#F0F5F1] break-all bg-black/40 p-2 rounded-xl border border-white/5">
              {diagnostics.dbFilePath}
            </p>
          </div>
        )}

        {/* Backup Snapshot Generator */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#95D5B2] flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-[#52B788]" /> Instant Snapshot Backup
            </span>
            {diagnostics?.backupCount !== undefined && (
              <span className="text-xs font-bold text-[#A0B0A5]">
                {diagnostics.backupCount} backups stored
              </span>
            )}
          </div>
          
          <p className="text-xs text-[#A0B0A5]">
            Create an immutable snapshot of your entire database with an optional tag.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Optional backup label (e.g. EndOfMonth, PreAudit)"
              value={backupNote}
              onChange={(e) => setBackupNote(e.target.value)}
              className="flex-1 px-3 py-2 liquid-glass-input rounded-xl text-xs font-semibold text-[#F0F5F1] focus:outline-none"
            />
            <button
              onClick={handleCreateBackup}
              disabled={loading}
              className="px-4 py-2 btn-primary-emerald text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Backup Now</span>
            </button>
          </div>
        </div>

        {/* Export & Import Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportJSON}
            className="p-3.5 btn-secondary-emerald text-xs font-bold flex items-center justify-center gap-2 rounded-2xl"
          >
            <Download className="w-4 h-4 text-[#74C69D]" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={handleImportFile}
            className="p-3.5 btn-secondary-emerald text-xs font-bold flex items-center justify-center gap-2 rounded-2xl"
          >
            <Upload className="w-4 h-4 text-[#74C69D]" />
            <span>Import JSON Backup</span>
          </button>
        </div>

        {/* Reset & Wipe Controls */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => {
              resetToSampleData();
              addToast('Reset to default clean state', 'info');
            }}
            className="px-3 py-1.5 text-xs text-[#A0B0A5] hover:text-[#F0F5F1] hover:bg-white/10 rounded-xl transition font-semibold"
          >
            Reset Initial Categories
          </button>

          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl transition font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe Transactions</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#EF4444]/20 p-1.5 rounded-xl border border-[#EF4444]/30">
              <span className="text-[11px] text-[#EF4444] font-bold">Confirm wipe?</span>
              <button
                onClick={() => {
                  clearAllData();
                  setShowClearConfirm(false);
                  addToast('All transactions cleared', 'warning');
                  refreshDiagnostics();
                }}
                className="px-2.5 py-1 bg-[#EF4444] text-white rounded-lg text-[10px] font-bold"
              >
                Yes, Clear All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 text-[#A0B0A5] text-[10px]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export const DatabaseManagerModal: React.FC = () => {
  const { isDatabaseModalOpen, setIsDatabaseModalOpen } = useFinance();

  if (!isDatabaseModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D0B]/85 backdrop-blur-md animate-fadeIn">
      <DatabaseManagerModalContent onClose={() => setIsDatabaseModalOpen(false)} />
    </div>
  );
};
