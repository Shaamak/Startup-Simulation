export interface SimulationState {
  id: string;
  startupId: string;
  isRunning: boolean;
  simulationDay: number;
  customers: number;
  mrr: number;
  arr: number;
  churnRate: number;
  valuation: number;
  runwayMonths: number;
  popularityScore: number;
  investorInterest: number;
  fundingRaised: number;
  fundingRound: string;
  totalRevenue: number;
  burnRate: number;
  lastUpdated: string;
}

export interface SimulationMetric {
  id: string;
  startupId: string;
  day: number;
  customers: number;
  mrr: number;
  churnRate: number;
  valuation: number;
  burnRate: number;
  recordedAt: string;
}

export interface SimulationEvent {
  id: string;
  startupId: string;
  eventType: string;
  title: string;
  description: string | null;
  impact: 'positive' | 'negative' | 'neutral';
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
}
