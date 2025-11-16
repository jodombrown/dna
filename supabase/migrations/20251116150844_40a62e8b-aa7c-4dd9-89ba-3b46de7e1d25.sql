-- ADA Phase 4 M1: Seed Initial Policies and Cohorts
-- This migration creates the foundational data for adaptive right rail behavior

-- ============================================================================
-- STEP 1: Create Database Function for Cohort Evaluation
-- ============================================================================

-- Function to evaluate user cohort memberships based on criteria
CREATE OR REPLACE FUNCTION get_user_cohorts(p_user_id UUID)
RETURNS TABLE (
  cohort_id UUID,
  cohort_name TEXT
) AS $$
DECLARE
  v_account_age_days INTEGER;
  v_events_created_count INTEGER;
BEGIN
  -- Calculate account age in days
  SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER
  INTO v_account_age_days
  FROM profiles
  WHERE id = p_user_id;

  -- Count events created by user
  SELECT COUNT(*)::INTEGER
  INTO v_events_created_count
  FROM events
  WHERE created_by = p_user_id;

  -- Return cohorts user belongs to based on criteria
  RETURN QUERY
  SELECT 
    c.id as cohort_id,
    c.name as cohort_name
  FROM ada_cohorts c
  WHERE c.is_active = true
    AND (
      -- New Users: account age <= 7 days
      (c.name = 'new_users' AND v_account_age_days <= 7)
      OR
      -- Event Organizers: created at least 1 event
      (c.name = 'event_organizers' AND v_events_created_count >= 1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 2: Create Global Default Modules Policy
-- ============================================================================

INSERT INTO ada_policies (
  name,
  type,
  scope,
  description,
  is_active,
  config
) VALUES (
  'Global Default Modules',
  'modules',
  'global',
  'Default module configuration for all users when no cohort-specific policy applies',
  true,
  '{
    "modules": [
      {
        "id": "upcoming_events",
        "visible": true,
        "order": 1,
        "config": {
          "title": "Upcoming Events",
          "limit": 3
        }
      },
      {
        "id": "suggested_people",
        "visible": true,
        "order": 2,
        "config": {
          "title": "People You May Know",
          "limit": 5
        }
      },
      {
        "id": "recommended_spaces",
        "visible": true,
        "order": 3,
        "config": {
          "title": "Spaces to Explore",
          "limit": 3
        }
      },
      {
        "id": "trending_stories",
        "visible": true,
        "order": 4,
        "config": {
          "title": "Trending Stories",
          "limit": 3
        }
      },
      {
        "id": "open_needs",
        "visible": true,
        "order": 5,
        "config": {
          "title": "Open Contribution Needs",
          "limit": 3
        }
      }
    ]
  }'::jsonb
);

-- ============================================================================
-- STEP 3: Create New Users Cohort + Policy
-- ============================================================================

-- Insert new_users cohort
INSERT INTO ada_cohorts (
  name,
  description,
  is_active,
  criteria
) VALUES (
  'new_users',
  'Users who joined within the last 7 days',
  true,
  '{
    "max_account_age_days": 7,
    "description": "New members who need onboarding support and connection building"
  }'::jsonb
);

-- Insert new_users modules policy
INSERT INTO ada_policies (
  name,
  type,
  scope,
  description,
  is_active,
  config
) VALUES (
  'New User Modules',
  'modules',
  'cohort',
  'Simplified, onboarding-focused module configuration for new users',
  true,
  '{
    "cohort_id": "new_users",
    "modules": [
      {
        "id": "resume_section",
        "visible": true,
        "order": 1,
        "config": {
          "title": "Complete Your Profile",
          "priority": "high",
          "message": "Help others discover you by completing your profile"
        }
      },
      {
        "id": "whats_next",
        "visible": true,
        "order": 2,
        "config": {
          "title": "Getting Started",
          "steps": [
            "Complete your profile",
            "Connect with 3 people",
            "Join a community",
            "Attend your first event"
          ]
        }
      },
      {
        "id": "suggested_people",
        "visible": true,
        "order": 3,
        "config": {
          "title": "Start Building Your Network",
          "limit": 8,
          "emphasis": "connection"
        }
      },
      {
        "id": "upcoming_events",
        "visible": true,
        "order": 4,
        "config": {
          "title": "Events to Get You Started",
          "limit": 3,
          "filter": "beginner_friendly"
        }
      },
      {
        "id": "trending_stories",
        "visible": false,
        "order": 5
      },
      {
        "id": "open_needs",
        "visible": false,
        "order": 6
      }
    ]
  }'::jsonb
);

