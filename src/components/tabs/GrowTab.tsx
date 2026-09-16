import React from 'react';
import { motion } from 'motion/react';
import { Award, BookOpen, Check, Flame, MessageSquare, ShieldCheck, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GrowTab: React.FC = () => {
  const { habits, toggleHabit, profile } = useApp();

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-full pb-20 text-white space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Grow Analytics</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-wider">
              Daily Streaks
            </span>
          </h2>
          <p className="text-xs text-slate-400">Track habit consistency, long-term goals, and milestone achievements.</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-xs font-bold shadow-sm">
          <Flame className="w-4 h-4 fill-amber-500 animate-bounce" />
          <span>{profile.streakDays} Days</span>
        </div>
      </div>

      {/* Hero Overview */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-slate-950 border border-emerald-500/30 backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-emerald-400 block">Today's Progress</span>
            <h3 className="text-lg font-bold text-white">{completedCount} of {totalCount} Habits Checked In</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-sm shadow-md">
            {completionRate}%
          </div>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-400 transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Habits Checklist */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-400 px-1">Active Habit Goals</h4>

        {habits.map((habit) => (
          <motion.div
            key={habit.id}
            whileHover={{ scale: 1.01 }}
            className={`p-4 rounded-3xl border backdrop-blur-2xl transition flex items-center justify-between gap-3 ${
              habit.completedToday
                ? 'bg-slate-900/70 border-emerald-500/40'
                : 'bg-slate-900/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition border ${
                  habit.completedToday
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800/80 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <Check className="w-5 h-5 stroke-[3]" />
              </button>

              <div>
                <h5 className={`text-xs font-bold ${habit.completedToday ? 'text-emerald-300 line-through opacity-80' : 'text-slate-100'}`}>
                  {habit.title}
                </h5>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/5 text-slate-300 font-semibold">
                    {habit.category}
                  </span>
                  <span>{habit.targetDaysPerWeek}x / week</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shrink-0">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{habit.streak}d</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Achievements Milestones */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl space-y-3">
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-400">Milestone Badges</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">14-Day Streak</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Unlocked</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Biometrics Verified</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Unlocked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
