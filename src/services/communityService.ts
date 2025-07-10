import { supabase } from '@/integrations/supabase/client';
import { CommunityWithMembership, CreateCommunityData } from '@/types/community';

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  title?: string;
  content: string;
  post_type: 'update' | 'event' | 'announcement';
  media_url?: string;
  event_date?: string;
  event_location?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CommunityEvent {
  id: string;
  community_id: string;
  created_by: string;
  title: string;
  description?: string;
  event_date: string;
  end_date?: string;
  location?: string;
  is_virtual: boolean;
  max_attendees?: number;
  registration_required: boolean;
  registration_url?: string;
  image_url?: string;
  status: 'active' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  attendee_count?: number;
  user_attendance_status?: string;
}

export interface JoinRequest {
  id: string;
  user_id: string;
  community_id: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    email?: string;
  };
}

// Community management
export const getCommunityWithMembership = async (communityId: string): Promise<CommunityWithMembership | null> => {
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('*')
    .eq('id', communityId)
    .single();

  if (communityError) throw communityError;
  if (!community) return null;

  // Get user's membership status
  const { data: membership } = await supabase
    .from('community_memberships')
    .select('*')
    .eq('community_id', communityId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
    .single();

  return {
    ...community,
    creator_id: community.created_by || '',
    user_membership: membership ? {
      ...membership,
      role: membership.role as 'admin' | 'moderator' | 'member',
      status: membership.status as 'pending' | 'approved' | 'rejected'
    } : undefined,
    is_member: membership?.status === 'approved' || false,
    user_role: membership?.role as 'admin' | 'moderator' | 'member'
  };
};

export const searchCommunities = async (searchTerm: string = '', category?: string): Promise<CommunityWithMembership[]> => {
  let query = supabase.from('communities').select('*');
  
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('member_count', { ascending: false });
  
  if (error) throw error;
  
  // Add membership status for each community
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId || !data) {
    return (data || []).map(community => ({
      ...community,
      creator_id: community.created_by || '',
      is_member: false,
      user_role: undefined,
      user_membership: undefined
    }));
  }

  const communityIds = data.map(c => c.id);
  const { data: memberships } = await supabase
    .from('community_memberships')
    .select('*')
    .in('community_id', communityIds)
    .eq('user_id', userId);

  return data.map(community => {
    const membership = memberships?.find(m => m.community_id === community.id);
    return {
      ...community,
      creator_id: community.created_by || '',
      user_membership: membership ? {
        ...membership,
        role: membership.role as 'admin' | 'moderator' | 'member',
        status: membership.status as 'pending' | 'approved' | 'rejected'
      } : undefined,
      is_member: membership?.status === 'approved' || false,
      user_role: membership?.role as 'admin' | 'moderator' | 'member'
    };
  });
};

// Join request management
export const requestToJoinCommunity = async (communityId: string): Promise<void> => {
  const { error } = await supabase
    .from('community_memberships')
    .insert({
      community_id: communityId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      status: 'pending',
      role: 'member'
    });

  if (error) throw error;
};

export const approveMembershipRequest = async (membershipId: string): Promise<void> => {
  const { error } = await supabase
    .from('community_memberships')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: (await supabase.auth.getUser()).data.user?.id
    })
    .eq('id', membershipId);

  if (error) throw error;
};

export const rejectMembershipRequest = async (membershipId: string): Promise<void> => {
  const { error } = await supabase
    .from('community_memberships')
    .update({
      status: 'rejected',
      approved_at: new Date().toISOString(),
      approved_by: (await supabase.auth.getUser()).data.user?.id
    })
    .eq('id', membershipId);

  if (error) throw error;
};

export const getPendingJoinRequests = async (communityId: string): Promise<JoinRequest[]> => {
  const { data, error } = await supabase
    .from('community_memberships')
    .select(`
      *,
      user:profiles(id, full_name, avatar_url, email)
    `)
    .eq('community_id', communityId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(item => ({
    ...item,
    status: item.status as 'pending' | 'approved' | 'rejected',
    role: item.role as 'admin' | 'moderator' | 'member',
    user: Array.isArray(item.user) && item.user.length > 0 ? item.user[0] : undefined
  }));
};

// Community posts/activity
export const getCommunityPosts = async (communityId: string): Promise<CommunityPost[]> => {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      author:profiles(id, full_name, avatar_url)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(post => ({
    ...post,
    post_type: post.post_type as 'update' | 'event' | 'announcement',
    author: Array.isArray(post.author) && post.author.length > 0 ? post.author[0] : undefined
  }));
};

export const createCommunityPost = async (post: {
  community_id: string;
  title?: string;
  content: string;
  post_type: 'update' | 'event' | 'announcement';
  media_url?: string;
  event_date?: string;
  event_location?: string;
}): Promise<CommunityPost> => {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      ...post,
      author_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select(`
      *,
      author:profiles(id, full_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return {
    ...data,
    post_type: data.post_type as 'update' | 'event' | 'announcement',
    author: Array.isArray(data.author) && data.author.length > 0 ? data.author[0] : undefined
  };
};

// Community events
export const getCommunityEvents = async (communityId: string): Promise<CommunityEvent[]> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const { data, error } = await supabase
    .from('community_events')
    .select(`
      *,
      creator:profiles(id, full_name, avatar_url)
    `)
    .eq('community_id', communityId)
    .eq('status', 'active')
    .order('event_date', { ascending: true });

  if (error) throw error;
  
  // Get attendee counts and user attendance status
  const events = (data || []).map(event => ({
    ...event,
    status: event.status as 'active' | 'cancelled' | 'completed',
    creator: Array.isArray(event.creator) && event.creator.length > 0 ? event.creator[0] : undefined
  }));
  if (events.length === 0) return events;

  const eventIds = events.map(e => e.id);
  
  const { data: attendeeCounts } = await supabase
    .from('community_event_attendees')
    .select('event_id, status')
    .in('event_id', eventIds);

  const { data: userAttendance } = userId ? await supabase
    .from('community_event_attendees')
    .select('event_id, status')
    .in('event_id', eventIds)
    .eq('user_id', userId) : { data: [] };

  return events.map(event => ({
    ...event,
    attendee_count: attendeeCounts?.filter(a => a.event_id === event.id && a.status === 'attending').length || 0,
    user_attendance_status: userAttendance?.find(a => a.event_id === event.id)?.status
  }));
};

export const createCommunityEvent = async (event: {
  community_id: string;
  title: string;
  description?: string;
  event_date: string;
  end_date?: string;
  location?: string;
  is_virtual?: boolean;
  max_attendees?: number;
  registration_required?: boolean;
  registration_url?: string;
  image_url?: string;
}): Promise<CommunityEvent> => {
  const { data, error } = await supabase
    .from('community_events')
    .insert({
      ...event,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select(`
      *,
      creator:profiles(id, full_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return {
    ...data,
    status: data.status as 'active' | 'cancelled' | 'completed',
    creator: Array.isArray(data.creator) && data.creator.length > 0 ? data.creator[0] : undefined
  };
};

export const updateEventAttendance = async (eventId: string, status: 'attending' | 'maybe' | 'not_attending'): Promise<void> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const { error } = await supabase
    .from('community_event_attendees')
    .upsert({
      event_id: eventId,
      user_id: userId,
      status
    });

  if (error) throw error;
};