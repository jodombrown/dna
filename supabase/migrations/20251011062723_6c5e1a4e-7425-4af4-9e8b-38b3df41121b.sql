-- Optimize indexes: keep only critical ones, remove unused

-- Remove indexes for low-traffic or development-only tables
DROP INDEX IF EXISTS idx_adin_nudges_user_id;
DROP INDEX IF EXISTS idx_adin_nudges_connection_id;
DROP INDEX IF EXISTS idx_adin_recommendations_user_id;
DROP INDEX IF EXISTS idx_adin_recommendations_connection_id;
DROP INDEX IF EXISTS idx_profiles_country_of_origin_id;
DROP INDEX IF EXISTS idx_profiles_current_country_id;
DROP INDEX IF EXISTS idx_opportunity_applications_applicant_id;
DROP INDEX IF EXISTS idx_opportunity_applications_reviewed_by;
DROP INDEX IF EXISTS idx_event_registrations_ticket_type_id;
DROP INDEX IF EXISTS idx_event_ticket_types_event_id;
DROP INDEX IF EXISTS idx_event_blasts_event_id;
DROP INDEX IF EXISTS idx_event_registration_questions_event_id;
DROP INDEX IF EXISTS idx_organizations_owner_user_id;
DROP INDEX IF EXISTS idx_organizations_country_id;
DROP INDEX IF EXISTS idx_org_verification_reviewed_by;
DROP INDEX IF EXISTS idx_profile_causes_cause_id;
DROP INDEX IF EXISTS idx_profile_skills_skill_id;
DROP INDEX IF EXISTS idx_group_messages_conversation_id;
DROP INDEX IF EXISTS idx_group_messages_sender_id;
DROP INDEX IF EXISTS idx_regions_continent_id;
DROP INDEX IF EXISTS idx_economic_indicators_region_id;
DROP INDEX IF EXISTS idx_economic_indicators_province_id;
DROP INDEX IF EXISTS idx_opportunity_contributions_opportunity_id;
DROP INDEX IF EXISTS idx_opportunity_contributions_contributor_id;
DROP INDEX IF EXISTS idx_impact_attributions_connection_id;
DROP INDEX IF EXISTS idx_post_analytics_user_id;
DROP INDEX IF EXISTS idx_post_views_viewer_id;
DROP INDEX IF EXISTS idx_project_contributions_project_id;
DROP INDEX IF EXISTS idx_user_roles_granted_by;

-- Keep only the most critical indexes for high-traffic tables
-- These will be used when the app scales:
-- - idx_connections_a (for user connection lookups)
-- - idx_connections_b (for bidirectional connection queries)
-- - idx_notifications_user_id (notifications are frequently queried per user)