-- ============================================================================
-- STEP 4: Create Event Organizers Cohort + Policy
-- ============================================================================

-- Insert event_organizers cohort
INSERT INTO ada_cohorts (
  name,
  description,
  is_active,
  criteria
) VALUES (
  'event_organizers',
  'Users who have created at least one event',
  true,
  '{
    "min_events_created": 1,
    "description": "Active event organizers who need space management and engagement tools"
  }'::jsonb
);

-- Insert event_organizers modules policy
INSERT INTO ada_policies (
  name,
  type,
  scope,
  description,
  is_active,
  config
) VALUES (
  'Event Organizer Modules',
  'modules',
  'cohort',
  'Event and space-focused module configuration for organizers',
  true,
  '{
    "cohort_id": "event_organizers",
    "modules": [
      {
        "id": "upcoming_events",
        "visible": true,
        "order": 1,
        "config": {
          "title": "Your Events & Upcoming",
          "limit": 5,
          "show_managed_first": true,
          "show_create_cta": true
        }
      },
      {
        "id": "recommended_spaces",
        "visible": true,
        "order": 2,
        "config": {
          "title": "Collaboration Spaces",
          "limit": 4,
          "show_manage_cta": true
        }
      },
      {
        "id": "open_needs",
        "visible": true,
        "order": 3,
        "config": {
          "title": "Contribution Opportunities",
          "limit": 4,
          "filter": "relevant_to_organizer"
        }
      },
      {
        "id": "suggested_people",
        "visible": true,
        "order": 4,
        "config": {
          "title": "Potential Collaborators",
          "limit": 5,
          "filter": "organizers_and_active"
        }
      },
      {
        "id": "trending_stories",
        "visible": true,
        "order": 5,
        "config": {
          "title": "Community Stories",
          "limit": 2
        }
      },
      {
        "id": "resume_section",
        "visible": false,
        "order": 6
      }
    ]
  }'::jsonb
);

-- ============================================================================
-- STEP 5: Link Cohort Policies (Update with actual cohort_id)
-- ============================================================================

-- Update new_users policy with actual cohort_id
UPDATE ada_policies
SET config = jsonb_set(
  config,
  '{cohort_id}',
  to_jsonb((SELECT id FROM ada_cohorts WHERE name = 'new_users')::text)
)
WHERE name = 'New User Modules';

-- Update event_organizers policy with actual cohort_id
UPDATE ada_policies
SET config = jsonb_set(
  config,
  '{cohort_id}',
  to_jsonb((SELECT id FROM ada_cohorts WHERE name = 'event_organizers')::text)
)
WHERE name = 'Event Organizer Modules';

-- ============================================================================
-- STEP 6: Grant Execute Permission on Function
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_user_cohorts(UUID) TO authenticated;

-- ============================================================================
-- Verification Queries (commented out - uncomment to test)
-- ============================================================================

-- Check created policies
-- SELECT id, name, type, scope, is_active FROM ada_policies ORDER BY created_at;

-- Check created cohorts
-- SELECT id, name, description, is_active FROM ada_cohorts ORDER BY created_at;

-- Test cohort evaluation for current user
-- SELECT * FROM get_user_cohorts(auth.uid());