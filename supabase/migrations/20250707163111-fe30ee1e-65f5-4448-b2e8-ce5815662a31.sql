-- Add remaining missing indexes for foreign keys to improve query performance
-- These are essential for tables that will be frequently joined

-- Admin system indexes - needed for admin functionality
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON public.admin_notifications(admin_id);

-- Core content indexes - needed for feed and user content queries
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);

-- Communication system indexes - needed for messaging functionality
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_receiver_id ON public.contact_requests(receiver_id);

-- Event and community indexes - needed for event and community queries
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_communities_moderated_by ON public.communities(moderated_by);
CREATE INDEX IF NOT EXISTS idx_user_communities_owner_id ON public.user_communities(owner_id);

-- User activity indexes - needed for impact tracking and notifications
CREATE INDEX IF NOT EXISTS idx_impact_log_user_id ON public.impact_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);