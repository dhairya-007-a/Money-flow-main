import React, { useState } from 'react';
import { useFinance } from '../context/useFinance';
import { 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { PieChart, BarChart3, TrendingUp, Shirt, Car } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

export const CategoryGraphs: React.FC = () => {
  const { categoryBreakdown, dailyTrends, currency, summary } = useFinance();
  const [activeGraphTab, setActiveGraphTab] = useState<'all' | 'categories' | 'trends'>('all');

  const categoryChartData = categoryBreakdown
    .filter(item => item.amount > 0)
    .map(item => ({
      name: item.category.name,
      amount: item.amount,
      color: item.category.color,
      percentage: item.percentage,
      count: item.count,
      iconName: item.category.iconName
    }));

  const foodData = categoryBreakdown.find(c => c.category.id === 'food' || c.category.name.toLowerCase().includes('food'));
  const hereIPaidData = categoryBreakdown.find(c => c.category.id === 'here-i-paid' || c.category.name.toLowerCase().includes('paid'));
  const billsData = categoryBreakdown.find(c => c.category.id === 'bills' || c.category.name.toLowerCase().includes('bills'));
  const laundryData = categoryBreakdown.find(c => c.category.id === 'laundry' || c.category.name.toLowerCase().includes('laundry'));
  const travelData = categoryBreakdown.find(c => c.category.id === 'travel' || c.category.name.toLowerCase().includes('travel'));

  return (
    <div className="space-y-6 mb-8 min-w-0">
      
      {/* Header & Segmented Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F0F5F1] tracking-tight flex items-center gap-2.5">
            <PieChart className="w-6 h-6 text-[#74C69D]" />
            Financial Analytics & Category Visuals
          </h2>
          <p className="text-xs sm:text-sm text-[#A0B0A5] font-semibold mt-0.5">
            Interactive metrics for Food, Here I Paid, Bills, Laundry, Travel & custom categories
          </p>
        </div>

        {/* Tab Selector (Section 5) */}
        <div className="liquid-glass-pill p-1.5 rounded-full flex items-center text-xs sm:text-sm font-bold border border-white/10">
          <button
            onClick={() => setActiveGraphTab('all')}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
              activeGraphTab === 'all' 
                ? 'bg-[#40916C]/30 text-[#F0F5F1] border border-[#95D5B2]/40 shadow-sm' 
                : 'text-[#A0B0A5] hover:text-[#F0F5F1]'
            }`}
          >
            All Analytics
          </button>
          <button
            onClick={() => setActiveGraphTab('categories')}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
              activeGraphTab === 'categories' 
                ? 'bg-[#40916C]/30 text-[#F0F5F1] border border-[#95D5B2]/40 shadow-sm' 
                : 'text-[#A0B0A5] hover:text-[#F0F5F1]'
            }`}
          >
            Category Share
          </button>
          <button
            onClick={() => setActiveGraphTab('trends')}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
              activeGraphTab === 'trends' 
                ? 'bg-[#40916C]/30 text-[#F0F5F1] border border-[#95D5B2]/40 shadow-sm' 
                : 'text-[#A0B0A5] hover:text-[#F0F5F1]'
            }`}
          >
            Daily Trends
          </button>
        </div>
      </div>

      {/* Core Category Spotlight Cards (Section 1 6-Color Palette Integration) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        
        {/* 1. Food Spotlight (#52B788) */}
        <div className="glass-card rounded-2xl p-3.5 border border-[#52B788]/30 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#52B788]/20 text-[#52B788] border border-[#52B788]/30 flex items-center justify-center font-bold p-1 flex-shrink-0">
              <CategoryIcon name="food" imageUrl="/food.png" className="w-5.5 h-5.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#A0B0A5] truncate block">Food & Dining</span>
              <div className="text-base sm:text-lg font-bold text-[#F0F5F1] truncate">
                {currency}{foodData ? foodData.amount.toLocaleString('en-IN') : '0'}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 bg-[#52B788]/20 text-[#52B788] rounded-full border border-[#52B788]/30 flex-shrink-0 ml-1">
            {foodData ? `${foodData.percentage}%` : '0%'}
          </span>
        </div>

        {/* 2. Here I Paid Spotlight (#74C69D) */}
        <div className="glass-card rounded-2xl p-3.5 border border-[#74C69D]/30 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#74C69D]/20 text-[#74C69D] border border-[#74C69D]/30 flex items-center justify-center font-bold p-1 flex-shrink-0">
              <CategoryIcon name="here-i-paid" imageUrl="/dollars.png" className="w-5.5 h-5.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#A0B0A5] truncate block">Here I Paid</span>
              <div className="text-base sm:text-lg font-bold text-[#F0F5F1] truncate">
                {currency}{hereIPaidData ? hereIPaidData.amount.toLocaleString('en-IN') : '0'}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 bg-[#74C69D]/20 text-[#74C69D] rounded-full border border-[#74C69D]/30 flex-shrink-0 ml-1">
            {hereIPaidData ? `${hereIPaidData.percentage}%` : '0%'}
          </span>
        </div>

        {/* 3. Bills Spotlight (#40916C) */}
        <div className="glass-card rounded-2xl p-3.5 border border-[#40916C]/30 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#40916C]/20 text-[#74C69D] border border-[#40916C]/30 flex items-center justify-center font-bold p-1 flex-shrink-0">
              <CategoryIcon name="bills" imageUrl="/budget.png" className="w-5.5 h-5.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#A0B0A5] truncate block">Bills & Utility</span>
              <div className="text-base sm:text-lg font-bold text-[#F0F5F1] truncate">
                {currency}{billsData ? billsData.amount.toLocaleString('en-IN') : '0'}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 bg-[#40916C]/20 text-[#74C69D] rounded-full border border-[#40916C]/30 flex-shrink-0 ml-1">
            {billsData ? `${billsData.percentage}%` : '0%'}
          </span>
        </div>

        {/* 4. Laundry Spotlight (#B7E4C7) */}
        <div className="glass-card rounded-2xl p-3.5 border border-[#B7E4C7]/30 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#B7E4C7]/20 text-[#B7E4C7] border border-[#B7E4C7]/30 flex items-center justify-center font-bold flex-shrink-0">
              <Shirt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#A0B0A5] truncate block">Laundry</span>
              <div className="text-base sm:text-lg font-bold text-[#F0F5F1] truncate">
                {currency}{laundryData ? laundryData.amount.toLocaleString('en-IN') : '0'}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 bg-[#B7E4C7]/20 text-[#B7E4C7] rounded-full border border-[#B7E4C7]/30 flex-shrink-0 ml-1">
            {laundryData ? `${laundryData.percentage}%` : '0%'}
          </span>
        </div>

        {/* 5. Travel Spotlight (#2D6A4F) */}
        <div className="glass-card rounded-2xl p-3.5 border border-[#2D6A4F]/40 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/30 text-[#B7E4C7] border border-[#2D6A4F]/40 flex items-center justify-center font-bold flex-shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#A0B0A5] truncate block">Travel</span>
              <div className="text-base sm:text-lg font-bold text-[#F0F5F1] truncate">
                {currency}{travelData ? travelData.amount.toLocaleString('en-IN') : '0'}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 bg-[#2D6A4F]/30 text-[#B7E4C7] rounded-full border border-[#2D6A4F]/40 flex-shrink-0 ml-1">
            {travelData ? `${travelData.percentage}%` : '0%'}
          </span>
        </div>

      </div>

      {/* Main Interactive Charts (Section 7 Color Rules) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Category Breakdown Chart */}
        {(activeGraphTab === 'all' || activeGraphTab === 'categories') && (
          <div className="lg:col-span-5 glass-card rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#F0F5F1] flex items-center gap-2">
                  <PieChart className="w-4.5 h-4.5 text-[#52B788]" />
                  Category Distribution Donut
                </h3>
                <span className="text-xs text-[#A0B0A5] font-semibold">By Net Outflow</span>
              </div>

              {categoryChartData.length > 0 ? (
                <div className="h-64 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="amount"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#080D0B" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`${currency}${Number(value).toLocaleString('en-IN')}`, 'Spent']}
                        contentStyle={{ backgroundColor: '#0D1511', borderRadius: '14px', border: '1px solid rgba(149, 213, 178, 0.3)', color: '#F0F5F1', fontSize: '13px', fontWeight: 'bold' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#A0B0A5]">Total Outflow</span>
                    <span className="text-xl font-bold text-[#F0F5F1]">
                      {currency}{summary.totalSpent.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-[#A0B0A5] text-sm font-semibold">
                  No spending recorded yet.
                </div>
              )}
            </div>

            {/* Custom Legend */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 max-h-36 overflow-y-auto no-scrollbar">
              {categoryBreakdown.map((item) => (
                <div key={item.category.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-white/5 transition">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.category.color }}></span>
                    <span className="text-[#A0B0A5] font-semibold truncate">{item.category.name}</span>
                  </div>
                  <span className="font-bold text-[#F0F5F1] ml-1">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spend Timeline Curve (Section 7 rules: #52B788 online, #74C69D cash, #2D6A4F gradient) */}
        {(activeGraphTab === 'all' || activeGraphTab === 'trends') && (
          <div className="lg:col-span-7 glass-card rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#F0F5F1] flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-[#52B788]" />
                    Spend Timeline Curve (Digital vs Cash)
                  </h3>
                  <p className="text-xs text-[#A0B0A5] font-semibold">Daily trends using official palette hierarchy</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-[#52B788]">
                    <span className="w-3 h-3 rounded-full bg-[#52B788]"></span> Digital (#52B788)
                  </span>
                  <span className="flex items-center gap-1.5 text-[#74C69D]">
                    <span className="w-3 h-3 rounded-full bg-[#74C69D]"></span> Cash (#74C69D)
                  </span>
                </div>
              </div>

              {dailyTrends.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#52B788" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#74C69D" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.06)" />
                      <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#A0B0A5', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#A0B0A5', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(val: any) => [`${currency}${Number(val).toLocaleString('en-IN')}`]}
                        contentStyle={{ backgroundColor: '#0D1511', borderRadius: '14px', border: '1px solid rgba(149, 213, 178, 0.3)', color: '#F0F5F1', fontSize: '13px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="online" name="Digital" stroke="#52B788" strokeWidth={3} fillOpacity={1} fill="url(#colorOnline)" />
                      <Area type="monotone" dataKey="cash" name="Cash" stroke="#74C69D" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-[#A0B0A5] text-sm font-semibold">
                  No trend data available yet.
                </div>
              )}
            </div>

            {/* Bottom Bar Comparison across Categories */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold text-[#A0B0A5] mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#74C69D]" />
                Category Outflow Comparison
              </h4>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A0B0A5', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(val: any) => [`${currency}${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{ backgroundColor: '#0D1511', borderRadius: '10px', border: '1px solid rgba(149, 213, 178, 0.3)', color: '#F0F5F1', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
