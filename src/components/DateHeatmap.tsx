import React, { useState, useMemo, useCallback } from 'react';
import { useFinance } from '../context/useFinance';
import { Calendar, ChevronLeft, ChevronRight, Flame, Sparkles } from 'lucide-react';

interface DaySpendInfo {
  dateStr: string;
  dayNum: number;
  monthNum: number;
  yearNum: number;
  dayOfWeekNum: number;
  dayOfWeekStr: string;
  monthName: string;
  total: number;
  cash: number;
  online: number;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const MONTHS_LIST = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const DateHeatmap: React.FC = () => {
  const { transactions, currency } = useFinance();

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsSet = new Set<number>([currentYear]);
    transactions.forEach(tx => {
      if (!tx.date) return;
      const year = new Date(tx.date).getFullYear();
      if (!isNaN(year)) yearsSet.add(year);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions]);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return availableYears[0] || new Date().getFullYear();
  });

  const [hoveredDay, setHoveredDay] = useState<DaySpendInfo | null>(null);

  const dailySpendMap = useMemo(() => {
    const map = new Map<string, { total: number; cash: number; online: number; count: number }>();
    transactions.forEach(tx => {
      if (!tx.date) return;
      const dateKey = tx.date.split('T')[0];
      const amount = Number(tx.amount) || 0;
      const existing = map.get(dateKey) || { total: 0, cash: 0, online: 0, count: 0 };
      existing.total += amount;
      existing.count += 1;
      if (tx.paymentMethod === 'cash') {
        existing.cash += amount;
      } else {
        existing.online += amount;
      }
      map.set(dateKey, existing);
    });
    return map;
  }, [transactions]);

  const maxSingleDaySpend = useMemo(() => {
    let max = 0;
    dailySpendMap.forEach(v => {
      if (v.total > max) max = v.total;
    });
    return max || 4000;
  }, [dailySpendMap]);

  const getLevel = useCallback((total: number): 0 | 1 | 2 | 3 | 4 => {
    if (total <= 0) return 0;
    if (total <= 500 || total <= maxSingleDaySpend * 0.2) return 1;
    if (total <= 1500 || total <= maxSingleDaySpend * 0.45) return 2;
    if (total <= 3500 || total <= maxSingleDaySpend * 0.75) return 3;
    return 4;
  }, [maxSingleDaySpend]);

  const heatmapMatrix = useMemo(() => {
    const weeks: Array<{
      weekIndex: number;
      monthLabel?: string;
      days: (DaySpendInfo | null)[];
    }> = [];

    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);

    const current = new Date(startDate);
    current.setDate(current.getDate() - current.getDay());

    let currentWeek: (DaySpendInfo | null)[] = [];
    let weekIdx = 0;
    let lastMonthSeen = -1;

    while (current <= endDate || currentWeek.length > 0) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      const isWithinYear = current.getFullYear() === selectedYear;

      let monthLabel: string | undefined = undefined;
      if (isWithinYear && current.getMonth() !== lastMonthSeen) {
        lastMonthSeen = current.getMonth();
        monthLabel = MONTHS_LIST[lastMonthSeen];
      }

      if (isWithinYear) {
        const data = dailySpendMap.get(dateStr) || { total: 0, cash: 0, online: 0, count: 0 };
        const dateObj = new Date(current);
        const dayOfWeekStr = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const monthNameFull = dateObj.toLocaleDateString('en-US', { month: 'long' });

        currentWeek.push({
          dateStr,
          dayNum: current.getDate(),
          monthNum: current.getMonth(),
          yearNum: current.getFullYear(),
          dayOfWeekNum: current.getDay(),
          dayOfWeekStr,
          monthName: monthNameFull,
          total: data.total,
          cash: data.cash,
          online: data.online,
          count: data.count,
          level: getLevel(data.total)
        });
      } else {
        currentWeek.push(null);
      }

      if (currentWeek.length === 7) {
        weeks.push({
          weekIndex: weekIdx,
          monthLabel,
          days: currentWeek
        });
        currentWeek = [];
        weekIdx++;
      }

      current.setDate(current.getDate() + 1);

      if (current.getFullYear() > selectedYear && current.getDay() === 0) {
        break;
      }
    }

    return weeks;
  }, [selectedYear, dailySpendMap, getLevel]);

  const stats = useMemo(() => {
    let totalSpend = 0;
    let activeDays = 0;
    let maxDaySpend = 0;

    heatmapMatrix.forEach(w => {
      w.days.forEach(d => {
        if (d && d.total > 0) {
          totalSpend += d.total;
          activeDays++;
          if (d.total > maxDaySpend) maxDaySpend = d.total;
        }
      });
    });

    const avgPerActiveDay = activeDays > 0 ? Math.round(totalSpend / activeDays) : 0;
    return { totalSpend, activeDays, maxDaySpend, avgPerActiveDay };
  }, [heatmapMatrix]);

  // Official 6-Color Emerald Palette Heatmap Intensity Scale
  const levelSquareColors = {
    0: 'bg-white/5 border border-white/10 hover:border-white/30',
    1: 'bg-[#2D6A4F]/65 border border-[#2D6A4F] text-white',
    2: 'bg-[#40916C]/85 border border-[#40916C] text-white font-bold',
    3: 'bg-[#52B788] border border-[#74C69D] text-[#080D0B] font-black shadow-xs shadow-[#52B788]/40',
    4: 'bg-[#95D5B2] border border-[#B7E4C7] text-[#080D0B] font-black shadow-md shadow-[#95D5B2]/60 scale-110'
  };

  return (
    <div className="glass-card rounded-3xl p-6 space-y-5">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#F0F5F1] tracking-tight flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-[#52B788]" />
            Continuous Date-Wise Spend Matrix
            <span className="px-3 py-1 text-xs font-bold bg-[#52B788]/20 text-[#B7E4C7] rounded-full border border-[#52B788]/30">
              {selectedYear}
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-[#A0B0A5] font-semibold mt-1">
            Real-time daily intensity grid (Date, Month, Year spend mapping)
          </p>
        </div>

        {/* Year Switcher */}
        <div className="flex items-center bg-[#0D1511]/90 border border-white/15 rounded-full p-1 shadow-md">
          <button
            onClick={() => {
              const idx = availableYears.indexOf(selectedYear) + 1;
              if (idx < availableYears.length) setSelectedYear(availableYears[idx]);
            }}
            disabled={availableYears.indexOf(selectedYear) >= availableYears.length - 1}
            className="p-1.5 rounded-full text-[#A0B0A5] hover:text-[#F0F5F1] disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 text-sm font-bold text-[#F0F5F1]">
            {selectedYear}
          </span>
          <button
            onClick={() => {
              const idx = availableYears.indexOf(selectedYear) - 1;
              if (idx >= 0) setSelectedYear(availableYears[idx]);
            }}
            disabled={availableYears.indexOf(selectedYear) <= 0}
            className="p-1.5 rounded-full text-[#A0B0A5] hover:text-[#F0F5F1] disabled:opacity-30 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#080D0B]/60 border border-white/10 rounded-2xl">
        <div>
          <span className="text-xs font-bold text-[#A0B0A5] uppercase tracking-wider block">Total Year Spend</span>
          <span className="text-lg sm:text-xl font-extrabold text-[#F0F5F1] mt-0.5 block">
            {currency}{stats.totalSpend.toLocaleString('en-IN')}
          </span>
        </div>
        <div>
          <span className="text-xs font-bold text-[#A0B0A5] uppercase tracking-wider block">Active Spend Days</span>
          <span className="text-lg sm:text-xl font-extrabold text-[#74C69D] mt-0.5 block">
            {stats.activeDays} Days
          </span>
        </div>
        <div>
          <span className="text-xs font-bold text-[#A0B0A5] uppercase tracking-wider block">Avg / Active Day</span>
          <span className="text-lg sm:text-xl font-extrabold text-[#F0F5F1] mt-0.5 block">
            {currency}{stats.avgPerActiveDay.toLocaleString('en-IN')}
          </span>
        </div>
        <div>
          <span className="text-xs font-bold text-[#A0B0A5] uppercase tracking-wider block">Peak Single Day</span>
          <span className="text-lg sm:text-xl font-extrabold text-[#52B788] mt-0.5 block">
            {currency}{stats.maxDaySpend.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Hover Information Banner */}
      <div className="min-h-[54px] p-3.5 bg-[#080D0B]/60 border border-white/10 rounded-2xl flex items-center justify-between shadow-md">
        {hoveredDay ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#52B788]/20 border border-[#52B788]/40 flex items-center justify-center font-bold text-xs text-[#B7E4C7] shadow-xs">
                {hoveredDay.dayNum}
              </div>
              <div>
                <div className="text-sm font-bold text-[#F0F5F1] flex items-center gap-2">
                  <span>{hoveredDay.dayOfWeekStr}, {hoveredDay.monthName} {hoveredDay.dayNum}, {hoveredDay.yearNum}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-white/10 text-[#95D5B2] rounded-md">
                    {hoveredDay.count} transactions
                  </span>
                </div>
                <div className="text-xs text-[#A0B0A5] font-medium flex items-center gap-3 mt-0.5">
                  <span>Cash: <strong className="text-[#74C69D]">{currency}{hoveredDay.cash.toLocaleString('en-IN')}</strong></span>
                  <span>•</span>
                  <span>Digital: <strong className="text-[#52B788]">{currency}{hoveredDay.online.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-[#A0B0A5] block">Total Outflow</span>
              <span className="text-lg font-extrabold text-[#F0F5F1]">
                {currency}{hoveredDay.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A0B0A5] mx-auto">
            <Sparkles className="w-4 h-4 text-[#52B788]" />
            Hover over any cell in the heatmap to inspect exact Date, Month, Year & Cash/Digital breakdown
          </div>
        )}
      </div>

      {/* Horizontal Matrix Heatmap (6 Palette Colors) */}
      <div className="p-4 bg-[#080D0B]/60 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar">
        <div className="min-w-[720px]">
          
          <div className="flex text-[11px] font-semibold text-[#A0B0A5] mb-2 pl-7">
            {heatmapMatrix.map((w, idx) => (
              <div key={idx} className="w-3.5 sm:w-4 text-left flex-shrink-0">
                {w.monthLabel ? (
                  <span className="absolute -mt-5 font-bold text-[#F0F5F1]">{w.monthLabel}</span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            <div className="flex flex-col justify-between text-[10px] font-semibold text-[#A0B0A5] pr-2 py-0.5">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="flex gap-1">
              {heatmapMatrix.map((w, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {w.days.map((d, dIdx) => {
                    if (!d) {
                      return <div key={dIdx} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] opacity-0" />;
                    }
                    return (
                      <button
                        key={d.dateStr}
                        onMouseEnter={() => setHoveredDay(d)}
                        onClick={() => setHoveredDay(d)}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] transition-all duration-150 relative ${levelSquareColors[d.level]}`}
                        title={`${d.dateStr}: ${currency}${d.total.toLocaleString('en-IN')}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10 text-xs text-[#A0B0A5] font-semibold">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-[3px] bg-white/5 border border-white/10" title="₹0" />
            <span className="w-3.5 h-3.5 rounded-[3px] bg-[#2D6A4F]" title="Dark Emerald (#2D6A4F)" />
            <span className="w-3.5 h-3.5 rounded-[3px] bg-[#40916C]" title="Sea Green (#40916C)" />
            <span className="w-3.5 h-3.5 rounded-[3px] bg-[#52B788]" title="Mint Leaf 2 (#52B788)" />
            <span className="w-3.5 h-3.5 rounded-[3px] bg-[#95D5B2]" title="Celadon (#95D5B2)" />
          </div>
          <span>More</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#F0F5F1]">
          <Calendar className="w-3.5 h-3.5 text-[#52B788]" />
          <span>Continuous backend persistence</span>
        </div>
      </div>

    </div>
  );
};
