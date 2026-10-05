import React, { useState } from 'react';
import { SecurityService } from '../services/securityService';
import { useFinance } from '../context/useFinance';
import { 
  X, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Trash2 
} from 'lucide-react';

export const ChangePasswordModal: React.FC = () => {
  const { 
    isChangePasswordModalOpen, 
    setIsChangePasswordModalOpen, 
    setHasPasswordSet, 
    hasPasswordSet,
    addToast 
  } = useFinance();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newHint, setNewHint] = useState(SecurityService.getHint() || '');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isChangePasswordModalOpen) return null;

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    setShowResetConfirm(false);
    setIsChangePasswordModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (hasPasswordSet && !currentPassword) {
      setErrorMsg('Please enter your current master password.');
      return;
    }
    if (!newPassword || newPassword.length < 3) {
      setErrorMsg('New password must be at least 3 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    let result: { success: boolean; error?: string };

    if (hasPasswordSet) {
      result = await SecurityService.changePassword(currentPassword, newPassword, newHint);
    } else {
      const ok = await SecurityService.setPassword(newPassword, newHint);
      result = { success: ok, error: ok ? undefined : 'Failed to save password' };
    }
    setIsSubmitting(false);

    if (result.success) {
      setHasPasswordSet(true);
      setSuccessMsg('Master password updated successfully!');
      addToast('Security password saved', 'success');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } else {
      setErrorMsg(result.error || 'Failed to update password.');
    }
  };

  const handleRemovePassword = async () => {
    if (!currentPassword) {
      setErrorMsg('Enter current password to verify identity before removal.');
      return;
    }

    setIsSubmitting(true);
    const verify = await SecurityService.verifyPassword(currentPassword);
    setIsSubmitting(false);

    if (!verify) {
      setErrorMsg('Incorrect current password. Cannot remove security.');
      return;
    }

    SecurityService.resetSecurity();
    setHasPasswordSet(false);
    addToast('Master password removed. App is now unlocked.', 'info');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D0B]/85 backdrop-blur-md animate-fadeIn">
      
      <div className="glass-modal-container w-full max-w-md rounded-3xl shadow-2xl border border-white/20 animate-scaleUp overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#11241A] via-[#1A3828] to-[#11241A] p-6 text-[#F0F5F1] flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#52B788]/20 flex items-center justify-center text-[#52B788] border border-[#52B788]/30">
              <KeyRound className="w-5.5 h-5.5 text-[#52B788]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl tracking-tight text-[#F0F5F1]">
                {hasPasswordSet ? 'Security & Password Settings' : 'Create Master Password'}
              </h3>
              <p className="text-xs text-[#95D5B2] font-semibold">
                {hasPasswordSet ? 'Update or remove app master password' : 'Protect your financial records with a password'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8.5 h-8.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F0F5F1] transition border border-white/15"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#F0F5F1] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-[#52B788]/20 border border-[#52B788]/40 text-[#F0F5F1] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#52B788] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Password (if set) */}
          {hasPasswordSet && (
            <div>
              <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1.5">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-xs sm:text-sm font-bold text-[#F0F5F1] placeholder:text-[#A0B0A5]/40 focus:outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B0A5] hover:text-[#F0F5F1] transition"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1.5">
              {hasPasswordSet ? 'New Password *' : 'Set Password *'}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-xs sm:text-sm font-bold text-[#F0F5F1] placeholder:text-[#A0B0A5]/40 focus:outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B0A5] hover:text-[#F0F5F1] transition"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-xs sm:text-sm font-bold text-[#F0F5F1] placeholder:text-[#A0B0A5]/40 focus:outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B0A5] hover:text-[#F0F5F1] transition"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Hint */}
          <div>
            <label className="block text-xs font-bold text-[#A0B0A5] uppercase tracking-wider mb-1.5">
              Password Recovery Hint (Optional)
            </label>
            <input
              type="text"
              value={newHint}
              onChange={(e) => setNewHint(e.target.value)}
              placeholder="e.g. My favorite car brand"
              className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-xs sm:text-sm font-semibold text-[#F0F5F1] placeholder:text-[#A0B0A5]/40 focus:outline-none transition"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 btn-primary-emerald text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4.5 h-4.5 text-[#080D0B]" />
              <span>{isSubmitting ? 'Saving...' : hasPasswordSet ? 'Update Master Password' : 'Save & Enable Lock'}</span>
            </button>

            {/* Remove Password Option */}
            {hasPasswordSet && (
              !showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-2 text-xs font-bold text-[#EF4444] hover:underline flex items-center justify-center gap-1 mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Password Security
                </button>
              ) : (
                <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-2xl space-y-2 text-center animate-fadeIn">
                  <p className="text-xs text-[#F0F5F1] font-bold">Remove master password lock?</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleRemovePassword}
                      className="px-3 py-1 bg-[#EF4444] text-white rounded-lg text-xs font-bold"
                    >
                      Confirm Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1 bg-white/10 text-[#A0B0A5] rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

        </form>

      </div>

    </div>
  );
};
