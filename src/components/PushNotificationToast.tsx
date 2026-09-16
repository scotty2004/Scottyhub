import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, BellOff, ShieldAlert, Sparkles, Volume2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PushNotificationToast: React.FC = () => {
  const { activePushToast, dismissPushToast, setActiveTab, platform } = useApp();
  const [soundMuted, setSoundMuted] = useState(false);

  useEffect(() => {
    if (activePushToast) {
      const timer = setTimeout(() => {
        dismissPushToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activePushToast]);

  if (!activePushToast) return null;

  const handleToastClick = () => {
    if (activePushToast.type === 'connect') setActiveTab('connect');
    else if (activePushToast.type === 'learn') setActiveTab('learn');
    else if (activePushToast.type === 'grow') setActiveTab('grow');
    else if (activePushToast.type === 'security') setActiveTab('settings');
    dismissPushToast();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -60, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-12 left-3 right-3 z-40 cursor-pointer"
        onClick={handleToastClick}
      >
        <div
          className={`relative overflow-hidden rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl border border-slate-700/60 text-white ${
            platform === 'ios'
              ? 'bg-slate-900/90 shadow-black/80'
              : 'bg-slate-900/95 border-blue-500/30 shadow-blue-900/30'
          }`}
        >
          {/* Subtle glowing accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
              {activePushToast.type === 'security' ? (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              ) : activePushToast.type === 'grow' ? (
                <Sparkles className="w-5 h-5 text-emerald-400" />
              ) : (
                <Bell className="w-5 h-5 text-cyan-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  ScottHub • {activePushToast.type}
                </span>
                <span className="text-[10px] text-slate-400">{activePushToast.timestamp}</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-100 truncate">{activePushToast.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-snug">{activePushToast.message}</p>
            </div>

            {/* Mute & Dismiss Controls */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSoundMuted(!soundMuted)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title={soundMuted ? 'Unmute alerts' : 'Mute alert sounds'}
              >
                {soundMuted ? <BellOff className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={dismissPushToast}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
