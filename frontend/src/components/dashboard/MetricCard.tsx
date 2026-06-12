'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeDirection?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  gradient?: string;
  index?: number;
}

export function MetricCard({
  title, value, change, changeDirection = 'neutral',
  icon: Icon, iconColor, iconBg, gradient, index = 0,
}: MetricCardProps) {
  const changeIcon = changeDirection === 'up'
    ? TrendingUp : changeDirection === 'down' ? TrendingDown : Minus;
  const ChangeIcon = changeIcon;
  const changeColor = changeDirection === 'up'
    ? 'text-accent-emerald' : changeDirection === 'down' ? 'text-accent-rose' : 'text-white/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      className="metric-card glass-card-hover relative overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      {gradient && (
        <div className={`absolute inset-0 ${gradient} opacity-[0.03] rounded-2xl`} />
      )}

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>

      {change && (
        <div className={cn('flex items-center gap-1.5 text-xs font-medium mt-1', changeColor)}>
          <ChangeIcon className="w-3 h-3" />
          <span>{change}</span>
        </div>
      )}
    </motion.div>
  );
}
