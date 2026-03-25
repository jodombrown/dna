
-- =============================================
-- CONTRIBUTE MODULE: Sprint C1 DB Migration
-- =============================================

-- 1. Add 'shortlisted' to application_status enum
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'shortlisted' AFTER 'pending';

-- 2. Extend opportunity_applications with missing columns
ALTER TABLE public.opportunity_applications 
  ADD COLUMN IF NOT EXISTS poster_notes text,
  ADD COLUMN IF NOT EXISTS status_updated_at timestamptz;

-- 3. CREATE contribution_fulfillments table
CREATE TABLE IF NOT EXISTS public.contribution_fulfillments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  contributor_id uuid NOT NULL REFERENCES public.profiles(id),
  poster_id uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','revision_requested','completed','cancelled')),
  submission_notes text,
  submission_attachments jsonb DEFAULT '[]'::jsonb,
  revision_notes text,
  completion_notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. CREATE contribution_acknowledgments table
CREATE TABLE IF NOT EXISTS public.contribution_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_id uuid NOT NULL REFERENCES public.contribution_fulfillments(id) ON DELETE CASCADE,
  from_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  to_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  message text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. RLS on contribution_fulfillments
ALTER TABLE public.contribution_fulfillments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fulfillments"
  ON public.contribution_fulfillments FOR SELECT
  TO authenticated
  USING (contributor_id = (SELECT auth.uid()) OR poster_id = (SELECT auth.uid()));

CREATE POLICY "Contributors can update own fulfillments"
  ON public.contribution_fulfillments FOR UPDATE
  TO authenticated
  USING (contributor_id = (SELECT auth.uid()) OR poster_id = (SELECT auth.uid()));

CREATE POLICY "System inserts fulfillments"
  ON public.contribution_fulfillments FOR INSERT
  TO authenticated
  WITH CHECK (poster_id = (SELECT auth.uid()) OR contributor_id = (SELECT auth.uid()));

