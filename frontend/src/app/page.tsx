import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, Users, DollarSign, Brain, BarChart3 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Startup Simulator — Build Your Virtual Empire',
};

const features = [
  {
    icon: Brain,
    title: 'AI Simulation Engine',
    description: 'FastAPI-powered engine simulates realistic customer behavior, market dynamics, and competitive pressures.',
    color: 'text-accent-violet',
    bg: 'bg-accent-violet/10',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Revenue Modeling',
    description: 'Watch MRR, ARR, and valuation update live every 30 seconds with industry-specific revenue models.',
    color: 'text-accent-emerald',
    bg: 'bg-accent-emerald/10',
  },
  {
    icon: Users,
    title: 'Customer Growth Dynamics',
    description: 'S-curve customer acquisition, churn modeling, and viral growth events based on your strategy.',
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10',
  },
  {
    icon: DollarSign,
    title: 'Funding & Investor Reactions',
    description: 'AI investors evaluate your startup\'s momentum and trigger seed, Series A/B rounds automatically.',
    color: 'text-accent-amber',
    bg: 'bg-accent-amber/10',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics Dashboard',
    description: 'Premium Recharts visualizations with animated metrics, trend lines, and real-time Socket.IO updates.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
  },
  {
    icon: Zap,
    title: 'Competitor & Market Events',
    description: 'Random but realistic events: competitor launches, press coverage, viral moments, and market shifts.',
    color: 'text-accent-rose',
    bg: 'bg-accent-rose/10',
  },
];

const stats = [
  { value: '11', label: 'Industries Supported' },
  { value: '5', label: 'Pricing Models' },
  { value: '30s', label: 'Simulation Interval' },
  { value: '∞', label: 'Possible Outcomes' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-surface/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">Startup Sim</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-brand-600/10 blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-accent-violet/8 blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            AI Simulation Engine — Now Live
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Build Your
            <span className="block gradient-text">Virtual Startup</span>
            <span className="block text-white/80 text-4xl md:text-5xl font-semibold mt-2">
              Watch It Grow in Real-Time
            </span>
          </h1>

          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            The world's most advanced startup simulator. AI-powered customer growth, 
            realistic revenue modeling, investor reactions, and live market events — 
            all in one dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-primary flex items-center gap-2 text-base px-8 py-3.5"
            >
              Launch Your Startup
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-white/60 hover:text-white font-medium transition-colors text-base"
            >
              Sign in to existing account →
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-surface-1 px-6 py-5 text-center">
                <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything Your Startup Needs
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Powered by mathematical models and real-time AI, not random number generators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card-hover p-6 group">
                <div className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-brand opacity-5" />
          <div className="relative">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Simulate Your Success?
            </h2>
            <p className="text-white/50 mb-8 text-lg">
              Free to start. No credit card required. Launch in 60 seconds.
            </p>
            <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-white/30">
          <span>© 2024 AI Startup Simulator</span>
          <span>Built with Next.js · FastAPI · Socket.IO</span>
        </div>
      </footer>
    </div>
  );
}
