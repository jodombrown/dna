-- Add indexes for frequently queried foreign keys

-- User-related foreign keys (high priority)
CREATE INDEX IF NOT EXISTS idx_adin_nudges_user_id ON public.adin_nudges(user_id);
CREATE INDEX IF NOT EXISTS idx_adin_nudges_connection_id ON public.adin_nudges(connection_id);
CREATE INDEX IF NOT EXISTS idx_adin_recommendations_user_id ON public.adin_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_adin_recommendations_connection_id ON public.adin_recommendations(for_connection_id);

-- Connection-related foreign keys
CREATE INDEX IF NOT EXISTS idx_connections_a ON public.connections(a);
CREATE INDEX IF NOT EXISTS idx_connections_b ON public.connections(b);

-- Notifications (very frequently queried)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Profile foreign keys
CREATE INDEX IF NOT EXISTS idx_profiles_country_of_origin_id ON public.profiles(country_of_origin_id);
CREATE INDEX IF NOT EXISTS idx_profiles_current_country_id ON public.profiles(current_country_id);

-- Opportunity applications (frequently queried)
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_applicant_id ON public.opportunity_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_reviewed_by ON public.opportunity_applications(reviewed_by);

-- Event-related foreign keys
CREATE INDEX IF NOT EXISTS idx_event_registrations_ticket_type_id ON public.event_registrations(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_event_ticket_types_event_id ON public.event_ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_event_blasts_event_id ON public.event_blasts(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registration_questions_event_id ON public.event_registration_questions(event_id);

-- Organization-related
CREATE INDEX IF NOT EXISTS idx_organizations_owner_user_id ON public.organizations(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_country_id ON public.organizations(country_id);
CREATE INDEX IF NOT EXISTS idx_org_verification_reviewed_by ON public.organization_verification_requests(reviewed_by);

-- Profile relations
CREATE INDEX IF NOT EXISTS idx_profile_causes_cause_id ON public.profile_causes(cause_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_skill_id ON public.profile_skills(skill_id);

-- Messaging
CREATE INDEX IF NOT EXISTS idx_group_messages_conversation_id ON public.group_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender_id ON public.group_messages(sender_id);

-- Geographic data
CREATE INDEX IF NOT EXISTS idx_regions_continent_id ON public.regions(continent_id);
CREATE INDEX IF NOT EXISTS idx_economic_indicators_region_id ON public.economic_indicators(region_id);
CREATE INDEX IF NOT EXISTS idx_economic_indicators_province_id ON public.economic_indicators(province_id);

-- Contributions and impact
CREATE INDEX IF NOT EXISTS idx_opportunity_contributions_opportunity_id ON public.opportunity_contributions(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_contributions_contributor_id ON public.opportunity_contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_impact_attributions_connection_id ON public.impact_attributions(connection_id);

-- Other frequently accessed relations
CREATE INDEX IF NOT EXISTS idx_post_analytics_user_id ON public.post_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewer_id ON public.post_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_project_contributions_project_id ON public.project_contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by ON public.user_roles(granted_by);