import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export type AnalyticsEventType =
  | 'view_state_change'
  | 'cross_5c_action_click'
  | 'detail_view_open'
  | 'resume_click'
  | 'whats_next_click';

interface ViewStateChangeEvent {
  from_state: string;
  to_state: string;
  route: string;
}

interface Cross5CActionEvent {
  from_pillar: 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey';
  to_pillar: 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey';
  entity_type: string;
  entity_id: string;
  action_id: string;
}

interface DetailViewOpenEvent {
  entity_type: 'event' | 'space' | 'need' | 'story' | 'profile';
  entity_id: string;
  via_pillar: string;
}

interface ResumeClickEvent {
  last_view_state: string;
  target_route: string;
  context?: Record<string, any>;
}

interface WhatsNextClickEvent {
  recommendation_id: string;
  recommendation_type: string;
  target_pillar: string;
  target_route: string;
  entity_id?: string;
}

type EventData = 
  | ViewStateChangeEvent 
  | Cross5CActionEvent 
  | DetailViewOpenEvent 
  | ResumeClickEvent 
  | WhatsNextClickEvent;

export function useAnalytics() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const trackEvent = useCallback(async (
    eventType: AnalyticsEventType,
    eventData: EventData
  ) => {
    if (!user) return;

    try {
      const sessionId = sessionStorage.getItem('dna-session-id') || crypto.randomUUID();
      sessionStorage.setItem('dna-session-id', sessionId);

      await supabase.from('dashboard_analytics').insert({
        user_id: user.id,
        user_role: profile?.user_role || null,
        event_type: eventType,
        event_data: eventData as any,
        session_id: sessionId,
        route: window.location.pathname,
      });
    } catch (error) {
      // Silent fail - don't disrupt user experience
      if (import.meta.env.DEV) {
        console.debug('[Analytics]', eventType, eventData, error);
      }
    }
  }, [user, profile]);

  const trackViewStateChange = useCallback((fromState: string, toState: string, route: string) => {
    trackEvent('view_state_change', { from_state: fromState, to_state: toState, route });
  }, [trackEvent]);

  const trackCross5CAction = useCallback((
    fromPillar: Cross5CActionEvent['from_pillar'],
    toPillar: Cross5CActionEvent['to_pillar'],
    entityType: string,
    entityId: string,
    actionId: string
  ) => {
    trackEvent('cross_5c_action_click', {
      from_pillar: fromPillar,
      to_pillar: toPillar,
      entity_type: entityType,
      entity_id: entityId,
      action_id: actionId,
    });
  }, [trackEvent]);

  const trackDetailViewOpen = useCallback((
    entityType: DetailViewOpenEvent['entity_type'],
    entityId: string,
    viaPillar: string
  ) => {
    trackEvent('detail_view_open', {
      entity_type: entityType,
      entity_id: entityId,
      via_pillar: viaPillar,
    });
  }, [trackEvent]);

  const trackResumeClick = useCallback((
    lastViewState: string,
    targetRoute: string,
    context?: Record<string, any>
  ) => {
    trackEvent('resume_click', {
      last_view_state: lastViewState,
      target_route: targetRoute,
      context,
    });
  }, [trackEvent]);

  const trackWhatsNextClick = useCallback((
    recommendationId: string,
    recommendationType: string,
    targetPillar: string,
    targetRoute: string,
    entityId?: string
  ) => {
    trackEvent('whats_next_click', {
      recommendation_id: recommendationId,
      recommendation_type: recommendationType,
      target_pillar: targetPillar,
      target_route: targetRoute,
      entity_id: entityId,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackViewStateChange,
    trackCross5CAction,
    trackDetailViewOpen,
    trackResumeClick,
    trackWhatsNextClick,
  };
}
