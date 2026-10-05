import React from 'react';
import { useFinance } from '../context/useFinance';
import { Wallet, Smartphone, Banknote, ArrowUpRight, TrendingUp, PieChart, Sparkles, Layers } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

export const StatCards: React.FC = () => {
  const { summary, categoryBreakdown, currency, setActiveTab } = useFinance();

  const formattedTotal = `${currency}${summary.totalSpent.toLocaleString('en-IN')}`;
  const formattedCash = `${currency}${summary.cashTotal.toLocaleString('en-IN')}`;
  const formattedOnline = `${currency}${summary.onlineTotal.toLocaleString('en-IN')}`;

  const topCategory = categoryBreakdown.length > 0 && categoryBreakdown[0].amount > 0 
    ? categoryBreakdown[0] 
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-8">
      
      {/* 1. Primary Executive KPI Card */}
      <div className="lg:col-span-4 glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group border border-[#b7e4c7]/30">
        
        <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-[#b7e4c7]/25 blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-xs sm:text-sm font-black uppercase tracking-wider text-[#b7e4c7] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#74c69d]" /> Net Outflow Performance
            </span>
            <span className="px-3 py-1 text-xs font-black bg-[#b7e4c7]/20 text-[#b7e4c7] rounded-full border border-[#b7e4c7]/40 shadow-xs flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#52b788]" /> Live Computed
            </span>
          </div>

          <div className="mb-4">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#f0f5f1] tracking-tight mb-1 truncate">
              {formattedTotal}
            </div>
            <p className="font-display text-xs sm:text-sm font-bold text-[#95d5b2]">Total Calculated Expenses</p>
          </div>

          {/* Light-Green Glowing Palette Indicators */}
          <div className="flex items-center gap-2.5 my-4">
            <span className="w-3.5 h-3.5 rounded-full bg-[#b7e4c7] shadow-[#b7e4c7]/80 shadow-md ring-2 ring-[#b7e4c7]/30" title="Celadon (#b7e4c7)"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#95d5b2] shadow-[#95d5b2]/70 shadow-md" title="Celadon 2 (#95d5b2)"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#74c69d] shadow-[#74c69d]/60 shadow-md" title="Mint Leaf (#74c69d)"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#52b788] shadow-[#52b788]/50 shadow-md" title="Mint Leaf 2 (#52b788)"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#40916c] shadow-[#40916c]/40 shadow-md" title="Sea Green (#40916c)"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#2d6a4f] shadow-[#2d6a4f]/30 shadow-md" title="Dark Emerald (#2d6a4f)"></span>
          </div>
        </div>

        {/* Sub-metrics Footer */}
        <div className="pt-4 border-t border-[#b7e4c7]/20 flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#f0f5f1]">{summary.transactionCount}</span>
            <p className="font-display text-xs font-bold text-[#95d5b2]">Transactions</p>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-[#b7e4c7]">
              {topCategory ? `${topCategory.percentage}%` : '0%'}
            </span>
            <p className="font-display text-xs font-bold text-[#95d5b2] truncate max-w-[140px]">
              Top: {topCategory ? topCategory.category.name : 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Middle Card: Category Portfolio (Fixed Clean Layout) */}
      <div className="lg:col-span-4 bg-liquid-olive rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group border border-[#b7e4c7]/30">
        
        <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-[#95d5b2]/20 blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-xs sm:text-sm font-black uppercase tracking-wider text-[#b7e4c7] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#74c69d]" /> Category Portfolio
            </span>
            <button
              onClick={() => setActiveTab('categories')}
              className="w-8.5 h-8.5 rounded-full bg-[#b7e4c7]/20 hover:bg-[#b7e4c7]/30 flex items-center justify-center transition text-[#b7e4c7] border border-[#b7e4c7]/40 shadow-xs"
              title="Open Categories"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#f0f5f1] tracking-tight truncate">
                {categoryBreakdown.length}
              </div>
              <p className="font-display text-xs text-[#95d5b2] font-bold">Active Categories</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#b7e4c7] tracking-tight truncate">
                {topCategory ? `${currency}${topCategory.amount.toLocaleString('en-IN')}` : `${currency}0`}
              </div>
              <p className="font-display text-xs text-[#95d5b2] font-bold">Top Category Spend</p>
            </div>
          </div>

          {/* Clean Spacious Category List Layout */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#0d1e16]/80 border border-[#b7e4c7]/25 shadow-inner">
            {categoryBreakdown.slice(0, 3).map((item) => (
              <div key={item.category.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#b7e4c7]/30 transition">
                <div className="flex items-center gap-2.5 truncate">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#080D0B] text-xs font-black shadow-xs flex-shrink-0"
                    style={{ backgroundColor: item.category.color }}
                  >
                    <CategoryIcon name={item.category.iconName} imageUrl={item.category.imageUrl} className="w-4 h-4 text-[#080D0B]" />
                  </div>
                  <span className="font-black text-[#f0f5f1] truncate text-xs sm:text-sm">{item.category.name}</span>
                </div>
                <span className="font-black text-[#b7e4c7] ml-2 flex-shrink-0 text-xs sm:text-sm">
                  {currency}{item.amount.toLocaleString('en-IN')} <span className="text-[#95d5b2] text-[11px]">({item.percentage}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#b7e4c7]/20">
          <button
            onClick={() => setActiveTab('categories')}
            className="w-full py-2.5 btn-primary-emerald text-[#080D0B] text-xs font-display font-black flex items-center justify-center gap-2 transition shadow-lg"
          >
            <PieChart className="w-4 h-4 text-[#080D0B]" /> View Category Manager
          </button>
        </div>
      </div>

      {/* 3. Right Stack: Cash & Digital Ratio Cards */}
      <div className="lg:col-span-4 grid grid-cols-2 gap-4">
        
        {/* Cash Spend Card */}
        <div className="bg-liquid-copper text-white rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden border border-[#95d5b2]/30">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xs font-black uppercase tracking-wider text-[#b7e4c7] flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-[#74c69d]" /> Cash Spend
              </span>
            </div>
            
            <div className="text-2xl sm:text-3xl font-black text-[#f0f5f1] tracking-tight mb-1 truncate">
              {summary.cashPercentage}%
            </div>
            
            <p className="font-display text-xs text-[#95d5b2] font-bold truncate">
              {formattedCash} Total
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-[#f0f5f1]">
            <span className="font-display">Physical Cash</span>
            <span className="w-3 h-3 rounded-full bg-[#74c69d] shadow-sm shadow-[#74c69d]"></span>
          </div>
        </div>

        {/* Digital Spend Card */}
        <div className="bg-liquid-tea text-[#f0f5f1] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden border border-[#b7e4c7]/35">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xs font-black uppercase tracking-wider text-[#b7e4c7] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#52b788]" /> Digital Spend
              </span>
            </div>
            
            <div className="text-2xl sm:text-3xl font-black text-[#b7e4c7] tracking-tight mb-1 truncate">
              {summary.onlinePercentage}%
            </div>
            
            <p className="font-display text-xs text-[#95d5b2] font-bold truncate">
              {formattedOnline} Total
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-[#f0f5f1]">
            <span className="font-display">UPI / Digital</span>
            <Sparkles className="w-4 h-4 text-[#b7e4c7]" />
          </div>
        </div>

        {/* Full-width Activity Banner */}
        <div className="col-span-2 glass-card rounded-3xl p-4 flex items-center justify-between border border-[#b7e4c7]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#b7e4c7]/20 text-[#b7e4c7] border border-[#b7e4c7]/40 flex items-center justify-center font-black flex-shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="font-display text-xs sm:text-sm font-black text-[#f0f5f1]">Payment Split Analysis</div>
              <p className="text-xs text-[#95d5b2] font-bold truncate">
                {summary.onlinePercentage >= summary.cashPercentage ? 'UPI & Digital channels lead' : 'Cash transactions lead'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 font-black text-sm text-[#f0f5f1] flex-shrink-0 ml-2">
            <span className="text-[#b7e4c7]">{summary.onlinePercentage}%</span>
            <span className="text-[#74c69d]">/</span>
            <span className="text-[#95d5b2]">{summary.cashPercentage}%</span>
          </div>
        </div>

      </div>

    </div>
  );
};
