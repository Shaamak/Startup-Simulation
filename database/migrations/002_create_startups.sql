-- =====================
-- STARTUPS
-- =====================
CREATE TABLE IF NOT EXISTS startups (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  tagline        VARCHAR(255),
  industry       VARCHAR(50) NOT NULL,
  category       VARCHAR(50) NOT NULL,
  pricing_model  VARCHAR(30) NOT NULL CHECK (
    pricing_model IN ('freemium', 'subscription', 'one-time', 'usage-based', 'marketplace')
  ),
  monthly_budget DECIMAL(12,2) NOT NULL CHECK (monthly_budget > 0),
  target_audience TEXT NOT NULL,
  logo_url       TEXT,
  banner_url     TEXT,
  status         VARCHAR(20) DEFAULT 'active' CHECK (
    status IN ('active', 'paused', 'failed', 'acquired')
  ),
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);
CREATE INDEX IF NOT EXISTS idx_startups_status ON startups(status);

CREATE TRIGGER update_startups_updated_at
  BEFORE UPDATE ON startups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
