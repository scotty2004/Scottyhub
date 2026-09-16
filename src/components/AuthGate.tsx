/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Real login/register screen for the ScottyHub backend. Visually it
 * follows the same pattern already used by the biometric lock screen
 * in MobileDeviceFrame.tsx (logo badge, glass panel, gradient CTA
 * button) so it doesn't introduce a new design language.
 */
import React, { useState } from 'react';
import { Loader2, Lock, LogIn, Mail, ShieldCheck, User as UserIcon, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

const logoPath = '/src/assets/images/scotthub_logo_1786462155195.jpg';

type Mode = 'login' | 'register' | 'verify';

export const AuthGate: React.FC = () => {
  const { login, register, verify, authError, authLoading, pendingVerifyUserId } = useApp();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email.trim(), password);
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(username.trim(), email.trim(), password);
    if (ok) setMode('verify');
  };

  const submitVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await verify(otp.trim());
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-white overflow-y-auto scrollbar-none">
      <div className="w-full max-w-xs space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <img
              src={logoPath}
              alt="ScottHub Logo"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-3xl border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/30 object-cover"
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-600 text-white rounded-xl shadow-lg border border-indigo-400/40">
              <Lock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold block mb-1">
              ScottyHub Account
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Verify Email'}
            </h2>
          </div>
        </div>

        {authError && (
          <div className="px-3 py-2 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">
            {authError}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={submitLogin} className="space-y-3">
            <label className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/70 border border-white/10 focus-within:border-indigo-500/50">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
              />
            </label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/70 border border-white/10 focus-within:border-indigo-500/50">
              <KeyRound className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
              />
            </label>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2 border border-indigo-400/30 active:scale-[0.98] disabled:opacity-60"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Log In</span>
            </button>
            <p className="text-center text-xs text-slate-500">
              New here?{' '}
              <button type="button" onClick={() => setMode('register')} className="text-indigo-400 font-semibold">
                Create an account
              </button>
            </p>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={submitRegister} className="space-y-3">
            <label className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/70 border border-white/10 focus-within:border-indigo-500/50">
              <UserIcon className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
              />
            </label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/70 border border-white/10 focus-within:border-indigo-500/50">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
              />
            </label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/70 border border-white/10 focus-within:border-indigo-500/50">
              <KeyRound className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
              />
            </label>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2 border border-indigo-400/30 active:scale-[0.98] disabled:opacity-60"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Sign Up</span>
            </button>
            <p className="text-center text-xs text-slate-500">
              Already onboard?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-indigo-400 font-semibold">
                Log in
              </button>
            </p>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={submitVerify} className="space-y-3">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              We sent a 6-digit code to <span className="text-slate-200">{email}</span>. Enter it below to verify your
              account.
            </p>
            <label className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/70 border border-white/10 focus-within:border-indigo-500/50">
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                className="bg-transparent outline-none text-sm w-full tracking-[0.3em] placeholder:text-slate-500 placeholder:tracking-normal"
              />
            </label>
            <button
              type="submit"
              disabled={authLoading || !pendingVerifyUserId}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2 border border-indigo-400/30 active:scale-[0.98] disabled:opacity-60"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Verify & Continue</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
