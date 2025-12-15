-- Feedback Chat System Migration
-- Creates tables for the in-app feedback messenger feature

-- Create feedback_threads table
CREATE TABLE IF NOT EXISTS public.feedback_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'bug' CHECK (type IN ('bug', 'idea', 'question')),
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    subject TEXT,
    context JSONB NOT NULL DEFAULT '{}',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Create feedback_messages table
CREATE TABLE IF NOT EXISTS public.feedback_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.feedback_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_from_team BOOLEAN NOT NULL DEFAULT FALSE,
    attachment_url TEXT,
    attachment_type TEXT,
    attachment_filename TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_threads_user_id ON public.feedback_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_threads_status ON public.feedback_threads(status);
CREATE INDEX IF NOT EXISTS idx_feedback_threads_type ON public.feedback_threads(type);
CREATE INDEX IF NOT EXISTS idx_feedback_threads_assigned_to ON public.feedback_threads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_feedback_threads_updated_at ON public.feedback_threads(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_messages_thread_id ON public.feedback_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_sender_id ON public.feedback_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_created_at ON public.feedback_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.feedback_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback_threads

-- Users can view their own threads
CREATE POLICY "Users can view own feedback threads"
    ON public.feedback_threads
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own threads
CREATE POLICY "Users can create own feedback threads"
    ON public.feedback_threads
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own threads (e.g., change type)
CREATE POLICY "Users can update own feedback threads"
    ON public.feedback_threads
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admin/team members can view all threads (for inbox)
-- This policy allows users with admin role to see all feedback
CREATE POLICY "Admins can view all feedback threads"
    ON public.feedback_threads
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'moderator' OR role = 'support')
        )
    );

-- Admin/team members can update any thread
CREATE POLICY "Admins can update all feedback threads"
    ON public.feedback_threads
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'moderator' OR role = 'support')
        )
    );

-- RLS Policies for feedback_messages

-- Users can view messages in their own threads
CREATE POLICY "Users can view messages in own threads"
    ON public.feedback_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.feedback_threads
            WHERE id = feedback_messages.thread_id
            AND user_id = auth.uid()
        )
    );

-- Users can send messages to their own threads
CREATE POLICY "Users can send messages to own threads"
    ON public.feedback_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.feedback_threads
            WHERE id = feedback_messages.thread_id
            AND user_id = auth.uid()
        )
    );

-- Admin/team members can view all messages
CREATE POLICY "Admins can view all feedback messages"
    ON public.feedback_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'moderator' OR role = 'support')
        )
    );

-- Admin/team members can send messages to any thread (as team)
CREATE POLICY "Admins can send messages to any thread"
    ON public.feedback_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'moderator' OR role = 'support')
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.feedback_threads
    SET updated_at = NOW()
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update thread updated_at when new message is added
DROP TRIGGER IF EXISTS trigger_update_feedback_thread_updated_at ON public.feedback_messages;
CREATE TRIGGER trigger_update_feedback_thread_updated_at
    AFTER INSERT ON public.feedback_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_thread_updated_at();

-- Grant permissions
GRANT ALL ON public.feedback_threads TO authenticated;
GRANT ALL ON public.feedback_messages TO authenticated;

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_messages;

-- Add comment for documentation
COMMENT ON TABLE public.feedback_threads IS 'Feedback threads from users - each user has one active thread for DM-style feedback';
COMMENT ON TABLE public.feedback_messages IS 'Messages within feedback threads - supports text and attachments';
