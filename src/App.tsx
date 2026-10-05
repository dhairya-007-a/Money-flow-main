import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { useFinance } from './context/useFinance';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { CategoryGraphs } from './components/CategoryGraphs';
import { TransactionHistory } from './components/TransactionHistory';
import { ExpenseForm } from './components/ExpenseForm';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { LockScreen } from './components/LockScreen';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { DateHeatmap } from './components/DateHeatmap';
import { CategoryBreakdownView } from './components/CategoryBreakdownView';
import { ToastContainer } from './components/ToastContainer';
import type { Transaction } from './types/finance';
import { ShieldCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    isAddModalOpen, 
    setIsAddModalOpen,
    isLocked,
    toasts,
    removeToast
  } = useFinance();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <div className="min-h-screen bg-[#080D0B] text-[#F0F5F1] flex flex-col justify-between selection:bg-[#52B788] selection:text-[#080D0B] pb-12 relative overflow-hidden">
      
      {/* Master Spatial Ambient Environment with Medium Glass Glows */}
      <div className="spatial-bg-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-screen pointer-events-none filter brightness-75 contrast-120"
        >
          <source src="./bg-video.mp4" type="video/mp4" />
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="spatial-orb spatial-orb-1"></div>
        <div className="spatial-orb spatial-orb-2"></div>
        <div className="spatial-orb spatial-orb-3"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080D0B]/60 via-transparent to-[#080D0B]/95 pointer-events-none"></div>
      </div>

      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="animate-fadeIn space-y-8">
              <StatCards />
              <DateHeatmap />
              <CategoryGraphs />
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="animate-fadeIn space-y-8">
              <TransactionHistory onEdit={handleEditTransaction} />
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="animate-fadeIn space-y-8">
              <CategoryBreakdownView />
              <CategoryGraphs />
              <DateHeatmap />
            </div>
          )}

        </main>
      </div>

      {/* Modals & Portals */}
      <ExpenseForm 
        isOpen={isAddModalOpen} 
        onClose={handleCloseModal} 
        editTransaction={editingTransaction} 
      />

      <CategoryManagerModal />

      <ChangePasswordModal />

      {/* Sleek Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-[#A0B0A5] font-semibold py-4 border-t border-white/10 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-[#74C69D]" />
          <span>Personal Finance Spendar • Personal Spending & Budget Analytics</span>
        </div>
        <p className="text-[11px] text-[#6C7D73]">
          Official 6-Color Palette: Celadon (#B7E4C7) • Soft Mint (#95D5B2) • Mint Accent (#74C69D) • Action Green (#52B788) • Sea Green (#40916C) • Dark Emerald (#2D6A4F)
        </p>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}

export default App;
