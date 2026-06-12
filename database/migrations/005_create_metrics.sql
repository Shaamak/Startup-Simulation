-- =====================
-- SIMULATION METRICS (Time-Series Snapshots)
-- =====================
CREATE TABLE IF NOT EXISTS simulation_metrics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id  UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  day         INTEGER NOT NULL,
  customers   INTEGER,
  mrr         DECIMAL(12,2),
  churn_rate  DECIMAL(5,4),
  valuation   DECIMAL(15,2),
  burn_rate   DECIMAL(12,2),
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metrics_startup_day ON simulation_metrics(startup_id, day);
