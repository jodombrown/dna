-- ============================================
-- BATCH 3: TRIGGERS AND SEED DATA
-- ============================================

-- FUNCTION: Update space activity
CREATE OR REPLACE FUNCTION update_space_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.space_id IS NOT NULL THEN
    UPDATE public.spaces 
    SET last_activity_at = now(), updated_at = now() 
    WHERE id = NEW.space_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCTION: Auto-add creator as member
CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.space_members (space_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.created_by, 'lead', now())
  ON CONFLICT (space_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP EXISTING TRIGGERS
DROP TRIGGER IF EXISTS task_activity_trigger ON public.tasks;
DROP TRIGGER IF EXISTS initiative_activity_trigger ON public.initiatives;
DROP TRIGGER IF EXISTS space_creator_member_trigger ON public.spaces;

-- CREATE TRIGGERS
CREATE TRIGGER task_activity_trigger
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_space_activity();

CREATE TRIGGER initiative_activity_trigger
  AFTER INSERT OR UPDATE ON public.initiatives
  FOR EACH ROW EXECUTE FUNCTION update_space_activity();

CREATE TRIGGER space_creator_member_trigger
  AFTER INSERT ON public.spaces
  FOR EACH ROW EXECUTE FUNCTION add_creator_as_member();

-- SEED TEMPLATES
INSERT INTO public.space_templates (name, description, icon, category, default_roles, default_initiatives, suggested_milestones, tier_availability)
SELECT * FROM (VALUES
  ('Mentorship Circle', 
   'Structured guidance between experienced diaspora members and those seeking development',
   'graduation-cap',
   'learning',
   '[{"title": "Circle Lead", "description": "Oversees the mentorship program", "is_lead": true, "permissions": {"can_edit_space": true, "can_invite_members": true, "can_create_initiatives": true, "can_assign_tasks": true, "can_send_nudges": true, "can_manage_roles": true}}, {"title": "Mentor", "description": "Provides guidance and support to mentees", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}, {"title": "Mentee", "description": "Receives guidance and develops skills", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}, {"title": "Program Coordinator", "description": "Handles logistics and scheduling", "is_lead": false, "permissions": {"can_invite_members": true, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": true}}]'::jsonb,
   '[{"title": "Mentorship Cohort", "description": "Main mentorship program initiative"}]'::jsonb,
   '[{"title": "Mentor/Mentee Matching Complete"}, {"title": "First Sessions Complete"}, {"title": "Mid-Program Check-in"}, {"title": "Program Graduation"}]'::jsonb,
   ARRAY['free', 'pro', 'org']),
   
  ('Investment Syndicate',
   'Pooled capital coordination for Africa-focused investments',
   'trending-up',
   'investment',
   '[{"title": "Managing Partner", "description": "Leads deal sourcing and execution", "is_lead": true, "permissions": {"can_edit_space": true, "can_invite_members": true, "can_create_initiatives": true, "can_assign_tasks": true, "can_send_nudges": true, "can_manage_roles": true}}, {"title": "Limited Partner", "description": "Investment contributor", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}, {"title": "Legal Advisor", "description": "Reviews legal structure and documents", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}, {"title": "Investor Relations", "description": "Manages communication with investors", "is_lead": false, "permissions": {"can_invite_members": true, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": true}}]'::jsonb,
   '[{"title": "Due Diligence", "description": "Research and vetting phase"}, {"title": "Capital Raise", "description": "Securing commitments"}, {"title": "Deal Execution", "description": "Closing the investment"}]'::jsonb,
   '[{"title": "Deal Sourced"}, {"title": "Due Diligence Complete"}, {"title": "Commitments Secured"}, {"title": "Investment Closed"}]'::jsonb,
   ARRAY['pro', 'org']),
   
  ('Event Planning Committee',
   'Coordinating diaspora events, conferences, and cultural celebrations',
   'calendar',
   'community',
   '[{"title": "Event Lead", "description": "Overall event coordination", "is_lead": true, "permissions": {"can_edit_space": true, "can_invite_members": true, "can_create_initiatives": true, "can_assign_tasks": true, "can_send_nudges": true, "can_manage_roles": true}}, {"title": "Logistics", "description": "Venue, catering, equipment", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": false}}, {"title": "Marketing", "description": "Promotion and communications", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": false}}, {"title": "Sponsorship", "description": "Partner and sponsor relations", "is_lead": false, "permissions": {"can_invite_members": true, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}, {"title": "Volunteer Coordinator", "description": "Manages volunteer team", "is_lead": false, "permissions": {"can_invite_members": true, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": true}}]'::jsonb,
   '[{"title": "Planning Phase", "description": "Pre-event preparation"}, {"title": "Execution Phase", "description": "Event delivery"}, {"title": "Post-Event", "description": "Follow-up and retrospective"}]'::jsonb,
   '[{"title": "Venue Secured"}, {"title": "Speakers Confirmed"}, {"title": "Registrations Open"}, {"title": "Event Complete"}, {"title": "Retrospective Done"}]'::jsonb,
   ARRAY['free', 'pro', 'org']),
   
  ('Skill-Building Cohort',
   'Peer learning groups for professional development',
   'book-open',
   'learning',
   '[{"title": "Facilitator", "description": "Guides the cohort structure", "is_lead": true, "permissions": {"can_edit_space": true, "can_invite_members": true, "can_create_initiatives": true, "can_assign_tasks": true, "can_send_nudges": true, "can_manage_roles": true}}, {"title": "Session Lead", "description": "Leads individual sessions (rotating)", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": false}}, {"title": "Member", "description": "Active participant in learning", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}]'::jsonb,
   '[{"title": "Monthly Skill Shares", "description": "Ongoing learning sessions"}, {"title": "Portfolio Reviews", "description": "Peer feedback on work"}]'::jsonb,
   '[{"title": "Cohort Kickoff"}, {"title": "First Session Complete"}, {"title": "Mid-Cohort Checkpoint"}, {"title": "Cohort Showcase"}]'::jsonb,
   ARRAY['free', 'pro', 'org']),
   
  ('Advocacy Campaign',
   'Policy advocacy, awareness campaigns, and collective action initiatives',
   'megaphone',
   'advocacy',
   '[{"title": "Campaign Lead", "description": "Overall campaign strategy", "is_lead": true, "permissions": {"can_edit_space": true, "can_invite_members": true, "can_create_initiatives": true, "can_assign_tasks": true, "can_send_nudges": true, "can_manage_roles": true}}, {"title": "Research", "description": "Data and position development", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}, {"title": "Outreach", "description": "Coalition building and recruitment", "is_lead": false, "permissions": {"can_invite_members": true, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}, {"title": "Communications", "description": "Public messaging and media", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": false}}, {"title": "Legal Review", "description": "Ensures compliance and accuracy", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}]'::jsonb,
   '[{"title": "Research & Position Development", "description": "Building the case"}, {"title": "Coalition Building", "description": "Growing support"}, {"title": "Public Campaign", "description": "Awareness and action"}]'::jsonb,
   '[{"title": "Position Paper Draft"}, {"title": "Coalition Partners Confirmed"}, {"title": "Signature Goal Reached"}, {"title": "Submission Complete"}]'::jsonb,
   ARRAY['free', 'pro', 'org'])
) AS t(name, description, icon, category, default_roles, default_initiatives, suggested_milestones, tier_availability)
WHERE NOT EXISTS (SELECT 1 FROM public.space_templates WHERE space_templates.name = t.name);