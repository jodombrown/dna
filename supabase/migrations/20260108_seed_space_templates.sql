-- Seed file: 20260108_seed_space_templates.sql
-- DNA COLLABORATE: Default Space Templates

INSERT INTO public.space_templates (name, description, icon, category, default_roles, default_initiatives, suggested_milestones, tier_availability) VALUES

-- Mentorship Circle
('Mentorship Circle',
 'Structured guidance between experienced diaspora members and those seeking development',
 'graduation-cap',
 'learning',
 '[
   {"title": "Circle Lead", "description": "Oversees the mentorship program", "is_lead": true, "permissions": {"can_edit_space": true, "can_invite_members": true, "can_create_initiatives": true, "can_assign_tasks": true, "can_send_nudges": true, "can_manage_roles": true}},
   {"title": "Mentor", "description": "Provides guidance and support to mentees", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}},
   {"title": "Mentee", "description": "Receives guidance and develops skills", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}},
   {"title": "Program Coordinator", "description": "Handles logistics and scheduling", "is_lead": false, "permissions": {"can_invite_members": true, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": true}}
 ]'::jsonb,
 '[{"title": "Mentorship Cohort", "description": "Main mentorship program initiative"}]'::jsonb,
 '[{"title": "Mentor/Mentee Matching Complete"}, {"title": "First Sessions Complete"}, {"title": "Mid-Program Check-in"}, {"title": "Program Graduation"}]'::jsonb,
 ARRAY['free', 'pro', 'org']),

-- Investment Syndicate
('Investment Syndicate',
 'Pooled capital coordination for Africa-focused investments',
 'trending-up',
 'investment',
 '[
   {"title": "Managing Partner", "description": "Leads deal sourcing and execution", "is_lead": true, "permissions": {"can_edit_space": true, "can_invite_members": true, "can_create_initiatives": true, "can_assign_tasks": true, "can_send_nudges": true, "can_manage_roles": true}},
   {"title": "Limited Partner", "description": "Investment contributor", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}},
   {"title": "Legal Advisor", "description": "Reviews legal structure and documents", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}},
   {"title": "Investor Relations", "description": "Manages communication with investors", "is_lead": false, "permissions": {"can_invite_members": true, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": true}}
 ]'::jsonb,
 '[{"title": "Due Diligence", "description": "Research and vetting phase"}, {"title": "Capital Raise", "description": "Securing commitments"}, {"title": "Deal Execution", "description": "Closing the investment"}, {"title": "Portfolio Management", "description": "Ongoing oversight"}]'::jsonb,
 '[{"title": "Deal Sourced"}, {"title": "Due Diligence Complete"}, {"title": "Commitments Secured"}, {"title": "Investment Closed"}, {"title": "First Distribution"}]'::jsonb,
 ARRAY['pro', 'org']),

-- Event Planning Committee
('Event Planning Committee',
 'Coordinating diaspora events, conferences, and cultural celebrations',
 'calendar',
 'community',
 '[
   {"title": "Event Lead", "description": "Overall event coordination", "is_lead": true, "permissions": {"can_edit_space": true, "can_invite_members": true, "can_create_initiatives": true, "can_assign_tasks": true, "can_send_nudges": true, "can_manage_roles": true}},
   {"title": "Logistics", "description": "Venue, catering, equipment", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": false}},
   {"title": "Marketing", "description": "Promotion and communications", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": false}},
   {"title": "Sponsorship", "description": "Partner and sponsor relations", "is_lead": false, "permissions": {"can_invite_members": true, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}},
   {"title": "Volunteer Coordinator", "description": "Manages volunteer team", "is_lead": false, "permissions": {"can_invite_members": true, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": true}}
 ]'::jsonb,
 '[{"title": "Planning Phase", "description": "Pre-event preparation"}, {"title": "Execution Phase", "description": "Event delivery"}, {"title": "Post-Event", "description": "Follow-up and retrospective"}]'::jsonb,
 '[{"title": "Venue Secured"}, {"title": "Speakers Confirmed"}, {"title": "Registrations Open"}, {"title": "Event Complete"}, {"title": "Retrospective Done"}]'::jsonb,
 ARRAY['free', 'pro', 'org']),

-- Skill-Building Cohort
('Skill-Building Cohort',
 'Peer learning groups for professional development',
 'book-open',
 'learning',
 '[
   {"title": "Facilitator", "description": "Guides the cohort structure", "is_lead": true, "permissions": {"can_edit_space": true, "can_invite_members": true, "can_create_initiatives": true, "can_assign_tasks": true, "can_send_nudges": true, "can_manage_roles": true}},
   {"title": "Session Lead", "description": "Leads individual sessions (rotating)", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": false}},
   {"title": "Member", "description": "Active participant in learning", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}
 ]'::jsonb,
 '[{"title": "Monthly Skill Shares", "description": "Ongoing learning sessions"}, {"title": "Portfolio Reviews", "description": "Peer feedback on work"}]'::jsonb,
 '[{"title": "Cohort Kickoff"}, {"title": "First Session Complete"}, {"title": "Mid-Cohort Checkpoint"}, {"title": "Cohort Showcase"}]'::jsonb,
 ARRAY['free', 'pro', 'org']),

-- Advocacy Campaign
('Advocacy Campaign',
 'Policy advocacy, awareness campaigns, and collective action initiatives',
 'megaphone',
 'advocacy',
 '[
   {"title": "Campaign Lead", "description": "Overall campaign strategy", "is_lead": true, "permissions": {"can_edit_space": true, "can_invite_members": true, "can_create_initiatives": true, "can_assign_tasks": true, "can_send_nudges": true, "can_manage_roles": true}},
   {"title": "Research", "description": "Data and position development", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}},
   {"title": "Outreach", "description": "Coalition building and recruitment", "is_lead": false, "permissions": {"can_invite_members": true, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}},
   {"title": "Communications", "description": "Public messaging and media", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": true, "can_send_nudges": false}},
   {"title": "Legal Review", "description": "Ensures compliance and accuracy", "is_lead": false, "permissions": {"can_invite_members": false, "can_create_initiatives": false, "can_assign_tasks": false, "can_send_nudges": false}}
 ]'::jsonb,
 '[{"title": "Research & Position Development", "description": "Building the case"}, {"title": "Coalition Building", "description": "Growing support"}, {"title": "Public Campaign", "description": "Awareness and action"}, {"title": "Policy Submission", "description": "Formal advocacy"}]'::jsonb,
 '[{"title": "Position Paper Draft"}, {"title": "Coalition Partners Confirmed"}, {"title": "Signature Goal Reached"}, {"title": "Submission Complete"}, {"title": "Response Received"}]'::jsonb,
 ARRAY['free', 'pro', 'org'])

ON CONFLICT DO NOTHING;
