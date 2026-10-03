import React, { useState } from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  ShieldCheck,
  UserCheck,
  Stethoscope,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  LogIn,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, register } = useSafeBand();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'caregiver' | 'wearer'>('caregiver');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          setError('Please enter your email and password.');
          setIsSubmitting(false);
          return;
        }
        await login(role, email.trim(), password);
      } else {
        if (!name.trim() || !email.trim() || !password) {
          setError('Please complete all required fields (Name, Email, Password).');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Firebase password must be at least 6 characters long.');
          setIsSubmitting(false);
          return;
        }
        await register(name.trim(), email.trim(), role, phone || '+1 (415) 555-0100', password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background ambient medical glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* SafeBand Brand Lockup */}
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 mb-4 shadow-lg shadow-cyan-950/40">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          SafeBand Sentinel
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Medical IoT Telemetry, Automated Fall Guard & Emergency Dispatch
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In (Existing User)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New User</span>
            </button>
          </div>

          {/* Role Selection */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('caregiver')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  role === 'caregiver'
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                Caregiver / Doctor
              </button>
              <button
                type="button"
                onClick={() => setRole('wearer')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  role === 'wearer'
                    ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                Band Wearer
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'caregiver' ? 'Dr. Elena Vance, RN' : 'Robert Vance'}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'caregiver' ? 'caregiver@safeband.care' : 'wearer@safeband.care'}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Emergency Contact Phone (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (415) 555-0198"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Password *
                </label>
                <span className="text-[11px] text-slate-500">
                  {mode === 'register' ? 'Min 6 characters' : ''}
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer mt-6 ${
                isSubmitting
                  ? 'bg-cyan-800 cursor-not-allowed opacity-80'
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950/50'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating with Firebase...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'Sign In to SafeBand Console'
                      : 'Create Account & Activate Band'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Real Firebase Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Firebase Auth Active:</span> All sessions are verified using official Firebase Authentication tokens. Realtime Database rules enforce authenticated access (<span className="font-mono text-cyan-300">auth != null</span>).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
