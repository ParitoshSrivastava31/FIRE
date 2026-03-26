-- Stores raw market price snapshots
CREATE TABLE market_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  current_price NUMERIC(12,4) NOT NULL,
  previous_close NUMERIC(12,4),
  day_change_percent NUMERIC(6,2),
  price_30d_ago NUMERIC(12,4),
  price_90d_ago NUMERIC(12,4),
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  fetched_date DATE GENERATED ALWAYS AS ((fetched_at AT TIME ZONE 'UTC')::DATE) STORED
);
CREATE UNIQUE INDEX market_prices_symbol_date_idx ON market_prices (symbol, fetched_date);
CREATE INDEX ON market_prices (symbol, fetched_at DESC);

-- Stores rule engine output — events waiting for AI processing
CREATE TABLE pending_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  context JSONB NOT NULL,
  ai_processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON pending_events (user_id, ai_processed, created_at DESC);
CREATE INDEX ON pending_events (event_type, created_at DESC);

-- Stores all AI-generated insights, both event-triggered and user-initiated
CREATE TABLE ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES pending_events(id),
  insight_type TEXT NOT NULL,
  content TEXT NOT NULL,
  model_used TEXT NOT NULL,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  cache_read_tokens INT DEFAULT 0,
  via_batch BOOLEAN DEFAULT FALSE,
  severity TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON ai_insights (user_id, is_read, created_at DESC);

-- Tracks all AI calls for cost monitoring and budget enforcement
CREATE TABLE ai_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL,
  model_used TEXT NOT NULL,
  estimated_input_tokens INT DEFAULT 0,
  estimated_output_tokens INT DEFAULT 0,
  estimated_cost_inr NUMERIC(8,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON ai_usage_log (user_id, call_type, created_at DESC);

-- Tracks Anthropic/OpenAI Batch API jobs
CREATE TABLE batch_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL,
  user_count INT NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  user_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- SIP schedules (referenced in Rule 7)
CREATE TABLE sip_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fund_name TEXT NOT NULL,
  fund_symbol TEXT,
  monthly_amount NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ NOT NULL,
  last_stepped_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON sip_schedules (user_id, is_active);

-- RLS for all new tables
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sip_schedules ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "own_data" ON pending_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON ai_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON ai_usage_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON sip_schedules FOR ALL USING (auth.uid() = user_id);
-- Market prices are public read
CREATE POLICY "public_read" ON market_prices FOR SELECT USING (true);