-- 6. RLS on contribution_acknowledgments
ALTER TABLE public.contribution_acknowledgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public acknowledgments visible to all"
  ON public.contribution_acknowledgments FOR SELECT
  TO authenticated
  USING (is_public = true OR from_profile_id = (SELECT auth.uid()) OR to_profile_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own acknowledgments"
  ON public.contribution_acknowledgments FOR INSERT
  TO authenticated
  WITH CHECK (from_profile_id = (SELECT auth.uid()));

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_fulfillments_opportunity ON public.contribution_fulfillments(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_contributor ON public.contribution_fulfillments(contributor_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_poster ON public.contribution_fulfillments(poster_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_status ON public.contribution_fulfillments(status);
CREATE INDEX IF NOT EXISTS idx_acknowledgments_fulfillment ON public.contribution_acknowledgments(fulfillment_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgments_to_profile ON public.contribution_acknowledgments(to_profile_id);

-- 8. Updated_at trigger for fulfillments
CREATE OR REPLACE FUNCTION public.update_fulfillment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fulfillment_updated_at
  BEFORE UPDATE ON public.contribution_fulfillments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fulfillment_updated_at();

-- 9. RPCs

-- get_applications_for_opportunity
CREATE OR REPLACE FUNCTION public.get_applications_for_opportunity(
  p_opportunity_id uuid,
  p_status_filter text DEFAULT NULL,
  p_cursor uuid DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  opportunity_id uuid,
  applicant_id uuid,
  cover_letter text,
  proposed_contribution_type text,
  proposed_hours_per_month int,
  status text,
  review_notes text,
  poster_notes text,
  created_at timestamptz,
  updated_at timestamptz,
  status_updated_at timestamptz,
  withdrawn_at timestamptz,
  applicant_name text,
  applicant_avatar text,
  applicant_headline text,
  applicant_username text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    oa.id,
    oa.opportunity_id,
    oa.applicant_id,
    oa.cover_letter,
    oa.proposed_contribution_type::text,
    oa.proposed_hours_per_month,
    oa.status::text,
    oa.review_notes,
    oa.poster_notes,
    oa.created_at,
    oa.updated_at,
    oa.status_updated_at,
    oa.withdrawn_at,
    p.full_name as applicant_name,
    p.avatar_url as applicant_avatar,
    p.headline as applicant_headline,
    p.username as applicant_username
  FROM opportunity_applications oa
  JOIN profiles p ON p.id = oa.applicant_id
  JOIN opportunities o ON o.id = oa.opportunity_id
  WHERE oa.opportunity_id = p_opportunity_id
    AND o.created_by = auth.uid()
    AND (p_status_filter IS NULL OR oa.status::text = p_status_filter)
    AND (p_cursor IS NULL OR oa.id > p_cursor)
  ORDER BY oa.created_at DESC
  LIMIT p_limit;
$$;

-- update_application_status
CREATE OR REPLACE FUNCTION public.update_application_status(
  p_application_id uuid,
  p_new_status text,
  p_poster_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_opp_id uuid;
  v_applicant_id uuid;
  v_poster_id uuid;
  v_fulfillment_id uuid;
BEGIN
  -- Verify caller is the opportunity poster
  SELECT oa.opportunity_id, oa.applicant_id, o.created_by
  INTO v_opp_id, v_applicant_id, v_poster_id
  FROM opportunity_applications oa
  JOIN opportunities o ON o.id = oa.opportunity_id
  WHERE oa.id = p_application_id
    AND o.created_by = auth.uid();

  IF v_opp_id IS NULL THEN
    RAISE EXCEPTION 'Not authorized or application not found';
  END IF;

  -- Update the application
  UPDATE opportunity_applications
  SET status = p_new_status::application_status,
      poster_notes = COALESCE(p_poster_notes, poster_notes),
      status_updated_at = now(),
      updated_at = now(),
      reviewed_by = auth.uid(),
      reviewed_at = now()
  WHERE id = p_application_id;

  -- On accept: create fulfillment row
  IF p_new_status = 'accepted' THEN
    INSERT INTO contribution_fulfillments (opportunity_id, contributor_id, poster_id)
    VALUES (v_opp_id, v_applicant_id, v_poster_id)
    RETURNING id INTO v_fulfillment_id;
    
    RETURN v_fulfillment_id;
  END IF;

  RETURN NULL;
END;
$$;

-- submit_fulfillment
CREATE OR REPLACE FUNCTION public.submit_fulfillment(
  p_fulfillment_id uuid,
  p_notes text,
  p_attachments jsonb DEFAULT '[]'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE contribution_fulfillments
  SET status = 'submitted',
      submission_notes = p_notes,
      submission_attachments = p_attachments
  WHERE id = p_fulfillment_id
    AND contributor_id = auth.uid()
    AND status IN ('in_progress', 'revision_requested');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not authorized or invalid state';
  END IF;
END;
$$;

-- respond_to_fulfillment
CREATE OR REPLACE FUNCTION public.respond_to_fulfillment(
  p_fulfillment_id uuid,
  p_action text,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_action NOT IN ('complete', 'request_revision') THEN
    RAISE EXCEPTION 'Invalid action. Must be complete or request_revision';
  END IF;

  IF p_action = 'complete' THEN
    UPDATE contribution_fulfillments
    SET status = 'completed',
        completion_notes = p_notes,
        completed_at = now()
    WHERE id = p_fulfillment_id
      AND poster_id = auth.uid()
      AND status = 'submitted';
  ELSIF p_action = 'request_revision' THEN
    UPDATE contribution_fulfillments
    SET status = 'revision_requested',
        revision_notes = p_notes
    WHERE id = p_fulfillment_id
      AND poster_id = auth.uid()
      AND status = 'submitted';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not authorized or invalid state';
  END IF;
END;
$$;

-- create_acknowledgment
CREATE OR REPLACE FUNCTION public.create_acknowledgment(
  p_fulfillment_id uuid,
  p_to_profile_id uuid,
  p_message text,
  p_rating int DEFAULT NULL,
  p_is_public boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Verify fulfillment is completed and caller is a party
  IF NOT EXISTS (
    SELECT 1 FROM contribution_fulfillments
    WHERE id = p_fulfillment_id
      AND status = 'completed'
      AND (contributor_id = auth.uid() OR poster_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Fulfillment not found, not completed, or not authorized';
  END IF;

  INSERT INTO contribution_acknowledgments (fulfillment_id, from_profile_id, to_profile_id, message, rating, is_public)
  VALUES (p_fulfillment_id, auth.uid(), p_to_profile_id, p_message, p_rating, p_is_public)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- get_profile_acknowledgments
CREATE OR REPLACE FUNCTION public.get_profile_acknowledgments(
  p_profile_id uuid,
  p_cursor uuid DEFAULT NULL,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  fulfillment_id uuid,
  from_profile_id uuid,
  to_profile_id uuid,
  message text,
  rating int,
  is_public boolean,
  created_at timestamptz,
  from_name text,
  from_avatar text,
  from_username text,
  opportunity_title text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ca.id,
    ca.fulfillment_id,
    ca.from_profile_id,
    ca.to_profile_id,
    ca.message,
    ca.rating,
    ca.is_public,
    ca.created_at,
    p.full_name as from_name,
    p.avatar_url as from_avatar,
    p.username as from_username,
    o.title as opportunity_title
  FROM contribution_acknowledgments ca
  JOIN profiles p ON p.id = ca.from_profile_id
  JOIN contribution_fulfillments cf ON cf.id = ca.fulfillment_id
  JOIN opportunities o ON o.id = cf.opportunity_id
  WHERE ca.to_profile_id = p_profile_id
    AND ca.is_public = true
    AND (p_cursor IS NULL OR ca.id < p_cursor)
  ORDER BY ca.created_at DESC
  LIMIT p_limit;
$$;

-- get_profile_contribution_history
CREATE OR REPLACE FUNCTION public.get_profile_contribution_history(
  p_profile_id uuid,
  p_type text DEFAULT 'all',
  p_cursor uuid DEFAULT NULL,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  opportunity_id uuid,
  opportunity_title text,
  contributor_id uuid,
  contributor_name text,
  contributor_avatar text,
  poster_id uuid,
  poster_name text,
  poster_avatar text,
  status text,
  completed_at timestamptz,
  created_at timestamptz,
  has_acknowledgment boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cf.id,
    cf.opportunity_id,
    o.title as opportunity_title,
    cf.contributor_id,
    pc.full_name as contributor_name,
    pc.avatar_url as contributor_avatar,
    cf.poster_id,
    pp.full_name as poster_name,
    pp.avatar_url as poster_avatar,
    cf.status,
    cf.completed_at,
    cf.created_at,
    EXISTS (
      SELECT 1 FROM contribution_acknowledgments ca 
      WHERE ca.fulfillment_id = cf.id
    ) as has_acknowledgment
  FROM contribution_fulfillments cf
  JOIN opportunities o ON o.id = cf.opportunity_id
  JOIN profiles pc ON pc.id = cf.contributor_id
  JOIN profiles pp ON pp.id = cf.poster_id
  WHERE cf.status = 'completed'
    AND (
      (p_type = 'all' AND (cf.contributor_id = p_profile_id OR cf.poster_id = p_profile_id))
      OR (p_type = 'given' AND cf.contributor_id = p_profile_id)
      OR (p_type = 'received' AND cf.poster_id = p_profile_id)
    )
    AND (p_cursor IS NULL OR cf.id < p_cursor)
  ORDER BY cf.completed_at DESC NULLS LAST
  LIMIT p_limit;
$$;

-- Full-text search index for opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_search 
  ON public.opportunities 
  USING GIN(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));

-- search_opportunities RPC
CREATE OR REPLACE FUNCTION public.search_opportunities(
  p_query text DEFAULT NULL,
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_cursor uuid DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  type text,
  status text,
  tags text[],
  location text,
  image_url text,
  created_at timestamptz,
  poster_id uuid,
  poster_name text,
  poster_avatar text,
  poster_username text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.title,
    o.description,
    o.type,
    o.status,
    o.tags,
    o.location,
    o.image_url,
    o.created_at,
    o.created_by as poster_id,
    p.full_name as poster_name,
    p.avatar_url as poster_avatar,
    p.username as poster_username
  FROM opportunities o
  JOIN profiles p ON p.id = o.created_by
  WHERE 
    (o.status = COALESCE(p_filters->>'status', 'active'))
    AND (p_query IS NULL OR to_tsvector('english', coalesce(o.title,'') || ' ' || coalesce(o.description,'')) @@ plainto_tsquery('english', p_query))
    AND (p_filters->>'type' IS NULL OR o.type = p_filters->>'type')
    AND (p_filters->>'location' IS NULL OR o.location ILIKE '%' || (p_filters->>'location') || '%')
    AND (p_cursor IS NULL OR o.created_at < (SELECT o2.created_at FROM opportunities o2 WHERE o2.id = p_cursor))
  ORDER BY o.created_at DESC
  LIMIT LEAST(p_limit, 50);
END;
$$;
