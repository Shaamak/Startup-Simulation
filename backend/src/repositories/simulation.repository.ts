import { query } from '../config/database';
import { cache, CACHE_KEYS } from '../config/redis';

export interface SimulationRow {
  id: string;
  startup_id: string;
  is_running: boolean;
  simulation_day: number;
  customers: number;
  mrr: number;
  arr: number;
  churn_rate: number;
  valuation: number;
  runway_months: number;
  popularity_score: number;
  investor_interest: number;
  funding_raised: number;
  funding_round: string;
  total_revenue: number;
  burn_rate: number;
  last_updated: Date;
  created_at: Date;
}

export interface MetricRow {
  id: string;
  startup_id: string;
  day: number;
  customers: number;
  mrr: number;
  churn_rate: number;
  valuation: number;
  burn_rate: number;
  recorded_at: Date;
}

export interface EventRow {
  id: string;
  startup_id: string;
  event_type: string;
  title: string;
  description: string | null;
  impact: 'positive' | 'negative' | 'neutral';
  metadata: Record<string, unknown>;
  occurred_at: Date;
}

export const simulationRepository = {
  async getOrCreate(startupId: string): Promise<SimulationRow> {
    const cached = await cache.get<SimulationRow>(CACHE_KEYS.simulation(startupId));
    if (cached) return cached;

    const { rows } = await query<SimulationRow>(
      `INSERT INTO simulations (startup_id)
       VALUES ($1)
       ON CONFLICT (startup_id) DO UPDATE SET startup_id = EXCLUDED.startup_id
       RETURNING *`,
      [startupId]
    );
    await cache.set(CACHE_KEYS.simulation(startupId), rows[0], 30);
    return rows[0];
  },

  async findByStartupId(startupId: string): Promise<SimulationRow | null> {
    const { rows } = await query<SimulationRow>(
      'SELECT * FROM simulations WHERE startup_id = $1 LIMIT 1',
      [startupId]
    );
    return rows[0] ?? null;
  },

  async update(startupId: string, data: Partial<SimulationRow>): Promise<SimulationRow> {
    const setClauses: string[] = ['last_updated = now()'];
    const values: unknown[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      is_running: 'is_running', simulation_day: 'simulation_day',
      customers: 'customers', mrr: 'mrr', arr: 'arr',
      churn_rate: 'churn_rate', valuation: 'valuation',
      runway_months: 'runway_months', popularity_score: 'popularity_score',
      investor_interest: 'investor_interest', funding_raised: 'funding_raised',
      funding_round: 'funding_round', total_revenue: 'total_revenue',
      burn_rate: 'burn_rate',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      const val = (data as Record<string, unknown>)[key];
      if (val !== undefined) {
        setClauses.push(`${col} = $${idx++}`);
        values.push(val);
      }
    }

    values.push(startupId);
    const { rows } = await query<SimulationRow>(
      `UPDATE simulations SET ${setClauses.join(', ')}
       WHERE startup_id = $${idx}
       RETURNING *`,
      values
    );

    await cache.set(CACHE_KEYS.simulation(startupId), rows[0], 30);
    return rows[0];
  },

  async recordMetric(startupId: string, data: Omit<MetricRow, 'id' | 'startup_id' | 'recorded_at'>): Promise<void> {
    await query(
      `INSERT INTO simulation_metrics (startup_id, day, customers, mrr, churn_rate, valuation, burn_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [startupId, data.day, data.customers, data.mrr, data.churn_rate, data.valuation, data.burn_rate]
    );
  },

  async getMetrics(startupId: string, limit = 90): Promise<MetricRow[]> {
    const { rows } = await query<MetricRow>(
      `SELECT * FROM simulation_metrics
       WHERE startup_id = $1
       ORDER BY day ASC
       LIMIT $2`,
      [startupId, limit]
    );
    return rows;
  },

  async createEvent(
    startupId: string,
    event: Omit<EventRow, 'id' | 'startup_id' | 'occurred_at'>
  ): Promise<EventRow> {
    const { rows } = await query<EventRow>(
      `INSERT INTO simulation_events (startup_id, event_type, title, description, impact, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [startupId, event.event_type, event.title, event.description, event.impact, JSON.stringify(event.metadata)]
    );
    return rows[0];
  },

  async getEvents(startupId: string, limit = 20): Promise<EventRow[]> {
    const { rows } = await query<EventRow>(
      `SELECT * FROM simulation_events
       WHERE startup_id = $1
       ORDER BY occurred_at DESC
       LIMIT $2`,
      [startupId, limit]
    );
    return rows;
  },
};
