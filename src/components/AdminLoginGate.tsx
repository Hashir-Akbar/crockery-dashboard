import React, { useState } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff, ArrowRight, Sparkles, Building2, KeyRound } from 'lucide-react';
import { Button } from './ui/Button';

interface AdminLoginGateProps {
  onLoginSuccess: () => void;
  savedAdminPassword?: string;
}

export function AdminLoginGate({ onLoginSuccess, savedAdminPassword = 'admin' }: AdminLoginGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePass = savedAdminPassword || 'admin';
    // Accepts configured password, 'admin', 'admin123', or '1234'
    if (
      password === effectivePass ||
      password === 'admin' ||
      password === 'admin123' ||
      password === '1234'
    ) {
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/10 to-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 text-white font-black text-2xl shadow-xl shadow-blue-500/20 border border-blue-400/30 mb-4">
            CC
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-heading">
            Asghar CROCKERY WHOLESALE
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Sillanwali & Regional Distribution Network • Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl relative">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800/80">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                Private Admin Access
              </h2>
              <p className="text-xs text-slate-400">
                Dashboard is protected. Enter admin password to open.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Admin Password / Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter admin password..."
                  className="w-full h-11 px-4 pr-11 bg-slate-950/80 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-rose-400 font-semibold mt-2 flex items-center gap-1">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Unlock Wholesale Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Security Notice & Default Hint */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Shop owners who receive their private link can only view their own store's ledger and cannot access this dashboard.
              </span>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" /> Default Passcode:
              </span>
              <button
                type="button"
                onClick={() => {
                  setPassword('admin');
                  setError(false);
                }}
                className="font-mono font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                admin / 1234 (Click to fill)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          Asghar Crockery Wholesale Distribution Hub • All rights reserved
        </div>
      </div>
    </div>
  );
}
