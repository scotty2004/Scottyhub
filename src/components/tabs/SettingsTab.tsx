import React, { useState } from 'react';
import { Bell, Code2, Database, Download, Fingerprint, HardDrive, Key, Lock, RefreshCw, Scan, Shield, ShieldCheck, Smartphone, Trash2, Volume2, Wifi } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsTab: React.FC = () => {
  const {
    platform,
    setPlatform,
    profile,
    updateProfile,
    isOnline,
    toggleOnline,
    cacheSizeMb,
    clearOfflineCache,
    triggerSync,
    offlineQueue,
    lockApp,
    openBiometricAuth,
    sendPushNotification,
    setIsCodeModalOpen,
  } = useApp();

  const [pinEditing, setPinEditing] = useState(false);
  const [newPin, setNewPin] = useState(profile.pinCode);

  const handlePinSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      updateProfile({ pinCode: newPin });
      setPinEditing(false);
      sendPushNotification('Passcode Updated', 'Your 4-digit security PIN has been updated.', 'security');
    }
  };

  return (
    <div className="min-h-full pb-20 text-white space-y-4 p-4">
      {/* Header */}
      <div className="pb-2 border-b border-white/10">
        <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
          <span>Settings & Mobile Architecture</span>
        </h2>
        <p className="text-xs text-slate-400">Configure React Native platform preview, biometric security, and offline cache.</p>
      </div>

      {/* 1. React Native Platform Switcher */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-300">Device Platform View</h3>
          </div>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{platform} Mode</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'ios', label: 'iOS (iPhone 16)' },
            { id: 'android', label: 'Android (Pixel 9)' },
            { id: 'fullscreen', label: 'Fullscreen Web' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id as any)}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition border ${
                platform === p.id
                  ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsCodeModalOpen(true)}
          className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-indigo-400 font-bold text-xs rounded-2xl transition border border-white/10 flex items-center justify-center gap-2"
        >
          <Code2 className="w-4 h-4" />
          <span>View React Native TypeScript Codebase</span>
        </button>
      </div>

      {/* 2. Biometric Security & Privacy */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-300">Biometric Privacy Lock</h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">Active</span>
        </div>

        <div className="space-y-2 text-xs">
          {/* Toggle Biometrics */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <div>
              <span className="font-semibold text-slate-200 block">Biometric Lock (Face ID / Fingerprint)</span>
              <span className="text-[10px] text-slate-400">Require scanner on app launch & data access</span>
            </div>
            <button
              onClick={() => {
                updateProfile({ biometricEnabled: !profile.biometricEnabled });
                sendPushNotification('Security Updated', 'Biometric privacy setting changed.', 'security');
              }}
              className={`w-11 h-6 rounded-full transition-colors p-1 relative ${
                profile.biometricEnabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  profile.biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Test Biometric Lock Button */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <div>
              <span className="font-semibold text-slate-200 block">Trigger Biometric Screen Lock</span>
              <span className="text-[10px] text-slate-400">Test Face ID / Fingerprint scanning overlay</span>
            </div>
            <button
              onClick={lockApp}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-lg shadow-indigo-500/20 border border-indigo-400/30"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Now</span>
            </button>
          </div>

          {/* Passcode PIN Change */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Fallback Security PIN</span>
                <span className="text-[10px] text-slate-400">Current PIN: ****</span>
              </div>
              <button
                onClick={() => setPinEditing(!pinEditing)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                {pinEditing ? 'Cancel' : 'Change PIN'}
              </button>
            </div>

            {pinEditing && (
              <form onSubmit={handlePinSave} className="flex items-center gap-2 pt-2 border-t border-white/10">
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="4 digits (e.g. 1234)"
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-32"
                />
                <button
                  type="submit"
                  disabled={newPin.length !== 4}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-500/20"
                >
                  Save PIN
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. Offline Support & Local Data Storage */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-300">Offline & Cache Storage</h3>
          </div>
          <span className="text-[10px] text-indigo-400 font-bold">{cacheSizeMb} MB Cached</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <div>
              <span className="font-semibold text-slate-200 block">Simulated Network Connection</span>
              <span className="text-[10px] text-slate-400">{isOnline ? 'Connected to ScottHub Cloud' : 'Disconnected (Offline Mode)'}</span>
            </div>
            <button
              onClick={toggleOnline}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <div>
              <span className="font-semibold text-slate-200 block">Outbox Sync Queue</span>
              <span className="text-[10px] text-slate-400">{offlineQueue.length} pending actions queued</span>
            </div>
            <button
              onClick={triggerSync}
              disabled={offlineQueue.length === 0}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-md shadow-indigo-500/20 border border-indigo-400/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Queue</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <div>
              <span className="font-semibold text-slate-200 block">Clear Local Offline Cache</span>
              <span className="text-[10px] text-slate-400">Purge offline downloaded courses & cached data</span>
            </div>
            <button
              onClick={clearOfflineCache}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Push Notifications Preferences */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-300">Push Notification Engine</h3>
          </div>
          <button
            onClick={() => sendPushNotification('Test Push Banner', 'Real-time notification engine working!', 'system')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
          >
            Test Push
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-slate-200 block">Real-Time In-App Alert Banners</span>
            <span className="text-[10px] text-slate-400">iOS Dynamic Island & Android Heads-up Alerts</span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-[10px] border border-emerald-500/30">Enabled</span>
        </div>
      </div>
    </div>
  );
};
