import React, { useState } from 'react';
import { useFinance } from '../context/useFinance';
import { StorageService } from '../services/storageService';
import type { Transaction } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { generatePDFReport } from '../utils/pdfExport';
import { 
  Search, 
  Calendar, 
  Download, 
  Edit2, 
  Trash2, 
  Banknote, 
  Smartphone, 
  Clock, 
  Plus, 
  FileText,
  ArrowUpDown
} from 'lucide-react';

interface TransactionHistoryProps {
  onEdit: (tx: Transaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onEdit }) => {
  const { 
    filteredTransactions, 
    categories, 
    currency, 
    filters, 
    setFilters, 
    deleteTransaction,
    setIsAddModalOpen,
    summary,
    transactions,
    addToast
  } = useFinance();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const categoryMap = React.useMemo(() => {
    const map = new Map();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  // Export CSV
  const handleExportCSV = async () => {
    if (filteredTransactions.length === 0) {
      addToast('No transactions to export', 'warning');
      return;
    }

    const headers = ['ID', 'Date', 'Time', 'Merchant/Where', 'Reason/Why', 'Category', 'Payment Mode', `Amount (${currency})`].join(',');
    const rows = filteredTransactions.map(tx => {
      const cat = categoryMap.get(tx.categoryId);
      return [
        `"${tx.id}"`,
        `"${tx.date}"`,
        `"${tx.time || ''}"`,
        `"${tx.merchant.replace(/"/g, '""')}"`,
        `"${tx.description.replace(/"/g, '""')}"`,
        `"${cat ? cat.name : tx.categoryId}"`,
        `"${tx.paymentMethod}"`,
        tx.amount
      ].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const fileName = `spendar_spending_history_${new Date().toISOString().split('T')[0]}.csv`;

    const success = await StorageService.exportWithNativeDialog(
      fileName,
      csvContent,
      'CSV File',
      'csv'
    );

    if (success) {
      addToast('CSV spreadsheet exported successfully', 'success');
    }
  };

  // Export PDF Report
  const handleExportPDF = () => {
    if (transactions.length === 0) {
      addToast('No transaction data to generate PDF', 'warning');
      return;
    }

    try {
      generatePDFReport({
        transactions,
        categories,
        summary,
        currency
      });
      addToast('PDF Financial Report generated', 'success');
    } catch {
      addToast('Failed to generate PDF report', 'error');
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 space-y-6">
      
      {/* Header & Action Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#F0F5F1] tracking-tight flex items-center gap-2.5">
            Spending Logs & History
            <span className="px-3 py-1 text-xs font-bold bg-[#52B788]/20 text-[#B7E4C7] rounded-full border border-[#52B788]/30">
              {filteredTransactions.length} items
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-[#A0B0A5] font-semibold mt-0.5">
            Filter by merchant, category, date range or payment mode in INR (₹)
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Download PDF button */}
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 btn-secondary-emerald text-xs sm:text-sm flex items-center gap-2"
            title="Download PDF Report"
          >
            <FileText className="w-4 h-4 text-[#74C69D]" />
            <span>Download PDF</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 btn-secondary-emerald text-xs sm:text-sm flex items-center gap-2"
            title="Export History to CSV"
          >
            <Download className="w-4 h-4 text-[#74C69D]" />
            <span>CSV</span>
          </button>

          {/* Log Spend Action */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 btn-primary-emerald text-xs sm:text-sm flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Log Spend</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-4 bg-[#080D0B]/60 border border-white/10 rounded-2xl">
        
        {/* Search Bar */}
        <div className="lg:col-span-3 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74C69D]" />
          <input
            type="text"
            placeholder="Search vendor, notes, amount..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-9 pr-3.5 py-2.5 liquid-glass-input rounded-xl text-xs sm:text-sm font-semibold text-[#F0F5F1] focus:outline-none placeholder:text-[#6C7D73]"
          />
        </div>

        {/* Category Dropdown */}
        <div className="lg:col-span-3">
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
            className="w-full px-3.5 py-2.5 liquid-glass-input rounded-xl text-xs sm:text-sm font-bold text-[#A0B0A5] focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#080D0B] text-[#F0F5F1]">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#080D0B] text-[#F0F5F1]">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Filter */}
        <div className="lg:col-span-2">
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
            className="w-full px-3.5 py-2.5 liquid-glass-input rounded-xl text-xs sm:text-sm font-bold text-[#A0B0A5] focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#080D0B] text-[#F0F5F1]">Cash & Digital</option>
            <option value="online" className="bg-[#080D0B] text-[#F0F5F1]">Digital Only</option>
            <option value="cash" className="bg-[#080D0B] text-[#F0F5F1]">Cash Only</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="lg:col-span-2">
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
            className="w-full px-3.5 py-2.5 liquid-glass-input rounded-xl text-xs sm:text-sm font-bold text-[#A0B0A5] focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#080D0B] text-[#F0F5F1]">All Time</option>
            <option value="today" className="bg-[#080D0B] text-[#F0F5F1]">Today</option>
            <option value="week" className="bg-[#080D0B] text-[#F0F5F1]">Past 7 Days</option>
            <option value="month" className="bg-[#080D0B] text-[#F0F5F1]">Past 30 Days</option>
            <option value="year" className="bg-[#080D0B] text-[#F0F5F1]">Past Year</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="lg:col-span-2">
          <div className="relative">
            <ArrowUpDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#74C69D] pointer-events-none" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full px-3 py-2.5 liquid-glass-input rounded-xl text-xs sm:text-sm font-bold text-[#A0B0A5] focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="date-desc" className="bg-[#080D0B] text-[#F0F5F1]">Newest First</option>
              <option value="date-asc" className="bg-[#080D0B] text-[#F0F5F1]">Oldest First</option>
              <option value="amount-desc" className="bg-[#080D0B] text-[#F0F5F1]">Highest Amount</option>
              <option value="amount-asc" className="bg-[#080D0B] text-[#F0F5F1]">Lowest Amount</option>
            </select>
          </div>
        </div>

      </div>

      {/* Transaction List Cards */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => {
            const cat = categoryMap.get(tx.categoryId);
            const formattedDate = new Date(tx.date).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={tx.id}
                className="p-4 sm:p-5 glass-card glass-card-hover rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200"
              >
                {/* Left: Category Icon & Vendor Info */}
                <div className="flex items-start sm:items-center gap-4">
                  
                  {/* Category Badge Icon */}
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#080D0B] font-black flex-shrink-0 shadow-md border border-white/20"
                    style={{ backgroundColor: cat ? cat.color : '#52B788' }}
                  >
                    <CategoryIcon name={cat ? cat.iconName : 'Sparkles'} imageUrl={cat?.imageUrl} className="w-5.5 h-5.5 text-[#080D0B]" />
                  </div>

                  {/* Merchant & Description */}
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-base sm:text-lg text-[#F0F5F1]">
                        {tx.merchant}
                      </span>
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold text-[#080D0B] shadow-2xs border border-white/20"
                        style={{ backgroundColor: cat ? cat.color : '#52B788' }}
                      >
                        {cat ? cat.name : 'Category'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#A0B0A5] font-medium mt-1">
                      {tx.description || 'No description added'}
                    </p>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-3.5 text-xs text-[#A0B0A5] font-semibold mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-[#74C69D]" /> {formattedDate}
                      </span>
                      {tx.time && (
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#74C69D]" /> {tx.time}
                        </span>
                      )}
                      
                      {/* Cash vs Digital Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                        tx.paymentMethod === 'cash' 
                          ? 'bg-[#74C69D]/15 text-[#95D5B2] border-[#74C69D]/30' 
                          : 'bg-[#52B788]/20 text-[#B7E4C7] border-[#52B788]/30'
                      }`}>
                        {tx.paymentMethod === 'cash' ? <Banknote className="w-3 h-3" /> : <Smartphone className="w-3 h-3 text-[#52B788]" />}
                        {tx.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                  <div className="text-left sm:text-right">
                    <span className="text-xl sm:text-2xl font-extrabold text-[#F0F5F1] block tracking-tight">
                      -{currency}{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-2 text-[#A0B0A5] hover:text-[#F0F5F1] hover:bg-white/10 rounded-xl transition"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {confirmDeleteId === tx.id ? (
                      <div className="flex items-center gap-1 bg-[#EF4444]/20 p-1 rounded-xl border border-[#EF4444]/30 animate-scaleUp">
                        <button
                          onClick={() => {
                            deleteTransaction(tx.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1 bg-[#EF4444] text-white rounded-lg text-[10px] font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-[#A0B0A5] text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(tx.id)}
                        className="p-2 text-[#A0B0A5] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl transition"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#080D0B]/60 rounded-3xl border border-dashed border-white/15">
          <p className="text-[#A0B0A5] font-semibold text-xs mb-3">No transactions found matching active filters.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 btn-primary-emerald text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Spend Now
          </button>
        </div>
      )}

    </div>
  );
};
