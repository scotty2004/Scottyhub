import React from 'react';
import { motion } from 'motion/react';
import {
  Bot,
  Cpu,
  Sparkles,
  Download,
  Film,
  TrendingUp,
  Heart,
  Wrench,
  MessageSquare,
  Flame,
  ArrowRight,
  ShieldCheck,
  Wifi,
  WifiOff,
  CloudOff,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HomeTab: React.FC = () => {
  const {
    profile,
    setActiveTab,
    setActiveToolModal,
    isOnline,
    offlineQueue,
    isLocked,
    openBiometricAuth,
    lockApp,
    sendPushNotification,
    triggerSync,
  } = useApp();

  const wallpaperPath = '/src/assets/images/scotthub_wallpaper_1786462116529.jpg';

  const dashboardCards = [
    {
      id: 'get-a-bot',
      toolModal: 'bot-deployer',
      title: 'Get a Bot',
      description: 'Deploy your WhatsApp bot today',
      icon: Bot,
      iconBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
      btnColor: 'text-orange-400 group-hover:text-orange-300',
    },
    {
      id: 'bot-rebrander',
      toolModal: 'bot-deployer',
      title: 'Bot Rebrander',
      description: 'Generate a custom-branded bot',
      icon: Cpu,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      btnColor: 'text-emerald-400 group-hover:text-emerald-300',
    },
    {
      id: 'ai-chat',
      toolModal: 'ai-chat',
      title: 'AI Chat',
      description: 'Ask ScottyAI anything',
      icon: Sparkles,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      btnColor: 'text-emerald-400 group-hover:text-emerald-300',
    },
    {
      id: 'downloader',
      toolModal: 'downloader',
      title: 'Downloader',
      description: 'YouTube & TikTok downloads',
      icon: Download,
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      btnColor: 'text-cyan-400 group-hover:text-cyan-300',
    },
    {
      id: 'watch-movies',
      toolModal: 'watch-movies',
      title: 'Watch Movies',
      description: 'Browse trending movies & series',
      icon: Film,
      iconBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
      btnColor: 'text-orange-400 group-hover:text-orange-300',
    },
    {
      id: 'crypto-forex',
      toolModal: 'crypto-forex',
      title: 'Crypto & Forex',
      description: 'Live prices & ZWL rates',
      icon: TrendingUp,
      iconBg: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
      btnColor: 'text-pink-400 group-hover:text-pink-300',
    },
    {
      id: 'earn-referrals',
      toolModal: 'earn-referrals',
      title: 'Earn Referrals',
      description: 'Share your referral link & earn',
      icon: Heart,
      iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
      btnColor: 'text-blue-400 group-hover:text-blue-300',
    },
    {
      id: 'free-tools',
      toolModal: 'free-tools',
      title: 'Free Tools',
      description: 'QR codes, URL shortener',
      icon: Wrench,
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      btnColor: 'text-cyan-400 group-hover:text-cyan-300',
    },
    {
      id: 'community',
      toolModal: 'community-feed',
      tabAction: 'connect',
      title: 'Community',
      description: 'Connect with ScottyHub users',
      icon: MessageSquare,
      iconBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
      btnColor: 'text-orange-400 group-hover:text-orange-300',
    },
  ];

  return (
    <div className="relative min-h-full pb-20 text-white overflow-hidden select-none">
      {/* Background Wallpaper Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={wallpaperPath}
          alt="ScottHub Wallpaper"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30 filter contrast-110 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-3.5 space-y-4">
        {/* User Greeting & Status Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md border border-white/10">
              C
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h2 className="text-sm font-bold tracking-tight text-white">Cajo</h2>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">scottyhub.co.zw • Online</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 animate-pulse" />
              <span>{profile.streakDays}d</span>
            </div>
          </div>
        </div>

        {/* Dashboard 2-Column Grid (Exact layout from Screenshot 1) */}
        <div className="grid grid-cols-2 gap-3">
          {dashboardCards.map((card) => {
            const IconComp = card.icon;

            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (card.tabAction) {
                    setActiveTab(card.tabAction as any);
                  }
                  if (card.toolModal) {
                    setActiveToolModal(card.toolModal);
                  }
                }}
                className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-3 cursor-pointer group transition duration-200"
              >
                <div className="space-y-2">
                  <div className={`p-2.5 rounded-xl border w-fit ${card.iconBg}`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                      {card.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-1 text-[11px] font-extrabold tracking-wider ${card.btnColor}`}>
                  <span>ACCESS</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Sync & Quick Notification Action Panel */}
        <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System Health & Caching
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              {isOnline ? 'Connected' : 'Offline Local Mode'}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() =>
                sendPushNotification('ScottyHub Push', 'Real-time notification engine active!', 'system')
              }
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[11px] rounded-xl transition border border-white/5 flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Test Push Alert</span>
            </button>

            {offlineQueue.length > 0 && (
              <button
                onClick={triggerSync}
                className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Queue ({offlineQueue.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
