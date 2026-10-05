import React from 'react';
import type { ToastNotification } from '../types/finance';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = 'text-[#52B788]';
        let borderColor = 'border-[#52B788]/30';
        let bgGlow = 'bg-[#52B788]/10';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-[#EF4444]';
          borderColor = 'border-[#EF4444]/40';
          bgGlow = 'bg-[#EF4444]/15';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-[#F59E0B]';
          borderColor = 'border-[#F59E0B]/40';
          bgGlow = 'bg-[#F59E0B]/15';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'text-[#74C69D]';
          borderColor = 'border-[#74C69D]/30';
          bgGlow = 'bg-[#74C69D]/15';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl glass-card border ${borderColor} ${bgGlow} shadow-xl backdrop-blur-xl flex items-center justify-between gap-3 animate-scaleUp`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${iconColor}`} />
              <span className="text-xs sm:text-sm font-semibold text-[#F0F5F1] leading-tight break-words">
                {toast.message}
              </span>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-[#A0B0A5] hover:text-[#F0F5F1] rounded-lg transition hover:bg-white/10 flex-shrink-0"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
