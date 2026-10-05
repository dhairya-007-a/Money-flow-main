import React, { useState } from 'react';
import { useFinance } from '../context/useFinance';
import { SecurityService } from '../services/securityService';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

export const LockScreen: React.FC = () => {
  const { hasPasswordSet, setHasPasswordSet, setIsLocked, addToast } = useFinance();

  // Setup state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hint, setHint] = useState('');
  
  // Unlock state
  const [enterPassword, setEnterPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showHintText, setShowHintText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword) {
      triggerError('Please enter a password.');
      return;
    }
    if (newPassword.length < 3) {
      triggerError('Password should be at least 3 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    const success = await SecurityService.setPassword(newPassword, hint);
    setIsSubmitting(false);

    if (success) {
      setHasPasswordSet(true);
      setIsLocked(false);
      addToast('Master password configured & app secured', 'success');
    } else {
      triggerError('Failed to save master password.');
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!enterPassword) {
      triggerError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const isValid = await SecurityService.verifyPassword(enterPassword);
    setIsSubmitting(false);

    if (isValid) {
      setIsLocked(false);
      addToast('App unlocked successfully', 'success');
    } else {
      triggerError('Incorrect password. Access denied.');
      setEnterPassword('');
    }
  };

  const handleSkipSetup = () => {
    setIsLocked(false);
    addToast('Welcome to Finance Flow! You can set a password anytime in Security.', 'info');
  };

  const passwordHint = SecurityService.getHint();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080D0B] px-4 selection:bg-[#52B788] selection:text-[#080D0B] overflow-hidden">
      
      {/* Ambient Spatial Background with Video & Glowing Orbs */}
      <div className="spatial-bg-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-screen pointer-events-none filter brightness-75 contrast-120"
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="spatial-orb spatial-orb-1"></div>
        <div className="spatial-orb spatial-orb-2"></div>
        <div className="spatial-orb spatial-orb-3"></div>
      </div>

      {/* Main Glass Lock Box with Medium Glassmorphism */}
      <div className={`relative z-10 w-full max-w-md glass-card p-6 sm:p-8 rounded-3xl border border-[#B7E4C7]/25 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${isShaking ? 'animate-shake' : 'animate-scaleUp'}`}>
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#52B788] via-[#74C69D] to-[#B7E4C7] rounded-2xl blur-sm opacity-50"></div>
            <div className="relative inline-flex items-center justify-center p-3.5 rounded-2xl bg-[#0D1E16] border border-[#52B788]/40 shadow-inner">
              {hasPasswordSet ? (
                <Lock className="w-7 h-7 text-[#74C69D] drop-shadow" />
              ) : (
                <KeyRound className="w-7 h-7 text-[#74C69D] drop-shadow" />
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#F0F5F1] via-[#B7E4C7] to-[#74C69D] bg-clip-text text-transparent tracking-tight">
            {hasPasswordSet ? 'Finance Flow Locked' : 'Set Up App Security'}
          </h1>
          <p className="text-xs sm:text-sm text-[#A0B0A5] mt-1 font-semibold">
            {hasPasswordSet 
              ? 'Enter your master password to decrypt and access records'
              : 'Create a master password or continue directly to dashboard'}
          </p>
        </div>

        {/* Error Alert Badge */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#F0F5F1] text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert Badge */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-[#52B788]/20 border border-[#52B788]/40 text-[#F0F5F1] text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#52B788] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: FIRST TIME SETUP */}
        {!hasPasswordSet ? (
          <form onSubmit={handleSetupPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#A0B0A5] mb-1.5 uppercase tracking-wider">
                Create Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-xl liquid-glass-input text-sm font-bold tracking-wider text-[#F0F5F1] placeholder:text-[#A0B0A5]/40 focus:outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B0A5] hover:text-[#F0F5F1] transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A0B0A5] mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl liquid-glass-input text-sm font-bold tracking-wider text-[#F0F5F1] placeholder:text-[#A0B0A5]/40 focus:outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B0A5] hover:text-[#F0F5F1] transition"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A0B0A5] mb-1.5 uppercase tracking-wider">
                Password Hint (Optional)
              </label>
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="e.g. My lucky number or childhood pet"
                className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-xs sm:text-sm font-semibold text-[#F0F5F1] placeholder:text-[#A0B0A5]/40 focus:outline-none transition"
              />
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 btn-primary-emerald text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <ShieldCheck className="w-4.5 h-4.5 text-[#080D0B]" />
                <span>{isSubmitting ? 'Saving Security...' : 'Save Password & Protect App'}</span>
              </button>

              <button
                type="button"
                onClick={handleSkipSetup}
                className="w-full py-2.5 px-4 btn-secondary-emerald text-xs flex items-center justify-center gap-1.5"
              >
                <span>Continue without Password</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#74C69D]" />
              </button>
            </div>
          </form>
        ) : (
          /* MODE 2: UNLOCK SCREEN */
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#A0B0A5] mb-1.5 uppercase tracking-wider">
                Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={enterPassword}
                  onChange={(e) => setEnterPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-xl liquid-glass-input text-sm font-bold tracking-wider text-[#F0F5F1] placeholder:text-[#A0B0A5]/40 focus:outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B0A5] hover:text-[#F0F5F1] transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passwordHint && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowHintText(!showHintText)}
                  className="text-xs text-[#74C69D] hover:underline inline-flex items-center gap-1 font-bold"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHintText ? 'Hide Hint' : 'Forgot password hint?'}</span>
                </button>
                {showHintText && (
                  <p className="mt-1.5 p-2.5 rounded-xl bg-white/5 border border-[#52B788]/30 text-xs text-[#95D5B2] text-left italic">
                    Hint: {passwordHint}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 btn-primary-emerald text-sm flex items-center justify-center gap-2 shadow-lg mt-2"
            >
              <Lock className="w-4.5 h-4.5 text-[#080D0B]" />
              <span>{isSubmitting ? 'Verifying...' : 'Unlock App Now'}</span>
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-[11px] text-[#A0B0A5] font-semibold border-t border-white/10 pt-3 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#52B788]" />
          <span>SHA-256 Salted Cryptographic Protection</span>
        </div>

      </div>
    </div>
  );
};
