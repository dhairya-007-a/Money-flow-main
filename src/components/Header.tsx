import React from 'react';
import { useFinance } from '../context/useFinance';
import { StorageService } from '../services/storageService';
import { 
  Plus, 
  Layers, 
  History, 
  PieChart, 
  Search, 
  Lock, 
  KeyRound, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsAddModalOpen, 
    currency, 
    filters, 
    setFilters, 
    lockApp, 
    setIsChangePasswordModalOpen, 
    hasPasswordSet,
    saveStatus,
    lastSavedTime
  } = useFinance();

  const isElectron = StorageService.isElectron();

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'categories', label: 'Category', icon: PieChart },
    { id: 'history', label: 'History', icon: History },
  ];

  const formatLastSaved = (isoStr: string | null) => {
    if (!isoStr) return 'Active';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Active';
    }
  };

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-8 py-3 transition-all backdrop-blur-2xl bg-[#080D0B]/85 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#52B788] via-[#74C69D] to-[#95D5B2] rounded-2xl blur opacity-40 group-hover:opacity-85 transition duration-300"></div>
              <img 
                src="./logo.png" 
                alt="Personal Finance Spendar Logo" 
                className="relative w-10 h-10 sm:w-11 sm:h-11 object-contain flex-shrink-0 drop-shadow-md" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg sm:text-xl tracking-wide bg-gradient-to-r from-[#F0F5F1] via-[#B7E4C7] to-[#74C69D] bg-clip-text text-transparent">
                  FinanceCalc Public
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#52B788]/20 text-[#B7E4C7] rounded-full border border-[#52B788]/40 shadow-xs">
                  {currency} INR
                </span>
              </div>
              <p className="text-[11px] text-[#A0B0A5] font-medium hidden sm:block">
                Personal Spending & Budget Analytics
              </p>
            </div>
          </div>

          {/* Mobile Right Quick Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {hasPasswordSet && (
              <button
                onClick={lockApp}
                title="Lock App"
                className="p-2 liquid-glass-pill text-[#A0B0A5] hover:text-white transition border border-white/10"
              >
                <Lock className="w-4 h-4 text-[#74C69D]" />
              </button>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 btn-primary-emerald text-xs flex items-center gap-1.5 shadow-md font-display font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Spend</span>
            </button>
          </div>
        </div>

        {/* Center Navigation Tabs: Perfectly Balanced 3-Button Grid (Exact Same Size for Overview, Category, History) */}
        <nav className="p-1 liquid-glass-pill rounded-full grid grid-cols-3 gap-1 shadow-lg w-full sm:w-[380px] border border-white/10 flex-shrink-0">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs sm:text-sm font-display font-bold tracking-wider transition-all duration-200 w-full text-center ${
                  isActive
                    ? 'bg-[#40916C]/50 text-[#F0F5F1] shadow-md border border-[#95D5B2]/60 scale-[1.02]'
                    : 'text-[#A0B0A5] hover:text-[#F0F5F1] hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#74C69D]' : 'text-[#6C7D73]'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Live Backend Status + Password + Add Spend */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-shrink-0">
          
          {/* Quick Search */}
          <div className="relative hidden xl:block w-40">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#74C69D]" />
            <input
              type="text"
              placeholder="Search records..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-8 pr-3 py-1.5 liquid-glass-input rounded-full text-xs font-semibold text-[#F0F5F1] placeholder:text-[#6C7D73] focus:outline-none transition"
            />
          </div>

          {/* Live Backend & Data Saving Indicator Pill */}
          <div
            title={`Backend Persistence Engine (${isElectron ? 'Desktop Disk File' : 'Local Storage'})`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 liquid-glass-pill rounded-full text-[11px] font-bold border border-white/15"
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3 h-3 text-[#F59E0B] animate-spin" />
                <span className="text-[#F59E0B]">Saving...</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-3 h-3 text-[#EF4444]" />
                <span className="text-[#EF4444]">Sync Error</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#52B788] shadow-xs shadow-[#52B788] animate-pulseSave" />
                <span className="text-[#B7E4C7]">
                  {isElectron ? 'Saved to Disk' : 'Saved Locally'}
                </span>
                {lastSavedTime && (
                  <span className="text-[10px] text-[#A0B0A5] font-normal hidden 2xl:inline">
                    ({formatLastSaved(lastSavedTime)})
                  </span>
                )}
              </>
            )}
          </div>

          {/* Security / Password Button */}
          {hasPasswordSet ? (
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              title="Security Settings"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 btn-secondary-emerald text-xs font-bold"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#74C69D]" />
              <span className="hidden md:inline">Security</span>
            </button>
          ) : (
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              title="Set Master Password"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 btn-secondary-emerald text-xs text-[#95D5B2] font-bold"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#74C69D]" />
              <span>Set Lock</span>
            </button>
          )}

          {hasPasswordSet && (
            <button
              onClick={lockApp}
              title="Lock App"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 btn-secondary-emerald text-xs font-bold"
            >
              <Lock className="w-3.5 h-3.5 text-[#74C69D]" />
              <span className="hidden md:inline">Lock</span>
            </button>
          )}

          {/* Primary Add Spend Button */}
          <div className="hidden md:block">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4.5 py-1.5 btn-primary-emerald text-xs font-display font-extrabold shadow-lg active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Spend</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
