'use client';

import { motion } from 'framer-motion';
import { Play, Pause, Loader2, Cpu, Calendar, Target } from 'lucide-react';
import type { SimulationState } from '@/types/simulation';

interface SimulationStatusProps {
  simulation: SimulationState | null;
  onStart: () => Promise<void>;
  onPause: () => Promise<void>;
  isActionLoading: boolean;
}

export function SimulationStatus({ simulation, onStart, onPause, isActionLoading }: SimulationStatusProps) {
  const isRunning = simulation?.isRunning ?? false;
  const day = simulation?.simulationDay ?? 0;
  const round = simulation?.fundingRound ?? 'pre-seed';
  const runway = simulation?.runwayMonths ?? 0;
  const popularity = simulation?.popularityScore ?? 0;
  const investorInterest = simulation?.investorInterest ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">Simulation Status</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-accent-emerald animate-pulse' : 'bg-white/20'}`} />
            <span className="text-xs text-white/40">
              {isRunning ? 'Running' : 'Paused'}
            </span>
          </div>
        </div>

        <button
          id={isRunning ? 'pause-simulation' : 'start-simulation'}
          onClick={isRunning ? onPause : onStart}
          disabled={isActionLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isRunning
              ? 'bg-surface-3 text-white/70 hover:bg-surface-4 hover:text-white border border-white/10'
              : 'btn-primary'
          }`}
        >
          {isActionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isRunning ? (
            <><Pause className="w-4 h-4" /> Pause</>
          ) : (
            <><Play className="w-4 h-4" /> Run Sim</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-2 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
            <Calendar className="w-3 h-3" /> Day
          </div>
          <span className="text-lg font-bold text-white">{day}</span>
        </div>
        <div className="bg-surface-2 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
            <Target className="w-3 h-3" /> Round
          </div>
          <span className="text-sm font-bold text-accent-violet capitalize">{round.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/40">Popularity</span>
            <span className="text-white/70 font-medium">{popularity.toFixed(0)}/100</span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-brand rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${popularity}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/40">Investor Interest</span>
            <span className="text-white/70 font-medium">{investorInterest.toFixed(0)}/100</span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-emerald rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${investorInterest}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/40">Runway</span>
            <span className={`font-medium text-xs ${runway <= 3 ? 'text-accent-rose' : runway <= 6 ? 'text-accent-amber' : 'text-accent-emerald'}`}>
              {runway} months
            </span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${runway <= 3 ? 'bg-gradient-rose' : runway <= 6 ? 'bg-gradient-amber' : 'bg-gradient-emerald'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (runway / 24) * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
