-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  date_of_birth DATE,
  occupation TEXT,
  monthly_income NUMERIC(12,2),
  annual_income NUMERIC(12,2),
  risk_profile TEXT CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
  onboarding_complete BOOLEAN DEFAULT false,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'elite')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Expenses
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('food','transport','entertainment','utilities','emi','healthcare','shopping','other')),
  sub_category TEXT,
  amount NUMERIC(10,2) NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily','weekly','monthly','yearly')),
  description TEXT,
  date DATE,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Goals
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL,
  current_amount NUMERIC(14,2) DEFAULT 0,
  target_date DATE,
  goal_type TEXT CHECK (goal_type IN ('retirement','home','education','travel','emergency','business','other')),
  priority INTEGER CHECK (priority BETWEEN 1 AND 5),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Portfolio Holdings
CREATE TABLE public.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  asset_type TEXT CHECK (asset_type IN ('stock','mutual_fund','etf','gold','fd','ppf','nps','real_estate','crypto','other')),
  symbol TEXT,
  name TEXT,
  quantity NUMERIC(12,4),
  avg_buy_price NUMERIC(12,4),
  current_price NUMERIC(12,4),
  previous_close NUMERIC(12,4),
  current_value NUMERIC(14,2) GENERATED ALWAYS AS (current_price * quantity) STORED,
  invested_amount NUMERIC(14,2) GENERATED ALWAYS AS (avg_buy_price * quantity) STORED,
  pnl NUMERIC(14,2) GENERATED ALWAYS AS ((current_price * quantity) - (avg_buy_price * quantity)) STORED,
  pnl_percent NUMERIC(8,4) GENERATED ALWAYS AS (CASE WHEN (avg_buy_price * quantity) > 0 THEN (((current_price * quantity) - (avg_buy_price * quantity)) / (avg_buy_price * quantity)) * 100 ELSE 0 END) STORED,
  day_change_percent NUMERIC(8,4) GENERATED ALWAYS AS (CASE WHEN previous_close > 0 THEN ((current_price - previous_close) / previous_close) * 100 ELSE 0 END) STORED,
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- SIP Plans
CREATE TABLE public.sip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  fund_name TEXT NOT NULL,
  scheme_code TEXT,
  monthly_amount NUMERIC(10,2) NOT NULL,
  start_date DATE,
  step_up_percent NUMERIC(5,2) DEFAULT 0,
  tenure_years INTEGER,
  target_amount NUMERIC(14,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Theses
CREATE TABLE public.ai_theses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  thesis_type TEXT CHECK (thesis_type IN ('spending_audit','investment_plan','goal_projection','portfolio_review','real_estate')),
  input_snapshot JSONB,
  thesis_content TEXT,
  recommendations JSONB,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_bookmarked BOOLEAN DEFAULT false
);

-- Alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('stock_alert','sip_reminder','goal_milestone','portfolio_warning','rebalance','news')),
  title TEXT NOT NULL,
  body TEXT,
  related_symbol TEXT,
  trigger_value NUMERIC,
  is_read BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Real Estate Data (Reference table)
CREATE TABLE public.real_estate_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  state TEXT,
  price_per_sqft_min NUMERIC(10,2),
  price_per_sqft_max NUMERIC(10,2),
  price_per_sqft_avg NUMERIC(10,2),
  rental_yield_percent NUMERIC(5,2),
  yoy_appreciation_percent NUMERIC(5,2),
  data_source TEXT,
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_theses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can edit own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN SELECT t.table_name FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name IN ('expenses', 'goals', 'portfolio_holdings', 'sip_plans', 'ai_theses', 'alerts')
  LOOP
    EXECUTE format('CREATE POLICY "Users can view own %I" ON public.%I FOR SELECT USING (auth.uid() = user_id)', table_name, table_name);
    EXECUTE format('CREATE POLICY "Users can insert own %I" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', table_name, table_name);
    EXECUTE format('CREATE POLICY "Users can update own %I" ON public.%I FOR UPDATE USING (auth.uid() = user_id)', table_name, table_name);
    EXECUTE format('CREATE POLICY "Users can delete own %I" ON public.%I FOR DELETE USING (auth.uid() = user_id)', table_name, table_name);
  END LOOP;
END
$$;

-- Real Estate table is public read-only
ALTER TABLE public.real_estate_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view real estate data" ON public.real_estate_data FOR SELECT USING (true);
