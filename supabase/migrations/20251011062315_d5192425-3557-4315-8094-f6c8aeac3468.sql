-- Remove unused indexes to improve write performance

-- Collaboration memberships
DROP INDEX IF EXISTS idx_collab_memberships_user;
DROP INDEX IF EXISTS idx_collab_memberships_space;

-- Comments
DROP INDEX IF EXISTS idx_comments_author_created_at;
DROP INDEX IF EXISTS idx_comments_author_id;
DROP INDEX IF EXISTS idx_comments_parent_id;
DROP INDEX IF EXISTS idx_comments_post_id;

-- Communities
DROP INDEX IF EXISTS idx_communities_created_by;
DROP INDEX IF EXISTS idx_communities_moderated_by;
DROP INDEX IF EXISTS idx_communities_moderation_status;

-- Contribution cards
DROP INDEX IF EXISTS idx_cards_created_at;
DROP INDEX IF EXISTS idx_cards_type_status;

-- Applications
DROP INDEX IF EXISTS idx_applications_opportunity_id;
DROP INDEX IF EXISTS idx_applications_status;
DROP INDEX IF EXISTS idx_applications_user_id;

-- Billing
DROP INDEX IF EXISTS idx_billing_org;
DROP INDEX IF EXISTS idx_billing_stripe_payment;

-- Adin signals
DROP INDEX IF EXISTS idx_adin_signals_created_by;
DROP INDEX IF EXISTS idx_adin_signals_region_focus;
DROP INDEX IF EXISTS idx_adin_signals_sector_focus;
DROP INDEX IF EXISTS idx_adin_signals_user_id;

-- Adin contributor requests
DROP INDEX IF EXISTS idx_adin_contributor_requests_reviewed_by;
DROP INDEX IF EXISTS idx_adin_contributor_requests_user_id;