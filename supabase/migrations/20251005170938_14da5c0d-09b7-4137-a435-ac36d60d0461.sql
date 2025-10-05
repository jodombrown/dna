-- Add verification and billing fields to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_approved_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_rejected_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_documents_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'community';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_fee_paid BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS annual_budget_usd INTEGER;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS opportunities_posted_this_year INTEGER DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS year_reset_at TIMESTAMPTZ DEFAULT date_trunc('year', NOW());

-- Add constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organizations_verification_status_check') THEN
    ALTER TABLE organizations ADD CONSTRAINT organizations_verification_status_check 
    CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organizations_subscription_tier_check') THEN
    ALTER TABLE organizations ADD CONSTRAINT organizations_subscription_tier_check 
    CHECK (subscription_tier IN ('community', 'growth', 'scale', 'enterprise'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organizations_subscription_status_check') THEN
    ALTER TABLE organizations ADD CONSTRAINT organizations_subscription_status_check 
    CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled'));
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orgs_stripe_customer ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orgs_verification_status ON organizations(verification_status);
CREATE INDEX IF NOT EXISTS idx_orgs_subscription_status ON organizations(subscription_status);

-- Create verification requests table
CREATE TABLE IF NOT EXISTS organization_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  registration_document_url TEXT,
  proof_of_activity_url TEXT,
  financial_document_url TEXT,
  reference_1_name TEXT,
  reference_1_email TEXT,
  reference_1_relationship TEXT,
  reference_2_name TEXT,
  reference_2_email TEXT,
  reference_2_relationship TEXT,
  annual_budget_usd INTEGER,
  website_url TEXT,
  social_media_links TEXT[],
  description_of_work TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_org ON organization_verification_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON organization_verification_requests(status);

ALTER TABLE organization_verification_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Org owners can view their verification requests" ON organization_verification_requests;
DROP POLICY IF EXISTS "Org owners can create verification requests" ON organization_verification_requests;
DROP POLICY IF EXISTS "Admins can manage verification requests" ON organization_verification_requests;

-- Create policies
CREATE POLICY "Org owners can view their verification requests"
  ON organization_verification_requests FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Org owners can create verification requests"
  ON organization_verification_requests FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage verification requests"
  ON organization_verification_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create billing transactions table
CREATE TABLE IF NOT EXISTS billing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('verification_fee', 'subscription', 'refund')),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_org ON billing_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_stripe_payment ON billing_transactions(stripe_payment_intent_id);

ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org owners can view their transactions" ON billing_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON billing_transactions;

CREATE POLICY "Org owners can view their transactions"
  ON billing_transactions FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all transactions"
  ON billing_transactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to check if org can post opportunity
CREATE OR REPLACE FUNCTION can_post_opportunity(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_record organizations%ROWTYPE;
  tier_limit INTEGER;
BEGIN
  SELECT * INTO org_record FROM organizations WHERE id = _org_id;
  
  IF org_record IS NULL THEN
    RETURN false;
  END IF;
  
  IF org_record.verification_status != 'approved' THEN
    RETURN false;
  END IF;
  
  IF NOT COALESCE(org_record.verification_fee_paid, false) THEN
    RETURN false;
  END IF;
  
  CASE org_record.subscription_tier
    WHEN 'community' THEN tier_limit := 3;
    WHEN 'growth' THEN tier_limit := 12;
    ELSE tier_limit := 999999;
  END CASE;
  
  IF org_record.year_reset_at < date_trunc('year', NOW()) THEN
    UPDATE organizations 
    SET opportunities_posted_this_year = 0,
        year_reset_at = date_trunc('year', NOW())
    WHERE id = _org_id;
    org_record.opportunities_posted_this_year := 0;
  END IF;
  
  RETURN COALESCE(org_record.opportunities_posted_this_year, 0) < tier_limit;
END;
$$;

-- Trigger to increment opportunity counter
CREATE OR REPLACE FUNCTION increment_org_opportunity_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    UPDATE organizations 
    SET opportunities_posted_this_year = COALESCE(opportunities_posted_this_year, 0) + 1
    WHERE id = NEW.org_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS increment_opportunity_count ON opportunities;
CREATE TRIGGER increment_opportunity_count
AFTER INSERT OR UPDATE ON opportunities
FOR EACH ROW
EXECUTE FUNCTION increment_org_opportunity_count();