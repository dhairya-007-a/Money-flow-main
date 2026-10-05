import React from 'react';
import { useFinance } from '../context/useFinance';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3, 
  Database,
  CheckCircle2
} from 'lucide-react';

export const FirstTimeWelcomeModal: React.FC = () => {
  const { 
    isFirstLaunch, 
    completeFirstLaunch, 
    setIsChangePasswordModalOpen 
  } = useFinance();

  if (!isFirstLaunch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D0B]/90 backdrop-blur-md animate-fadeIn">
      
      {/* Main Glass Card */}
      <div className="glass-modal-container w-full max-w-lg rounded-3xl shadow-2xl border border-[#B7E4C7]/30 overflow-hidden animate-scaleUp">
        
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-[#0E2016] via-[#1E4330] to-[#0E2016] p-7 text-center relative border-b border-white/10">
          <div className="relative inline-block mb-3">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#52B788] via-[#74C69D] to-[#B7E4C7] rounded-3xl blur opacity-60"></div>
            <img 
              src="/logo.png" 
              alt="Finance Flow Logo" 
              className="relative w-14 h-14 mx-auto object-contain drop-shadow-lg" 
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#F0F5F1] via-[#B7E4C7] to-[#74C69D] bg-clip-text text-transparent tracking-tight">
            Welcome to Finance Flow
          </h2>
          <p className="text-xs sm:text-sm text-[#95D5B2] font-semibold mt-1 max-w-sm mx-auto">
            Luxury Emerald Glass Personal Finance & Spending Analytics Suite
          </p>

          <div className="flex items-center justify-center gap-3 mt-4 text-[11px] font-bold text-[#A0B0A5]">
            <span className="flex items-center gap-1 text-[#B7E4C7]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#52B788]" /> Instant Local Sync
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#B7E4C7]">
              <Database className="w-3.5 h-3.5 text-[#74C69D]" /> Atomic File Backend
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#B7E4C7]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#95D5B2]" /> Privacy First
            </span>
          </div>
        </div>

        {/* Action Choices (1-Click Start) */}
        <div className="p-6 space-y-3.5">
          
          {/* Choice 1: Clean Instant Start (1-Click) */}
          <button
            onClick={() => completeFirstLaunch(false)}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#52B788] via-[#74C69D] to-[#52B788] hover:from-[#74C69D] hover:to-[#B7E4C7] text-[#080D0B] font-extrabold shadow-xl shadow-[#52B788]/20 border border-white/40 flex items-center justify-between group transition transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-[#080D0B] font-black flex-shrink-0">
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-extrabold block">
                  Launch Clean Dashboard (1-Click)
                </span>
                <span className="text-xs font-bold text-[#080D0B]/80 block">
                  Start fresh with 8 pre-configured budget categories
                </span>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-[#080D0B] group-hover:translate-x-1 transition flex-shrink-0 ml-2" />
          </button>

          {/* Choice 2: Start with Sample Data (1-Click) */}
          <button
            onClick={() => completeFirstLaunch(true)}
            className="w-full p-4 rounded-2xl glass-card hover:bg-white/10 border border-[#B7E4C7]/30 text-[#F0F5F1] font-bold flex items-center justify-between group transition transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#52B788]/20 border border-[#52B788]/40 flex items-center justify-center text-[#74C69D] font-black flex-shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-[#F0F5F1] block">
                  Explore with Sample Data (1-Click)
                </span>
                <span className="text-xs text-[#A0B0A5] block">
                  Pre-loads coffee, groceries & bills to preview charts & heatmaps
                </span>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-[#74C69D] group-hover:translate-x-1 transition flex-shrink-0 ml-2" />
          </button>

          {/* Choice 3: Set Password Lock (Optional) */}
          <div className="pt-2 text-center">
            <button
              onClick={() => {
                completeFirstLaunch(false);
                setIsChangePasswordModalOpen(true);
              }}
              className="text-xs text-[#95D5B2] hover:text-[#B7E4C7] hover:underline font-bold inline-flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-4 h-4 text-[#74C69D]" />
              <span>Enable Master Password Protection (Optional)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
