// src/services/hubNotifications.ts
// Service for hub notification signups

import { supabase } from '@/integrations/supabase/client';

export type HubType = 'convene' | 'collaborate' | 'contribute' | 'convey';

export interface HubNotificationPreferences {
  interests?: string[];
  role_preference?: string;
  format?: string;
  city?: string;
  topics?: string[];
  skills?: string[];
  professional_domain?: string;
  notify_by_email?: boolean;
  notify_by_dia?: boolean;
}

export interface NotificationSignup {
  hub: HubType;
  email: string;
  userId?: string;
  preferences?: HubNotificationPreferences;
}

export interface HostApplication {
  hub: HubType;
  email: string;
  userId?: string;
  name: string;
  organization?: string;
  concept: string;
  audience_size?: string;
  experience?: string;
  additional_info?: Record<string, unknown>;
}

export async function subscribeToHubNotifications(
  signup: NotificationSignup
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await (supabase as any)
      .from('hub_notification_signups')
      .upsert({
        hub: signup.hub,
        email: signup.email,
        user_id: signup.userId || null,
        preferences: signup.preferences || {},
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email,hub'
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Hub notification signup failed:', error);
    return {
      success: false,
      error: 'Failed to subscribe. Please try again.'
    };
  }
}

export async function submitHostApplication(
  application: HostApplication
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await (supabase as any)
      .from('hub_host_applications')
      .insert({
        hub: application.hub,
        email: application.email,
        user_id: application.userId || null,
        name: application.name,
        organization: application.organization || null,
        concept: application.concept,
        audience_size: application.audience_size || null,
        experience: application.experience || null,
        additional_info: application.additional_info || {},
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Host application submission failed:', error);
    return {
      success: false,
      error: 'Failed to submit application. Please try again.'
    };
  }
}

export async function checkExistingSignup(
  email: string,
  hub: HubType
): Promise<boolean> {
  try {
    const { data } = await (supabase as any)
      .from('hub_notification_signups')
      .select('id')
      .eq('email', email)
      .eq('hub', hub)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

// Hub-specific interest options
export const HUB_INTEREST_OPTIONS: Record<HubType, string[]> = {
  convene: [
    'Networking',
    'Learning',
    'Investment',
    'Culture',
    'Tech',
    'Business',
    'Arts',
    'Health'
  ],
  collaborate: [
    'Startups',
    'Community Projects',
    'Creative Work',
    'Mentorship',
    'Research',
    'Social Impact',
    'Tech Development'
  ],
  contribute: [
    'Jobs',
    'Investment',
    'Mentorship',
    'Services',
    'Resources',
    'Volunteering',
    'Funding'
  ],
  convey: [
    'Business',
    'Culture',
    'Tech',
    'Politics',
    'Lifestyle',
    'Diaspora Life',
    'Arts',
    'Health'
  ]
};

export const HUB_FORMAT_OPTIONS: Record<HubType, string[]> = {
  convene: ['Virtual', 'In-Person', 'Hybrid'],
  collaborate: ['Remote', 'In-Person', 'Hybrid'],
  contribute: ['Offering', 'Seeking', 'Both'],
  convey: ['Reading', 'Writing', 'Both']
};
