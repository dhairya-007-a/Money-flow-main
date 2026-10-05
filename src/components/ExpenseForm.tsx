import React, { useState } from 'react';
import { useFinance } from '../context/useFinance';
import type { PaymentMethod, Transaction } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { X, Plus, Banknote, Smartphone, MapPin, FileText, Calendar, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

interface ExpenseFormContentProps {
  onClose: () => void;
  editTransaction?: Transaction | null;
}

const getCurrentDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const POPULAR_VENDORS = [
  { name: 'Swiggy', categoryKeywords: ['food', 'dining'] },
  { name: 'Zomato', categoryKeywords: ['food', 'dining'] },
  { name: 'Grocery Store', categoryKeywords: ['grocer', 'supermarket', 'food'] },
  { name: 'Blinkit / Zepto', categoryKeywords: ['grocer', 'supermarket'] },
  { name: 'Uber / Auto', categoryKeywords: ['transport', 'commute', 'travel'] },
  { name: 'Fuel / Petrol', categoryKeywords: ['transport', 'fuel', 'vehicle'] },
  { name: 'Amazon', categoryKeywords: ['shopping', 'shop'] },
  { name: 'Pharmacy / Meds', categoryKeywords: ['health', 'medical'] },
  { name: 'Electricity / Wi-Fi', categoryKeywords: ['utilit', 'bill'] },
];

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

const ExpenseFormContent: React.FC<ExpenseFormContentProps> = ({ onClose, editTransaction }) => {
  const { 
    categories, 
    addTransaction, 
    updateTransaction, 
    currency, 
    setIsCategoryModalOpen 
  } = useFinance();

  const [amount, setAmount] = useState<string>(editTransaction ? editTransaction.amount.toString() : '');
  const [merchant, setMerchant] = useState<string>(editTransaction ? editTransaction.merchant : '');
  const [description, setDescription] = useState<string>(editTransaction ? editTransaction.description : '');
  const [date, setDate] = useState<string>(editTransaction ? editTransaction.date : getCurrentDate());
  const [time, setTime] = useState<string>(editTransaction?.time || getCurrentTime());
  const [categoryId, setCategoryId] = useState<string>(editTransaction ? editTransaction.categoryId : (categories[0]?.id || 'food'));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editTransaction ? editTransaction.paymentMethod : 'online');
  const [error, setError] = useState<string>('');

  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amount);
    if (isNaN(current) || current <= 0) {
      setAmount(val.toString());
    } else {
      setAmount((current + val).toString());
    }
    setError('');
  };

  const handleClearAmount = () => {
    setAmount('');
  };

  const handleQuickVendor = (vendorName: string, keywords: string[]) => {
    setMerchant(vendorName);
    const match = categories.find((c) =>
      keywords.some((kw) => c.name.toLowerCase().includes(kw) || c.id.toLowerCase().includes(kw))
    );
    if (match) {
      setCategoryId(match.id);
    }
    setError('');
  };

  const handleQuickDate = (type: 'today' | 'yesterday') => {
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    }
    setDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!merchant.trim()) {
      setError('Please enter where you spent (Store / Merchant / Location)');
      return;
    }

    if (editTransaction) {
      updateTransaction(editTransaction.id, {
        amount: numericAmount,
        merchant: merchant.trim(),
        description: description.trim(),
        date,
        time,
        categoryId,
        paymentMethod
      });
    } else {
      addTransaction({
        amount: numericAmount,
        merchant: merchant.trim(),
        description: description.trim(),
        date,
        time,
        categoryId,
        paymentMethod
      });

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    onClose();
  };

  return (
    <div className="glass-modal-container w-full max-w-lg rounded-3xl shadow-2xl border border-white/20 animate-scaleUp overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#11241A] via-[#1A3828] to-[#11241A] p-6 text-[#F0F5F1] flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#52B788]/20 flex items-center justify-center text-[#52B788] border border-[#52B788]/30 shadow-md">
            <Sparkles className="w-5.5 h-5.5 text-[#52B788]" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl tracking-tight text-[#F0F5F1]">
              {editTransaction ? 'Edit Spend Entry' : 'Log New Spend'}
            </h3>
            <p className="text-xs text-[#95D5B2] font-semibold">
              {editTransaction ? 'Update recorded transaction details' : 'Record vendor, amount, time & payment mode'}
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

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
        
        {error && (
          <div className="p-3 rounded-2xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#F0F5F1] text-xs sm:text-sm font-bold animate-fadeIn">
            {error}
          </div>
        )}

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#A0B0A5] uppercase tracking-wider">
              Amount Spent ({currency}) *
            </label>
            {amount && (
              <button
                type="button"
                onClick={handleClearAmount}
                className="text-[11px] font-bold text-[#EF4444] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-xl text-[#74C69D]">
              {currency}
            </span>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 liquid-glass-input rounded-2xl text-xl sm:text-2xl font-extrabold text-[#F0F5F1] focus:outline-none"
              autoFocus
            />
          </div>

          {/* 1-Click Quick Amount Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] uppercase font-bold text-[#74C69D] tracking-wider mr-1">Quick Add:</span>
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-[#52B788]/20 hover:text-[#B7E4C7] border border-white/10 hover:border-[#52B788]/40 text-xs font-bold text-[#A0B0A5] transition active:scale-95 shadow-sm"
              >
                +{currency}{val}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1.5">
            Payment Mode *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold transition ${
                paymentMethod === 'online'
                  ? 'bg-[#52B788] text-[#080D0B] font-extrabold shadow-lg border-white/30 scale-[1.02]'
                  : 'bg-white/5 border-white/10 text-[#A0B0A5] hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-4.5 h-4.5" />
              <span>Digital / UPI</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold transition ${
                paymentMethod === 'cash'
                  ? 'bg-[#40916C] text-white font-extrabold shadow-lg border-white/30 scale-[1.02]'
                  : 'bg-white/5 border-white/10 text-[#A0B0A5] hover:bg-white/10'
              }`}
            >
              <Banknote className="w-4.5 h-4.5" />
              <span>Physical Cash</span>
            </button>
          </div>
        </div>

        {/* Merchant / Location */}
        <div>
          <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1.5">
            Where did you spend? *
          </label>
          <div className="relative">
            <MapPin className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74C69D]" />
            <input
              type="text"
              placeholder="Store, Vendor, Online Site or Friend"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 liquid-glass-input rounded-xl text-xs sm:text-sm font-semibold text-[#F0F5F1] focus:outline-none"
            />
          </div>

          {/* 1-Click Popular Vendors with Auto-Category Mapping */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 max-h-16 overflow-y-auto no-scrollbar py-0.5">
            <span className="text-[10px] uppercase font-bold text-[#74C69D] tracking-wider mr-1">Frequent:</span>
            {POPULAR_VENDORS.map((v) => (
              <button
                key={v.name}
                type="button"
                onClick={() => handleQuickVendor(v.name, v.categoryKeywords)}
                className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition active:scale-95 ${
                  merchant === v.name
                    ? 'bg-[#52B788]/30 border-[#52B788] text-[#B7E4C7] font-bold shadow-sm'
                    : 'bg-white/5 border-white/10 text-[#A0B0A5] hover:bg-white/10 hover:text-[#F0F5F1]'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category Picker */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#A0B0A5] uppercase tracking-wider">
              Category *
            </label>
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsCategoryModalOpen(true);
              }}
              className="text-xs font-bold text-[#74C69D] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Category
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-[#080D0B]/60 border border-white/10 rounded-xl no-scrollbar">
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition truncate ${
                    isSelected
                      ? 'bg-[#40916C]/40 text-[#F0F5F1] font-extrabold border-[#95D5B2]/50 shadow-md'
                      : 'bg-white/5 border-white/10 text-[#A0B0A5] hover:bg-white/10'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.iconName} imageUrl={cat.imageUrl} className="w-3 h-3 text-[#080D0B]" />
                  </div>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reason / Why (Description) */}
        <div>
          <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1.5">
            Reason / Notes (Optional)
          </label>
          <div className="relative">
            <FileText className="w-4.5 h-4.5 absolute left-3.5 top-3 text-[#74C69D]" />
            <textarea
              placeholder="What did you buy or why was it paid?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full pl-10 pr-4 py-2.5 liquid-glass-input rounded-xl text-xs sm:text-sm font-medium text-[#F0F5F1] focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#A0B0A5] uppercase tracking-wider">
                Date
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickDate('today')}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-[#52B788]/20 text-[#74C69D] font-bold border border-white/10 hover:border-[#52B788]/30 transition"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDate('yesterday')}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-[#52B788]/20 text-[#A0B0A5] hover:text-[#B7E4C7] font-bold border border-white/10 hover:border-[#52B788]/30 transition"
                >
                  Y'day
                </button>
              </div>
            </div>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#74C69D]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 liquid-glass-input rounded-xl text-xs font-semibold text-[#F0F5F1] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1.5">
              Time
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#74C69D]" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 liquid-glass-input rounded-xl text-xs font-semibold text-[#F0F5F1] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className="w-full py-3.5 btn-primary-emerald text-sm shadow-lg mt-2"
        >
          {editTransaction ? 'Update Spend Entry' : 'Save Spend Entry Now'}
        </button>

      </form>

    </div>
  );
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ isOpen, onClose, editTransaction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D0B]/85 backdrop-blur-md animate-fadeIn">
      <ExpenseFormContent
        key={editTransaction ? editTransaction.id : 'new-transaction'}
        onClose={onClose}
        editTransaction={editTransaction}
      />
    </div>
  );
};
