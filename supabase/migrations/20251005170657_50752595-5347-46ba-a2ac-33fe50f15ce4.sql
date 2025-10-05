-- Add verification and billing fields to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_approved_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_rejected_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_documents_url TEXT;

-- Billing fields
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'community' CHECK (subscription_tier IN ('community', 'growth', 'scale', 'enterprise'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_fee_paid BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS annual_budget_usd INTEGER;

-- Track opportunity quota
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS opportunities_posted_this_year INTEGER DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS year_reset_at TIMESTAMPTZ DEFAULT date_trunc('year', NOW());

-- Create indexes for billing queries
CREATE INDEX IF NOT EXISTS idx_orgs_stripe_customer ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orgs_verification_status ON organizations(verification_status);
CREATE INDEX IF NOT EXISTS idx_orgs_subscription_status ON organizations(subscription_status);

-- Create verification requests table
CREATE TABLE IF NOT EXISTS organization_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Submitted documents
  registration_document_url TEXT,
  proof_of_activity_url TEXT,
  financial_document_url TEXT,
  reference_1_name TEXT,
  reference_1_email TEXT,
  reference_1_relationship TEXT,
  reference_2_name TEXT,
  reference_2_email TEXT,
  reference_2_relationship TEXT,
  
  -- Additional info
  annual_budget_usd INTEGER,
  website_url TEXT,
  social_media_links TEXT[],
  description_of_work TEXT,
  
  -- Review
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_org ON organization_verification_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON organization_verification_requests(status);

-- Enable RLS
ALTER TABLE organization_verification_requests ENABLE ROW LEVEL SECURITY;

-- Org owners can view their own requests
CREATE POLICY "Org owners can view their verification requests"
  ON organization_verification_requests FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid()
    )
  );

-- Org owners can create verification requests
CREATE POLICY "Org owners can create verification requests"
  ON organization_verification_requests FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_user_id = auth.uid()
    )
  );

-- Admins can view and update all requests
CREATE POLICY "Admins can manage verification requests"
  ON organization_verification_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create billing transactions table
CREATE TABLE IF NOT EXISTS billing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Transaction details
  type TEXT NOT NULL CHECK (type IN ('verification_fee', 'subscription', 'refund')),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Stripe references
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  
  -- Metadata
  description TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_org ON billing_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_stripe_payment ON billing_transactions(stripe_payment_intent_id);

ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;

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
  
  -- Must be verified
  IF org_record.verification_status != 'approved' THEN
    RETURN false;
  END IF;
  
  -- Must have paid verification fee
  IF NOT org_record.verification_fee_paid THEN
    RETURN false;
  END IF;
  
  -- Check tier limits
  CASE org_record.subscription_tier
    WHEN 'community' THEN tier_limit := 3;
    WHEN 'growth' THEN tier_limit := 12;
    ELSE tier_limit := 999999; -- Unlimited for scale/enterprise
  END CASE;
  
  -- Reset counter if new year
  IF org_record.year_reset_at < date_trunc('year', NOW()) THEN
    UPDATE organizations 
    SET opportunities_posted_this_year = 0,
        year_reset_at = date_trunc('year', NOW())
    WHERE id = _org_id;
    org_record.opportunities_posted_this_year := 0;
  END IF;
  
  -- Check if under limit
  RETURN org_record.opportunities_posted_this_year < tier_limit;
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
    SET opportunities_posted_this_year = opportunities_posted_this_year + 1
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