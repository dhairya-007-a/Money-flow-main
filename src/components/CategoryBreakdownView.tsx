import React, { useState } from 'react';
import { useFinance } from '../context/useFinance';
import { CategoryIcon } from './CategoryIcon';
import { 
  Plus, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Save, 
  X, 
  Filter, 
  ArrowRight
} from 'lucide-react';

export const CategoryBreakdownView: React.FC = () => {
  const { 
    categoryBreakdown, 
    currency, 
    updateCategory, 
    setIsCategoryModalOpen, 
    setFilters, 
    setActiveTab 
  } = useFinance();

  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [tempBudgetInput, setTempBudgetInput] = useState<string>('');

  const handleStartEditBudget = (catId: string, currentLimit?: number) => {
    setEditingBudgetId(catId);
    setTempBudgetInput(currentLimit ? currentLimit.toString() : '10000');
  };

  const handleSaveBudget = (catId: string) => {
    const val = parseFloat(tempBudgetInput);
    if (!isNaN(val) && val >= 0) {
      updateCategory(catId, { budgetLimit: val });
    }
    setEditingBudgetId(null);
  };

  const handleFilterByCategory = (catId: string) => {
    setFilters(prev => ({ ...prev, categoryId: catId }));
    setActiveTab('history');
  };

  return (
    <div className="glass-card rounded-3xl p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#F0F5F1] tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#74C69D]" />
            Category Portfolio & Budget Control
            <span className="px-3 py-1 text-xs font-bold bg-[#52B788]/20 text-[#B7E4C7] rounded-full border border-[#52B788]/30">
              {categoryBreakdown.length} Categories
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-[#A0B0A5] font-semibold mt-1">
            Real-time spending allocation, budget utilization, and category insights
          </p>
        </div>

        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="px-4 py-2.5 btn-primary-emerald text-xs sm:text-sm flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryBreakdown.map((item) => {
          const isEditingThis = editingBudgetId === item.category.id;
          const budgetLimit = item.category.budgetLimit || 10000;
          const utilization = Math.min(Math.round((item.amount / budgetLimit) * 100), 999);
          const isOver = item.amount > budgetLimit;
          const avgPerTx = item.count > 0 ? Math.round(item.amount / item.count) : 0;

          return (
            <div
              key={item.category.id}
              className="p-5 bg-[#0D1511]/80 border border-white/10 hover:border-[#74C69D]/40 rounded-2xl space-y-4 transition duration-200 shadow-sm relative group overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Category Header & Icon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#080D0B] font-black border border-white/20 shadow-md flex-shrink-0"
                      style={{ backgroundColor: item.category.color }}
                    >
                      <CategoryIcon
                        name={item.category.iconName}
                        imageUrl={item.category.imageUrl}
                        className="w-5.5 h-5.5 text-[#080D0B]"
                      />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#F0F5F1] flex items-center gap-2">
                        {item.category.name}
                        {item.category.isCustom && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-[#52B788]/20 text-[#B7E4C7] rounded-full border border-[#52B788]/30">
                            Custom
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-[#A0B0A5] font-medium">
                        {item.count} {item.count === 1 ? 'transaction' : 'transactions'} logged
                      </p>
                    </div>
                  </div>

                  {/* Filter Quick Action */}
                  <button
                    onClick={() => handleFilterByCategory(item.category.id)}
                    className="p-2 bg-white/5 hover:bg-white/15 text-[#A0B0A5] hover:text-[#F0F5F1] rounded-xl transition border border-white/10"
                    title={`View ${item.category.name} history`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Spend Metrics */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-[#F0F5F1]">
                      {currency}{item.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-[#A0B0A5] ml-2">
                      ({item.percentage}% share)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#A0B0A5] block">Avg / Tx</span>
                    <span className="text-sm font-bold text-[#74C69D]">
                      {currency}{avgPerTx.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Budget Bar & Utilization */}
                <div className="mt-4 space-y-1.5 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#A0B0A5] flex items-center gap-1">
                      Budget Limit:
                      {isEditingThis ? (
                        <div className="flex items-center gap-1 ml-1">
                          <input
                            type="number"
                            value={tempBudgetInput}
                            onChange={(e) => setTempBudgetInput(e.target.value)}
                            className="w-20 px-2 py-0.5 bg-[#080D0B] border border-[#52B788] rounded text-xs text-[#F0F5F1] font-bold focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveBudget(item.category.id)}
                            className="p-1 bg-[#52B788] text-[#080D0B] rounded"
                            title="Save Limit"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingBudgetId(null)}
                            className="p-1 bg-white/10 text-[#A0B0A5] rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#F0F5F1] font-bold ml-1 flex items-center gap-1">
                          {currency}{budgetLimit.toLocaleString('en-IN')}
                          <button
                            onClick={() => handleStartEditBudget(item.category.id, item.category.budgetLimit)}
                            className="text-[#A0B0A5] hover:text-[#74C69D] ml-0.5"
                            title="Edit Budget Limit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </span>

                    <span className={`flex items-center gap-1 text-xs font-bold ${isOver ? 'text-[#EF4444]' : 'text-[#52B788]'}`}>
                      {isOver ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" /> Over Budget ({utilization}%)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> {utilization}% Used
                        </>
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]'
                          : utilization > 80
                          ? 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444]'
                          : 'bg-gradient-to-r from-[#40916C] via-[#52B788] to-[#74C69D]'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#A0B0A5]">
                  {isOver ? `Exceeded by ${currency}${(item.amount - budgetLimit).toLocaleString('en-IN')}` : `Remaining: ${currency}${(budgetLimit - item.amount).toLocaleString('en-IN')}`}
                </span>
                <button
                  onClick={() => handleFilterByCategory(item.category.id)}
                  className="text-xs font-bold text-[#74C69D] hover:text-[#F0F5F1] flex items-center gap-1 transition"
                >
                  <span>View Log</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
