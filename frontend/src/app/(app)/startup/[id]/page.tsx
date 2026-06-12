'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Building2, DollarSign, Users, TrendingUp,
  BarChart2, Calendar, Edit3, Trash2, Loader2, Play, Pause,
  Globe, Target, Zap
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { SimulationStatus } from '@/components/dashboard/SimulationStatus';
import { useSocket } from '@/contexts/SocketContext';
import type { Startup } from '@/types/startup';
import type { SimulationState, SimulationMetric, SimulationEvent } from '@/types/simulation';

export default function StartupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { joinStartup, leaveStartup, onSimulationTick, onSimulationEvent } = useSocket();

  const [startup, setStartup] = useState<Startup | null>(null);
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [metrics, setMetrics] = useState<SimulationMetric[]>([]);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [startupRes, simRes, metricsRes, eventsRes] = await Promise.all([
          api.startups.getById(id),
          api.simulations.getState(id),
          api.simulations.getMetrics(id),
          api.simulations.getEvents(id),
        ]);

        setStartup(startupRes.data.data);

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
      } catch {
        router.replace('/dashboard');
      }
      setIsLoading(false);
    };

    load();
    joinStartup(id);

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

    const unsubEvent = onSimulationEvent((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 30));
    });

    return () => {
      unsubTick();
      unsubEvent();
      leaveStartup(id);
    };
  }, [id, router, joinStartup, leaveStartup, onSimulationTick, onSimulationEvent]);

  const handleStart = useCallback(async () => {
    setIsActionLoading(true);
    try {
      await api.simulations.start(id);
      setSimulation((prev) => prev ? { ...prev, isRunning: true } : prev);
    } catch {}
    setIsActionLoading(false);
  }, [id]);

  const handlePause = useCallback(async () => {
    setIsActionLoading(true);
    try {
      await api.simulations.pause(id);
      setSimulation((prev) => prev ? { ...prev, isRunning: false } : prev);
    } catch {}
    setIsActionLoading(false);
  }, [id]);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete "${startup?.name}"? This action cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      await api.startups.delete(id);
      router.push('/dashboard');
    } catch {
      setIsDeleting(false);
    }
  }, [id, startup, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30">
        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mr-3" />
        Loading startup...
      </div>
    );
  }

  if (!startup) return null;

  const infoCards = [
    { label: 'Industry',        value: startup.industry,                       icon: Globe },
    { label: 'Category',        value: startup.category,                       icon: Target },
    { label: 'Pricing Model',   value: startup.pricingModel.replace('-', ' '), icon: DollarSign },
    { label: 'Monthly Budget',  value: formatCurrency(startup.monthlyBudget, true), icon: BarChart2 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" id="back-to-dashboard" className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{startup.name}</h1>
              {startup.tagline && (
                <p className="text-white/40 text-sm mt-0.5">{startup.tagline}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`badge-${startup.status === 'active' ? 'positive' : 'neutral'}`}>
            {startup.status}
          </span>
          <button
            id="delete-startup"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-accent-rose/20 text-accent-rose text-sm hover:bg-accent-rose/10 transition-all duration-200"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {infoCards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <card.icon className="w-4 h-4 text-brand-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/40">{card.label}</p>
              <p className="text-sm font-semibold text-white capitalize truncate">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: 'MRR',         value: formatCurrency(simulation?.mrr ?? 0, true),        sub: `${formatCurrency(simulation?.arr ?? 0, true)} ARR`,       color: 'text-accent-emerald', icon: DollarSign },
          { title: 'Customers',   value: formatNumber(simulation?.customers ?? 0),           sub: `${formatPercent(simulation?.churnRate ?? 0)} churn`,       color: 'text-accent-cyan',    icon: Users },
          { title: 'Valuation',   value: formatCurrency(simulation?.valuation ?? 0, true),  sub: simulation?.fundingRound?.replace('-', ' ') ?? 'pre-seed',  color: 'text-brand-400',       icon: TrendingUp },
          { title: 'Day',         value: `Day ${simulation?.simulationDay ?? 0}`,           sub: `${simulation?.runwayMonths ?? 0}mo runway`,                color: 'text-accent-amber',   icon: Calendar },
        ].map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-3 text-white/40">
              <m.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{m.title}</span>
            </div>
            <div className={`text-2xl font-black ${m.color} mb-1`}>{m.value}</div>
            <div className="text-xs text-white/30 capitalize">{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts + Status */}
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

      {/* Target audience + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Target Audience card */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-violet" />
            Target Audience
          </h3>
          <p className="text-sm text-white/50 leading-relaxed">
            {startup.targetAudience || 'Not specified.'}
          </p>
          <div className="mt-4 h-px bg-white/5" />
          <div className="mt-4 flex items-center justify-between text-xs text-white/30">
            <span>Created {new Date(startup.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>Sim Day {simulation?.simulationDay ?? 0}</span>
          </div>
        </div>

        {/* Activity feed occupies 2/3 */}
        <div className="xl:col-span-2">
          <ActivityFeed events={events} />
        </div>
      </div>
    </div>
  );
}
