import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  LayoutGrid,
  ShoppingBag,
  Video,
  BarChart2,
  Rocket,
  MessageSquare,
  CreditCard,
  Newspaper,
  Bell,
  Music,
  Globe,
  Download,
  Wrench,
  Heart,
  TrendingUp,
  Settings,
  HelpCircle,
  Shield,
  Bot,
  Sparkles,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ScottyDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    setActiveToolModal,
    setActiveTab,
    profile,
    unreadCount,
    theme,
    toggleTheme,
  } = useApp();

  if (!isDrawerOpen) return null;

  const handleNavClick = (modalId?: string, tabId?: any) => {
    setIsDrawerOpen(false);
    if (tabId) {
      setActiveTab(tabId);
    }
    if (modalId) {
      setActiveToolModal(modalId);
    } else if (!tabId) {
      setActiveTab('home');
      setActiveToolModal(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-[280px] max-w-[85vw] h-full bg-slate-950/95 border-r border-white/10 shadow-2xl flex flex-col z-10 text-slate-200 overflow-y-auto scrollbar-none"
        >
          {/* Top User Profile Header */}
          <div className="p-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                C
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Cajo</span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  ScottyHub VIP
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Streak Bar */}
          <div className="px-4 py-2.5 bg-slate-900/40 border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
              <span>{profile.streakDays} Day Streak</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1 px-2 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          {/* Navigation Links List */}
          <div className="p-3 space-y-4 text-xs font-semibold">
            {/* Main Menu */}
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 text-cyan-400 font-bold border border-cyan-500/20"
              >
                <LayoutGrid className="w-4 h-4 text-cyan-400" />
                <span className="uppercase tracking-wider text-[11px]">DASHBOARD</span>
              </button>

              <button
                onClick={() => handleNavClick('marketplace')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span className="uppercase tracking-wider text-[11px]">MARKETPLACE</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <button
                onClick={() => handleNavClick('watch-movies')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 text-rose-400" />
                  <span className="uppercase tracking-wider text-[11px]">BLOG & MOVIES</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <button
                onClick={() => handleNavClick('client-portal')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  <span className="uppercase tracking-wider text-[11px]">CLIENT PORTAL</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <button
                onClick={() => handleNavClick('smm-panel')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Rocket className="w-4 h-4 text-purple-400" />
                  <span className="uppercase tracking-wider text-[11px]">SMM PANEL</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30 font-bold">
                  HOT
                </span>
              </button>
            </div>

            {/* Section: COMMUNITY */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-500 px-3 block">
                COMMUNITY
              </span>

              <button
                onClick={() => handleNavClick('community-feed', 'connect')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="uppercase tracking-wider text-[11px]">COMMUNITY</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('payments')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span className="uppercase tracking-wider text-[11px]">PAYMENTS</span>
                </div>
              </button>
            </div>

            {/* Section: UPDATES */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-500 px-3 block">
                UPDATES
              </span>

              <button
                onClick={() => handleNavClick('news')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Newspaper className="w-4 h-4 text-amber-400" />
                  <span className="uppercase tracking-wider text-[11px]">NEWS & ANNOUNCEMENTS</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('notifications-list')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-rose-400" />
                  <span className="uppercase tracking-wider text-[11px]">NOTIFICATIONS</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Section: ENTERTAINMENT */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-500 px-3 block">
                ENTERTAINMENT
              </span>

              <button
                onClick={() => handleNavClick('music-sports')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Music className="w-4 h-4 text-pink-400" />
                  <span className="uppercase tracking-wider text-[11px]">MUSIC</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('music-sports')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="uppercase tracking-wider text-[11px]">SPORTS</span>
                </div>
              </button>
            </div>

            {/* Section: TOOLS */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-500 px-3 block">
                TOOLS
              </span>

              <button
                onClick={() => handleNavClick('downloader')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span className="uppercase tracking-wider text-[11px]">DOWNLOADER</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('free-tools')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span className="uppercase tracking-wider text-[11px]">FREE TOOLS</span>
                </div>
              </button>
            </div>

            {/* Section: ACCOUNT */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-500 px-3 block">
                ACCOUNT
              </span>

              <button
                onClick={() => handleNavClick('earn-referrals')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="uppercase tracking-wider text-[11px]">EARN MONEY</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('analytics')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="uppercase tracking-wider text-[11px]">ANALYTICS</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick(undefined, 'settings')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="uppercase tracking-wider text-[11px]">SETTINGS</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('support')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span className="uppercase tracking-wider text-[11px]">SUPPORT</span>
                </div>
              </button>
            </div>

            {/* ADMIN PANEL Card at Bottom */}
            <div className="pt-2">
              <button
                onClick={() => handleNavClick('admin-panel')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/40 transition shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <span className="uppercase tracking-wider text-[11px] font-bold">
                    ADMIN PANEL
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">SECURE</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
