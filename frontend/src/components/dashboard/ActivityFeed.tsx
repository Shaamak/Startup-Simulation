'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Zap, Users, DollarSign, AlertTriangle, Trophy, Award } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { SimulationEvent } from '@/types/simulation';

const EVENT_ICONS: Record<string, { icon: typeof Zap; color: string; bg: string }> = {
  viral: { icon: Zap, color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
  funding: { icon: DollarSign, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  investor: { icon: Trophy, color: 'text-accent-violet', bg: 'bg-accent-violet/10' },
  press: { icon: Award, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
  competitor: { icon: AlertTriangle, color: 'text-accent-rose', bg: 'bg-accent-rose/10' },
  churn: { icon: TrendingDown, color: 'text-accent-rose', bg: 'bg-accent-rose/10' },
  milestone: { icon: Trophy, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  default: { icon: Minus, color: 'text-white/40', bg: 'bg-white/5' },
};

interface ActivityFeedProps {
  events: SimulationEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">Activity Feed</h3>
          <p className="text-xs text-white/40 mt-0.5">Real-time simulation events</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {events.length === 0 ? (
            <div className="text-center py-10 text-white/25 text-sm">
              Events will appear here once simulation starts
            </div>
          ) : (
            events.map((event) => {
              const config = EVENT_ICONS[event.eventType] ?? EVENT_ICONS.default;
              const Icon = config.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3 group"
                >
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white leading-snug">{event.title}</p>
                      <span className="text-xs text-white/25 flex-shrink-0 mt-0.5">
                        {timeAgo(event.occurredAt)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{event.description}</p>
                    )}
                    <div className="mt-1.5">
                      <span className={
                        event.impact === 'positive' ? 'badge-positive' :
                        event.impact === 'negative' ? 'badge-negative' : 'badge-neutral'
                      }>
                        {event.impact === 'positive' ? (
                          <TrendingUp className="w-2.5 h-2.5" />
                        ) : event.impact === 'negative' ? (
                          <TrendingDown className="w-2.5 h-2.5" />
                        ) : (
                          <Minus className="w-2.5 h-2.5" />
                        )}
                        {event.impact}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
