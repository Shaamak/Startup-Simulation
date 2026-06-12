'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Rocket, DollarSign, Users, TrendingUp, BarChart2, Building2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { SimulationStatus } from '@/components/dashboard/SimulationStatus';
import type { Startup } from '@/types/startup';
import type { SimulationState, SimulationMetric, SimulationEvent } from '@/types/simulation';

export default function DashboardPage() {
  const { user } = useAuth();
  const { joinStartup, leaveStartup, onSimulationTick, onSimulationEvent } = useSocket();

  const [startups, setStartups] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [metrics, setMetrics] = useState<SimulationMetric[]>([]);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch startups on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.startups.list();
        setStartups(data.data);
        if (data.data.length > 0) {
          setSelectedStartup(data.data[0]);
        }
      } catch {}
      setIsLoading(false);
    };
    load();
  }, []);

  // Load simulation data when startup changes
  useEffect(() => {
    if (!selectedStartup) return;

    const load = async () => {
      try {
        const [simRes, metricsRes, eventsRes] = await Promise.all([
          api.simulations.getState(selectedStartup.id),
          api.simulations.getMetrics(selectedStartup.id),
          api.simulations.getEvents(selectedStartup.id),
        ]);

        const simData = simRes.data.data;
        setSimulation({
          id: simData.id,
          startupId: simData.startup_id,
          isRunning: simData.is_running,
          simulationDay: simData.simulation_day,
          customers: simData.customers,
          mrr: simData.mrr,
          arr: simData.arr,
          churnRate: simData.churn_rate,
          valuation: simData.valuation,
          runwayMonths: simData.runway_months,
          popularityScore: simData.popularity_score,
          investorInterest: simData.investor_interest,
          fundingRaised: simData.funding_raised,
          fundingRound: simData.funding_round,
          totalRevenue: simData.total_revenue,
          burnRate: simData.burn_rate,
          lastUpdated: simData.last_updated,
        });

        setMetrics(metricsRes.data.data.map((m: Record<string, unknown>) => ({
          id: m.id as string,
          startupId: m.startup_id as string,
          day: m.day as number,
          customers: m.customers as number,
          mrr: m.mrr as number,
          churnRate: m.churn_rate as number,
          valuation: m.valuation as number,
          burnRate: m.burn_rate as number,
          recordedAt: m.recorded_at as string,
        })));

        setEvents(eventsRes.data.data.map((e: Record<string, unknown>) => ({
          id: e.id as string,
          startupId: e.startup_id as string,
          eventType: e.event_type as string,
          title: e.title as string,
          description: e.description as string | null,
          impact: e.impact as 'positive' | 'negative' | 'neutral',
          metadata: (e.metadata ?? {}) as Record<string, unknown>,
          occurredAt: e.occurred_at as string,
        })));
      } catch {}
    };

    load();
    joinStartup(selectedStartup.id);

    // Real-time tick handler
    const unsubTick = onSimulationTick((raw) => {
      const d = raw as Record<string, unknown>;
      setSimulation((prev) => prev ? {
        ...prev,
        isRunning: d.is_running as boolean,
        simulationDay: d.simulation_day as number,
        customers: d.customers as number,
        mrr: d.mrr as number,
        arr: d.arr as number,
        churnRate: d.churn_rate as number,
        valuation: d.valuation as number,
        runwayMonths: d.runway_months as number,
        popularityScore: d.popularity_score as number,
        investorInterest: d.investor_interest as number,
        fundingRaised: d.funding_raised as number,
        fundingRound: d.funding_round as string,
        totalRevenue: d.total_revenue as number,
        burnRate: d.burn_rate as number,
        lastUpdated: d.last_updated as string,
      } : null);

      // Append new metric snapshot
      setMetrics((prev) => [...prev, {
        id: crypto.randomUUID(),
        startupId: d.startup_id as string,
        day: d.simulation_day as number,
        customers: d.customers as number,
        mrr: d.mrr as number,
        churnRate: d.churn_rate as number,
        valuation: d.valuation as number,
        burnRate: d.burn_rate as number,
        recordedAt: new Date().toISOString(),
      }].slice(-90));
    });

    // Real-time event handler
    const unsubEvent = onSimulationEvent((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 30));
    });

    return () => {
      unsubTick();
      unsubEvent();
      leaveStartup(selectedStartup.id);
    };
  }, [selectedStartup, joinStartup, leaveStartup, onSimulationTick, onSimulationEvent]);

  const handleStart = useCallback(async () => {
    if (!selectedStartup) return;
    setIsActionLoading(true);
    try {
      await api.simulations.start(selectedStartup.id);
      setSimulation((prev) => prev ? { ...prev, isRunning: true } : prev);
    } catch (err: unknown) {
      console.error('Failed to start simulation:', err);
    }
    setIsActionLoading(false);
  }, [selectedStartup]);

  const handlePause = useCallback(async () => {
    if (!selectedStartup) return;
    setIsActionLoading(true);
    try {
      await api.simulations.pause(selectedStartup.id);
      setSimulation((prev) => prev ? { ...prev, isRunning: false } : prev);
    } catch {}
    setIsActionLoading(false);
  }, [selectedStartup]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30">
        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mr-3" />
        Loading dashboard...
      </div>
    );
  }

  if (startups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 border border-brand-500/20">
          <Rocket className="w-10 h-10 text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Launch Your First Startup</h2>
        <p className="text-white/40 max-w-sm mb-8 leading-relaxed">
          Create your virtual startup and let the AI simulate its growth, revenue, and market dynamics.
        </p>
        <Link href="/startup/create" id="create-first-startup" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Startup
        </Link>
      </div>
    );
  }

  const metrics4 = [
    {
      title: 'Monthly Revenue',
      value: formatCurrency(simulation?.mrr ?? 0, true),
      change: `${formatCurrency(simulation?.arr ?? 0, true)} ARR`,
      changeDirection: 'up' as const,
      icon: DollarSign,
      iconColor: 'text-accent-emerald',
      iconBg: 'bg-accent-emerald/10',
      gradient: 'bg-gradient-emerald',
    },
    {
      title: 'Total Customers',
      value: formatNumber(simulation?.customers ?? 0),
      change: `${formatPercent(simulation?.churnRate ?? 0)} churn`,
      changeDirection: (simulation?.churnRate ?? 0) > 0.1 ? 'down' as const : 'up' as const,
      icon: Users,
      iconColor: 'text-accent-cyan',
      iconBg: 'bg-accent-cyan/10',
      gradient: 'bg-gradient-brand',
    },
    {
      title: 'Valuation',
      value: formatCurrency(simulation?.valuation ?? 0, true),
      change: `${simulation?.fundingRound?.replace('-', ' ')} round`,
      changeDirection: 'up' as const,
      icon: TrendingUp,
      iconColor: 'text-brand-400',
      iconBg: 'bg-brand-500/10',
      gradient: 'bg-gradient-brand',
    },
    {
      title: 'Funding Raised',
      value: formatCurrency(simulation?.fundingRaised ?? 0, true),
      change: `${simulation?.runwayMonths ?? 0}mo runway`,
      changeDirection: (simulation?.runwayMonths ?? 24) <= 6 ? 'down' as const : 'neutral' as const,
      icon: BarChart2,
      iconColor: 'text-accent-amber',
      iconBg: 'bg-accent-amber/10',
      gradient: 'bg-gradient-amber',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            Welcome back, {user?.fullName ? user.fullName.split(' ')[0] : ''} 👋
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Startup selector */}
          {startups.length > 1 && (
            <select
              id="startup-selector"
              value={selectedStartup?.id ?? ''}
              onChange={(e) => {
                const s = startups.find((st) => st.id === e.target.value);
                if (s) setSelectedStartup(s);
              }}
              className="input-field py-2 text-sm max-w-48"
            >
              {startups.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          <Link href="/startup/create" id="add-startup" className="btn-primary flex items-center gap-2 text-sm py-2.5">
            <Plus className="w-3.5 h-3.5" />
            New Startup
          </Link>
        </div>
      </div>

      {/* Startup name banner */}
      {selectedStartup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card-hover px-5 py-4 flex items-center gap-4"
        >
          <Link href={`/startup/${selectedStartup.id}`} className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-white hover:text-brand-300 transition-colors">{selectedStartup.name}</h2>
              <p className="text-xs text-white/40">
                {selectedStartup.industry} · {selectedStartup.pricingModel} · {selectedStartup.category}
              </p>
            </div>
          </Link>
          <div className="ml-auto">
            <span className={`badge-${selectedStartup.status === 'active' ? 'positive' : 'neutral'}`}>
              {selectedStartup.status}
            </span>
          </div>
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics4.map((m, i) => (
          <MetricCard key={m.title} {...m} index={i} />
        ))}
      </div>

      {/* Charts + Status row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart metrics={metrics} />
        </div>
        <SimulationStatus
          simulation={simulation}
          onStart={handleStart}
          onPause={handlePause}
          isActionLoading={isActionLoading}
        />
      </div>

      {/* Activity Feed */}
      <ActivityFeed events={events} />
    </div>
  );
}
