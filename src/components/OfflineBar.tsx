import React from 'react';
import { Cloud, CloudOff, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OfflineBar: React.FC = () => {
  const { isOnline, toggleOnline, offlineQueue, triggerSync, cacheSizeMb } = useApp();

  return (
    <div className="bg-slate-900/80 border-b border-slate-800/80 px-3 py-1.5 backdrop-blur-md flex items-center justify-between text-xs text-slate-300">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleOnline}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition ${
            isOnline
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
          }`}
          title="Click to toggle Network Simulation mode"
        >
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isOnline ? 'Online (Connected)' : 'Offline (Cached)'}</span>
        </button>

        {offlineQueue.length > 0 && (
          <div className="flex items-center gap-1.5 text-amber-300 text-[11px]">
            <CloudOff className="w-3 h-3" />
            <span>{offlineQueue.length} pending sync</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400 hidden sm:inline">{cacheSizeMb} MB cached</span>

        {offlineQueue.length > 0 && isOnline && (
          <button
            onClick={triggerSync}
            className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[10px] font-semibold transition"
          >
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            <span>Sync Now</span>
          </button>
        )}
      </div>
    </div>
  );
};
