-- ADIN Intelligence System - Perplexity Integration
-- Migration: Create tables for ADIN queries, user usage tracking, and query logging

-- ============================================================================
-- Table: adin_queries (Cache & Analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.adin_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cache identification
  query_hash TEXT NOT NULL,              -- SHA256 of normalized query
  query_text TEXT NOT NULL,              -- Original query for debugging
  normalized_query TEXT NOT NULL,        -- Lowercase, trimmed query

  -- Perplexity response (cached)
  perplexity_response JSONB NOT NULL,    -- Full API response
  citations JSONB,                        -- Extracted citations array

  -- DNA network matches (cached)
  network_matches JSONB,                  -- {profiles: [], events: [], projects: [], hashtags: []}

  -- Metadata
  model_used TEXT DEFAULT 'sonar',        -- sonar, sonar-pro, etc.
  tokens_used INTEGER,                    -- For cost tracking
  estimated_cost DECIMAL(10, 6),          -- Cost in USD

  -- Cache management
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  cache_hits INTEGER DEFAULT 0,           -- Track how often this cache is used

  -- Unique constraint for cache key
  CONSTRAINT adin_queries_query_hash_key UNIQUE (query_hash)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_adin_queries_hash ON public.adin_queries(query_hash);
CREATE INDEX IF NOT EXISTS idx_adin_queries_expires ON public.adin_queries(expires_at);
CREATE INDEX IF NOT EXISTS idx_adin_queries_created ON public.adin_queries(created_at DESC);

-- ============================================================================
-- Table: adin_user_usage (Rate Limiting)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.adin_user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Usage tracking
  period_start DATE NOT NULL,             -- First day of the month
  query_count INTEGER DEFAULT 0,          -- Queries used this period
  query_limit INTEGER DEFAULT 10,         -- Monthly limit (10 for free, higher for premium)

  -- Analytics
  total_tokens_used INTEGER DEFAULT 0,
  total_estimated_cost DECIMAL(10, 4) DEFAULT 0,
  last_query_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint per user per period
  CONSTRAINT adin_user_usage_user_period_key UNIQUE (user_id, period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_adin_user_usage_user ON public.adin_user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_adin_user_usage_period ON public.adin_user_usage(period_start);

-- ============================================================================
-- Table: adin_query_log (Detailed Analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.adin_query_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,

  -- Response tracking
  cache_hit BOOLEAN DEFAULT FALSE,
  response_time_ms INTEGER,

  -- Source tracking
  source TEXT DEFAULT 'dashboard',        -- dashboard, connect, convene, etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_adin_query_log_user ON public.adin_query_log(user_id);
CREATE INDEX IF NOT EXISTS idx_adin_query_log_created ON public.adin_query_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adin_query_log_source ON public.adin_query_log(source);

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- adin_queries: Public read for cache, admin write
ALTER TABLE public.adin_queries ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read cached queries
CREATE POLICY "adin_queries_select_authenticated"
  ON public.adin_queries FOR SELECT
  TO authenticated
  USING (true);

-- Service role has full access (for edge function)
CREATE POLICY "adin_queries_all_service_role"
  ON public.adin_queries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- adin_user_usage: Users can only see their own usage
ALTER TABLE public.adin_user_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "adin_user_usage_select_own"
  ON public.adin_user_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role manages all usage records
CREATE POLICY "adin_user_usage_all_service_role"
  ON public.adin_user_usage FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- adin_query_log: Users see own logs, service role sees all
ALTER TABLE public.adin_query_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own query logs
CREATE POLICY "adin_query_log_select_own"
  ON public.adin_query_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "adin_query_log_all_service_role"
  ON public.adin_query_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Helper function for cache cleanup (can be called by scheduled job)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_adin_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.adin_queries
  WHERE expires_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.cleanup_expired_adin_cache() TO service_role;

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE public.adin_queries IS 'Cache table for ADIN (Perplexity) search queries and responses';
COMMENT ON TABLE public.adin_user_usage IS 'Tracks monthly ADIN query usage per user for rate limiting';
COMMENT ON TABLE public.adin_query_log IS 'Detailed log of all ADIN queries for analytics';

COMMENT ON COLUMN public.adin_queries.query_hash IS 'SHA256 hash of normalized query for cache lookup';
COMMENT ON COLUMN public.adin_queries.network_matches IS 'DNA network matches including profiles, events, projects, and hashtags';
COMMENT ON COLUMN public.adin_queries.cache_hits IS 'Number of times this cached response was served';

COMMENT ON COLUMN public.adin_user_usage.period_start IS 'First day of the billing period (month)';
COMMENT ON COLUMN public.adin_user_usage.query_limit IS 'Maximum queries allowed per period (10 for free tier)';

COMMENT ON FUNCTION public.cleanup_expired_adin_cache() IS 'Removes expired ADIN cache entries older than 7 days past expiration';
