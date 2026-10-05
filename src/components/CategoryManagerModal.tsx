import React, { useState } from 'react';
import { useFinance } from '../context/useFinance';
import { CategoryIcon } from './CategoryIcon';
import { AVAILABLE_ICONS } from '../data/initialData';
import { X, Plus, Trash2, PieChart } from 'lucide-react';

export const CategoryManagerModal: React.FC = () => {
  const { 
    isCategoryModalOpen, 
    setIsCategoryModalOpen, 
    categories, 
    addCategory, 
    deleteCategory,
    currency
  } = useFinance();

  const [name, setName] = useState<string>('');
  const [iconName, setIconName] = useState<string>('Sparkles');
  const [color, setColor] = useState<string>('#52b788');
  const [budgetLimit, setBudgetLimit] = useState<string>('10000');
  const [error, setError] = useState<string>('');

  if (!isCategoryModalOpen) return null;

  // Strictly 6 Color Palette Presets
  const colorPresets = [
    '#b7e4c7', '#95d5b2', '#74c69d', '#52b788', '#40916c', '#2d6a4f'
  ];

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    if (categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('A category with this name already exists');
      return;
    }

    const limitVal = parseFloat(budgetLimit);

    addCategory({
      name: name.trim(),
      iconName,
      color,
      budgetLimit: !isNaN(limitVal) && limitVal > 0 ? limitVal : 10000
    });

    setName('');
    setIconName('Sparkles');
    setBudgetLimit('10000');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D0B]/85 backdrop-blur-md animate-fadeIn">
      
      <div className="glass-modal-container w-full max-w-lg rounded-3xl shadow-2xl border border-white/20 animate-scaleUp overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#11241A] via-[#1A3828] to-[#11241A] p-6 text-[#F0F5F1] flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#52B788]/20 flex items-center justify-center text-[#52B788] border border-[#52B788]/30 shadow-md">
              <PieChart className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl tracking-tight text-[#F0F5F1]">Category Portfolio Manager</h3>
              <p className="text-xs text-[#95D5B2] font-semibold">Add custom categories for laundry, food, travel & more</p>
            </div>
          </div>

          <button
            onClick={() => setIsCategoryModalOpen(false)}
            className="w-8.5 h-8.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F0F5F1] transition border border-white/15"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* Form to add category */}
          <form onSubmit={handleCreateCategory} className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3.5 shadow-sm">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#95D5B2] flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-[#52B788]" /> Create Custom Category
            </h4>

            {error && (
              <div className="p-3 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#F0F5F1] text-xs sm:text-sm font-bold animate-fadeIn">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gym, Subscriptions, Fuel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 liquid-glass-input rounded-xl text-xs sm:text-sm font-bold text-[#F0F5F1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1">
                  Monthly Budget ({currency})
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 liquid-glass-input rounded-xl text-xs sm:text-sm font-bold text-[#F0F5F1] focus:outline-none"
                />
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1">
                Select Icon
              </label>
              <div className="grid grid-cols-6 gap-2 max-h-28 overflow-y-auto p-2 bg-black/30 border border-white/10 rounded-xl no-scrollbar">
                {AVAILABLE_ICONS.map((icon) => {
                  const isSelected = iconName === icon.name;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => setIconName(icon.name)}
                      title={icon.label}
                      className={`p-2.5 rounded-xl flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-[#52B788] text-[#080D0B] font-black shadow-md border border-white/40 scale-105'
                          : 'text-[#95D5B2] hover:bg-white/10 hover:text-[#F0F5F1]'
                      }`}
                    >
                      <CategoryIcon name={icon.name} className="w-4.5 h-4.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Strictly 6 Color Presets */}
            <div>
              <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1">
                Badge Color (Strictly 6 Palette Colors)
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition transform border border-black/30 ${color === c ? 'scale-125 ring-2 ring-[#52B788] ring-offset-2 ring-offset-[#080D0B]' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 btn-primary-emerald text-xs sm:text-sm font-black shadow-md"
            >
              Add Category Now
            </button>
          </form>

          {/* List of Existing Categories */}
          <div>
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#95D5B2] mb-2.5">
              Active Portfolio Categories ({categories.length})
            </h4>

            <div className="space-y-2.5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between shadow-xs hover:border-[#52B788]/30 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[#080D0B] font-black border border-white/20 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.iconName} imageUrl={cat.imageUrl} className="w-4.5 h-4.5 text-[#080D0B]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#F0F5F1]">{cat.name}</span>
                        {cat.isCustom && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-[#52B788]/20 text-[#B7E4C7] rounded-full border border-[#52B788]/30">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#A0B0A5]">
                        Budget: {currency}{(cat.budgetLimit || 10000).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {cat.isCustom && (
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-2 text-[#A0B0A5] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
