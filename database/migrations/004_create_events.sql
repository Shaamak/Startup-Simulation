-- =====================
-- SIMULATION EVENTS (Activity Feed)
-- =====================
CREATE TABLE IF NOT EXISTS simulation_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id  UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  event_type  VARCHAR(50) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  impact      VARCHAR(10) CHECK (impact IN ('positive', 'negative', 'neutral')),
  metadata    JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_startup_time ON simulation_events(startup_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON simulation_events(event_type);
