-- =====================
-- SIMULATIONS
-- =====================
CREATE TABLE IF NOT EXISTS simulations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id        UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  is_running        BOOLEAN DEFAULT false,
  simulation_day    INTEGER DEFAULT 0,
  customers         INTEGER DEFAULT 0,
  mrr               DECIMAL(12,2) DEFAULT 0,
  arr               DECIMAL(12,2) DEFAULT 0,
  churn_rate        DECIMAL(5,4) DEFAULT 0,
  valuation         DECIMAL(15,2) DEFAULT 0,
  runway_months     INTEGER DEFAULT 0,
  popularity_score  DECIMAL(5,2) DEFAULT 0,
  investor_interest DECIMAL(5,2) DEFAULT 0,
  funding_raised    DECIMAL(15,2) DEFAULT 0,
  funding_round     VARCHAR(20) DEFAULT 'pre-seed' CHECK (
    funding_round IN ('pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'ipo')
  ),
  total_revenue     DECIMAL(15,2) DEFAULT 0,
  burn_rate         DECIMAL(12,2) DEFAULT 0,
  last_updated      TIMESTAMPTZ DEFAULT now(),
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_simulations_startup ON simulations(startup_id);
