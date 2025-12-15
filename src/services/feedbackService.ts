import { supabase } from '@/integrations/supabase/client';

/**
 * Feedback types and status
 */
export type FeedbackType = 'bug' | 'idea' | 'question';
export type FeedbackStatus = 'received' | 'in_progress' | 'resolved' | 'closed';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Context captured automatically with feedback
 */
export interface FeedbackContext {
  page_url: string;
  page_title: string;
  browser: string;
  os: string;
  screen_size: string;
  user_agent: string;
  app_version: string;
  timestamp: string;
}

/**
 * Feedback thread (the conversation between user and engineering team)
 */
export interface FeedbackThread {
  id: string;
  user_id: string;
  type: FeedbackType;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  subject: string | null;
  context: FeedbackContext;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
}

/**
 * Feedback message in a thread
 */
export interface FeedbackMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  is_from_team: boolean;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_filename: string | null;
  created_at: string;
}

/**
 * Message with sender info
 */
export interface FeedbackMessageWithSender extends FeedbackMessage {
  sender_full_name: string;
  sender_avatar_url: string;
}

/**
 * Thread list item for inbox view
 */
export interface FeedbackThreadListItem extends FeedbackThread {
  user_full_name: string;
  user_avatar_url: string;
  user_email: string;
  last_message_content: string | null;
  last_message_at: string | null;
  unread_count: number;
}

/**
 * Capture browser context automatically
 */
export function captureFeedbackContext(): FeedbackContext {
  const ua = navigator.userAgent;

  // Parse browser
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  // Parse OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return {
    page_url: window.location.href,
    page_title: document.title,
    browser,
    os,
    screen_size: `${window.innerWidth}x${window.innerHeight}`,
    user_agent: ua,
    app_version: '1.0.0', // Could be from env or config
    timestamp: new Date().toISOString(),
  };
}

/**
 * Feedback Service - handles all feedback chat operations
 */
