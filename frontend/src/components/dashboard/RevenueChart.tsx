'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import type { SimulationMetric } from '@/types/simulation';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface RevenueChartProps {
  metrics: SimulationMetric[];
}

type ChartTab = 'revenue' | 'customers' | 'valuation';

const TABS: { key: ChartTab; label: string }[] = [
  { key: 'revenue', label: 'Revenue (MRR)' },
  { key: 'customers', label: 'Customers' },
  { key: 'valuation', label: 'Valuation' },
];

// Custom tooltip
function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-xs">
      <p className="text-white/40 mb-2">Day {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="text-white font-semibold">
            {p.name.includes('MRR') || p.name.includes('Valuation')
              ? formatCurrency(p.value, true)
              : formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({ metrics }: RevenueChartProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('revenue');

  const chartData = metrics.map((m) => ({
    day: m.day,
    mrr: m.mrr,
    customers: m.customers,
    valuation: m.valuation,
    churnRate: Number((m.churnRate * 100).toFixed(2)),
  }));

  const config: Record<ChartTab, { key: string; label: string; color: string; gradient: string[] }> = {
    revenue: { key: 'mrr', label: 'MRR', color: '#6358f5', gradient: ['#6358f5', '#6358f510'] },
    customers: { key: 'customers', label: 'Customers', color: '#34d399', gradient: ['#34d399', '#34d39910'] },
    valuation: { key: 'valuation', label: 'Valuation', color: '#f59e0b', gradient: ['#f59e0b', '#f59e0b10'] },
  };

  const active = config[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Growth Analytics</h3>
          <p className="text-xs text-white/40 mt-0.5">Historical simulation data</p>
        </div>
        <div className="flex gap-1 bg-surface-2 rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              id={`chart-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-white/30 text-sm">
          Start simulation to see data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`grad-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={active.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={active.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="day"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `D${v}`}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => activeTab === 'customers' ? formatNumber(v) : formatCurrency(v, true)}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={active.key}
              name={active.label}
              stroke={active.color}
              strokeWidth={2}
              fill={`url(#grad-${activeTab})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: active.color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
