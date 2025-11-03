-- Add indexes for all unindexed foreign keys to improve query performance

-- adin_contributor_requests
CREATE INDEX IF NOT EXISTS idx_adin_contributor_requests_reviewed_by ON public.adin_contributor_requests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_adin_contributor_requests_user_id ON public.adin_contributor_requests(user_id);

-- adin_nudges
CREATE INDEX IF NOT EXISTS idx_adin_nudges_user_id ON public.adin_nudges(user_id);

-- adin_recommendations
CREATE INDEX IF NOT EXISTS idx_adin_recommendations_user_id ON public.adin_recommendations(user_id);

-- adin_signals
CREATE INDEX IF NOT EXISTS idx_adin_signals_created_by ON public.adin_signals(created_by);
CREATE INDEX IF NOT EXISTS idx_adin_signals_user_id ON public.adin_signals(user_id);

-- applications
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON public.applications(opportunity_id);

-- billing_transactions
CREATE INDEX IF NOT EXISTS idx_billing_transactions_organization_id ON public.billing_transactions(organization_id);

-- comments
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- communities
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON public.communities(created_by);
CREATE INDEX IF NOT EXISTS idx_communities_moderated_by ON public.communities(moderated_by);

-- community_events
CREATE INDEX IF NOT EXISTS idx_community_events_community_id ON public.community_events(community_id);
CREATE INDEX IF NOT EXISTS idx_community_events_created_by ON public.community_events(created_by);

-- community_memberships
CREATE INDEX IF NOT EXISTS idx_community_memberships_approved_by ON public.community_memberships(approved_by);
CREATE INDEX IF NOT EXISTS idx_community_memberships_community_id ON public.community_memberships(community_id);

-- community_posts
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON public.community_posts(community_id);

-- content_flags
CREATE INDEX IF NOT EXISTS idx_content_flags_flagged_by ON public.content_flags(flagged_by);
CREATE INDEX IF NOT EXISTS idx_content_flags_resolved_by ON public.content_flags(resolved_by);

-- content_moderation
CREATE INDEX IF NOT EXISTS idx_content_moderation_moderator_id ON public.content_moderation(moderator_id);

-- contribution_cards
CREATE INDEX IF NOT EXISTS idx_contribution_cards_created_by ON public.contribution_cards(created_by);

-- economic_indicators
CREATE INDEX IF NOT EXISTS idx_economic_indicators_province_id ON public.economic_indicators(province_id);
CREATE INDEX IF NOT EXISTS idx_economic_indicators_region_id ON public.economic_indicators(region_id);

-- event_blasts
CREATE INDEX IF NOT EXISTS idx_event_blasts_event_id ON public.event_blasts(event_id);

-- event_registration_questions
CREATE INDEX IF NOT EXISTS idx_event_registration_questions_event_id ON public.event_registration_questions(event_id);

-- event_registrations
CREATE INDEX IF NOT EXISTS idx_event_registrations_ticket_type_id ON public.event_registrations(ticket_type_id);

-- event_reports
CREATE INDEX IF NOT EXISTS idx_event_reports_event_id ON public.event_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reports_reported_by ON public.event_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_event_reports_reviewed_by ON public.event_reports(reviewed_by);

-- event_ticket_holds
CREATE INDEX IF NOT EXISTS idx_event_ticket_holds_ticket_type_id ON public.event_ticket_holds(ticket_type_id);

-- event_ticket_types
CREATE INDEX IF NOT EXISTS idx_event_ticket_types_event_id ON public.event_ticket_types(event_id);

-- group_join_requests
CREATE INDEX IF NOT EXISTS idx_group_join_requests_reviewed_by ON public.group_join_requests(reviewed_by);

-- group_members
CREATE INDEX IF NOT EXISTS idx_group_members_banned_by ON public.group_members(banned_by);

-- group_messages
CREATE INDEX IF NOT EXISTS idx_group_messages_conversation_id ON public.group_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender_id ON public.group_messages(sender_id);

-- impact_attributions
CREATE INDEX IF NOT EXISTS idx_impact_attributions_verified_by ON public.impact_attributions(verified_by);

-- innovation_data
CREATE INDEX IF NOT EXISTS idx_innovation_data_province_id ON public.innovation_data(province_id);

-- monthly_reports
CREATE INDEX IF NOT EXISTS idx_monthly_reports_country_id ON public.monthly_reports(country_id);

-- newsletter_subscriptions
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_region_interest ON public.newsletter_subscriptions(region_interest);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- opportunity_applications
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_applicant_id ON public.opportunity_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_reviewed_by ON public.opportunity_applications(reviewed_by);

-- opportunity_contributions
CREATE INDEX IF NOT EXISTS idx_opportunity_contributions_contributor_id ON public.opportunity_contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_contributions_opportunity_id ON public.opportunity_contributions(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_contributions_verified_by ON public.opportunity_contributions(verified_by);

-- organization_verification_requests
CREATE INDEX IF NOT EXISTS idx_organization_verification_requests_reviewed_by ON public.organization_verification_requests(reviewed_by);

-- organizations
CREATE INDEX IF NOT EXISTS idx_organizations_country_id ON public.organizations(country_id);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_user_id ON public.organizations(owner_user_id);

-- post_analytics
CREATE INDEX IF NOT EXISTS idx_post_analytics_user_id ON public.post_analytics(user_id);

-- post_views
CREATE INDEX IF NOT EXISTS idx_post_views_viewer_id ON public.post_views(viewer_id);

-- profile_causes
CREATE INDEX IF NOT EXISTS idx_profile_causes_cause_id ON public.profile_causes(cause_id);