export const feedbackService = {
  /**
   * Get or create a feedback thread for the current user
   * Users have one active thread at a time (can have multiple if previous ones are resolved)
   */
  async getOrCreateThread(type: FeedbackType = 'bug'): Promise<FeedbackThread> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check for existing active thread (not resolved or closed)
    const { data: existingThread, error: findError } = await supabase
      .from('feedback_threads')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['received', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error('[feedbackService] Error finding thread:', findError);
      throw findError;
    }

    if (existingThread) {
      return existingThread as FeedbackThread;
    }

    // Create new thread
    const context = captureFeedbackContext();
    const { data: newThread, error: createError } = await supabase
      .from('feedback_threads')
      .insert({
        user_id: user.id,
        type,
        status: 'received',
        priority: 'medium',
        context,
      })
      .select()
      .single();

    if (createError) {
      console.error('[feedbackService] Error creating thread:', createError);
      throw createError;
    }

    return newThread as FeedbackThread;
  },

  /**
   * Get an existing thread by ID
   */
  async getThread(threadId: string): Promise<FeedbackThread | null> {
    const { data, error } = await supabase
      .from('feedback_threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (error) {
      console.error('[feedbackService] Error getting thread:', error);
      return null;
    }

    return data as FeedbackThread;
  },

  /**
   * Get the current user's active thread (if any)
   */
  async getCurrentThread(): Promise<FeedbackThread | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('feedback_threads')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['received', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[feedbackService] Error getting current thread:', error);
      return null;
    }

    return data as FeedbackThread | null;
  },

  /**
   * Update thread type (bug/idea/question)
   */
  async updateThreadType(threadId: string, type: FeedbackType): Promise<void> {
    const { error } = await supabase
      .from('feedback_threads')
      .update({ type, updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (error) throw error;
  },

  /**
   * Get messages for a feedback thread
   */
  async getMessages(threadId: string): Promise<FeedbackMessageWithSender[]> {
    const { data: messages, error } = await supabase
      .from('feedback_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[feedbackService] Error getting messages:', error);
      throw error;
    }

    if (!messages || messages.length === 0) {
      return [];
    }

    // Get unique sender IDs
    const senderIds = [...new Set(messages.map(m => m.sender_id))];

    // Get sender profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', senderIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return messages.map(m => ({
      ...m,
      sender_full_name: profileMap.get(m.sender_id)?.full_name || 'Unknown',
      sender_avatar_url: profileMap.get(m.sender_id)?.avatar_url || '',
    })) as FeedbackMessageWithSender[];
  },

  /**
   * Send a feedback message
   */
  async sendMessage(
    threadId: string,
    content: string,
    attachment?: { url: string; type: string; filename: string }
  ): Promise<FeedbackMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('feedback_messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content: content.trim(),
        is_from_team: false, // Regular users send as non-team
        attachment_url: attachment?.url || null,
        attachment_type: attachment?.type || null,
        attachment_filename: attachment?.filename || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[feedbackService] Error sending message:', error);
      throw error;
    }

    // Update thread's updated_at
    await supabase
      .from('feedback_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    return data as FeedbackMessage;
  },

  /**
   * Subscribe to new messages in a thread
   */
  subscribeToMessages(
    threadId: string,
    onNewMessage: (message: FeedbackMessage) => void
  ) {
    const channel = supabase
      .channel(`feedback:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          onNewMessage(payload.new as FeedbackMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to thread status changes
   */
  subscribeToThreadUpdates(
    threadId: string,
    onUpdate: (thread: FeedbackThread) => void
  ) {
    const channel = supabase
      .channel(`feedback-thread:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feedback_threads',
          filter: `id=eq.${threadId}`,
        },
        (payload) => {
          onUpdate(payload.new as FeedbackThread);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // =====================================================
  // ADMIN FUNCTIONS (for engineering team)
  // =====================================================

  /**
   * Get all feedback threads (admin view)
   */
  async getAllThreads(
    filters?: {
      status?: FeedbackStatus[];
      type?: FeedbackType[];
      priority?: FeedbackPriority[];
      assignedTo?: string;
    },
    limit: number = 50
  ): Promise<FeedbackThreadListItem[]> {
    let query = supabase
      .from('feedback_threads')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.type?.length) {
      query = query.in('type', filters.type);
    }
    if (filters?.priority?.length) {
      query = query.in('priority', filters.priority);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    const { data: threads, error } = await query;

    if (error) {
      console.error('[feedbackService] Error getting threads:', error);
      throw error;
    }

    if (!threads || threads.length === 0) {
      return [];
    }

    // Get user profiles
    const userIds = [...new Set(threads.map(t => t.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    // Get user emails from auth (via profile join or separate query)
    const { data: authUsers } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    const emailMap = new Map(authUsers?.map(u => [u.id, u.username]) || []);

    // Build thread list items with additional info
    const result: FeedbackThreadListItem[] = [];
    for (const thread of threads) {
      // Get last message
      const { data: lastMessage } = await supabase
        .from('feedback_messages')
        .select('content, created_at')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get unread count (messages from user that haven't been read)
      const { count: unreadCount } = await supabase
        .from('feedback_messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id)
        .eq('is_from_team', false);

      result.push({
        ...thread,
        user_full_name: profileMap.get(thread.user_id)?.full_name || 'Unknown User',
        user_avatar_url: profileMap.get(thread.user_id)?.avatar_url || '',
        user_email: emailMap.get(thread.user_id) || '',
        last_message_content: lastMessage?.content || null,
        last_message_at: lastMessage?.created_at || thread.created_at,
        unread_count: unreadCount || 0,
      } as FeedbackThreadListItem);
    }

    return result;
  },

  /**
   * Update thread status (admin)
   */
  async updateThreadStatus(threadId: string, status: FeedbackStatus): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('feedback_threads')
      .update(updateData)
      .eq('id', threadId);

    if (error) throw error;
  },

  /**
   * Update thread priority (admin)
   */
  async updateThreadPriority(threadId: string, priority: FeedbackPriority): Promise<void> {
    const { error } = await supabase
      .from('feedback_threads')
      .update({ priority, updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (error) throw error;
  },

  /**
   * Assign thread to team member (admin)
   */
  async assignThread(threadId: string, assigneeId: string | null): Promise<void> {
    const { error } = await supabase
      .from('feedback_threads')
      .update({
        assigned_to: assigneeId,
        updated_at: new Date().toISOString(),
        status: assigneeId ? 'in_progress' : 'received',
      })
      .eq('id', threadId);

    if (error) throw error;
  },

  /**
   * Send reply as team member (admin)
   */
  async sendTeamReply(
    threadId: string,
    content: string,
    attachment?: { url: string; type: string; filename: string }
  ): Promise<FeedbackMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('feedback_messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content: content.trim(),
        is_from_team: true,
        attachment_url: attachment?.url || null,
        attachment_type: attachment?.type || null,
        attachment_filename: attachment?.filename || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[feedbackService] Error sending team reply:', error);
      throw error;
    }

    // Update thread status to in_progress if it was just received
    const { data: thread } = await supabase
      .from('feedback_threads')
      .select('status')
      .eq('id', threadId)
      .single();

    if (thread?.status === 'received') {
      await supabase
        .from('feedback_threads')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', threadId);
    } else {
      await supabase
        .from('feedback_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);
    }

    return data as FeedbackMessage;
  },

  /**
   * Get stats for feedback inbox (admin)
   */
  async getStats(): Promise<{
    total: number;
    received: number;
    in_progress: number;
    resolved: number;
    bugs: number;
    ideas: number;
    questions: number;
  }> {
    const { data: threads, error } = await supabase
      .from('feedback_threads')
      .select('status, type');

    if (error) {
      console.error('[feedbackService] Error getting stats:', error);
      return { total: 0, received: 0, in_progress: 0, resolved: 0, bugs: 0, ideas: 0, questions: 0 };
    }

    const stats = {
      total: threads?.length || 0,
      received: threads?.filter(t => t.status === 'received').length || 0,
      in_progress: threads?.filter(t => t.status === 'in_progress').length || 0,
      resolved: threads?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0,
      bugs: threads?.filter(t => t.type === 'bug').length || 0,
      ideas: threads?.filter(t => t.type === 'idea').length || 0,
      questions: threads?.filter(t => t.type === 'question').length || 0,
    };

    return stats;
  },
};
