import { useCallback, useEffect } from 'react';
import { logInteraction, type EntityType, type ContextC } from '@/services/interactionLogger';
import { useLocation } from 'react-router-dom';

/**
 * M4: Hook for logging interactions
 * Automatically determines context from route
 */
export function useInteractionLogger() {
  const location = useLocation();

  const getContextFromRoute = useCallback((): ContextC | undefined => {
    const path = location.pathname;
    
    if (path.includes('/connect')) return 'Connect';
    if (path.includes('/convene')) return 'Convene';
    if (path.includes('/collaborate')) return 'Collaborate';
    if (path.includes('/contribute')) return 'Contribute';
    if (path.includes('/convey')) return 'Convey';
    if (path.includes('/messages')) return 'Messages';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/discover')) return 'Discover';
    if (path.includes('/feed') || path.includes('/dna')) return 'Home';
    
    return undefined;
  }, [location.pathname]);

  const log = {
    view: useCallback((entityType: EntityType, entityId: string) =>
      logInteraction.view(entityType, entityId, getContextFromRoute()), [getContextFromRoute]),

    click: useCallback((entityType: EntityType, entityId: string) =>
      logInteraction.click(entityType, entityId, getContextFromRoute()), [getContextFromRoute]),

    cta: useCallback((entityType: EntityType, entityId: string) =>
      logInteraction.cta(entityType, entityId, getContextFromRoute()), [getContextFromRoute]),

    join: useCallback((entityType: EntityType, entityId: string) =>
      logInteraction.join(entityType, entityId, getContextFromRoute()), [getContextFromRoute]),

    rsvp: useCallback((entityType: EntityType, entityId: string) =>
      logInteraction.rsvp(entityType, entityId, getContextFromRoute()), [getContextFromRoute]),

    like: useCallback((entityType: EntityType, entityId: string) =>
      logInteraction.like(entityType, entityId, getContextFromRoute()), [getContextFromRoute]),

    comment: useCallback((entityType: EntityType, entityId: string) =>
      logInteraction.comment(entityType, entityId, getContextFromRoute()), [getContextFromRoute]),

    share: useCallback((entityType: EntityType, entityId: string) =>
      logInteraction.share(entityType, entityId, getContextFromRoute()), [getContextFromRoute]),
  };

  return { log, context: getContextFromRoute() };
}

/**
 * Hook for logging entity views on mount
 */
export function useLogEntityView(
  entityType: EntityType,
  entityId: string | undefined,
  enabled: boolean = true
) {
  const { log } = useInteractionLogger();

  useEffect(() => {
    if (enabled && entityId) {
      log.view(entityType, entityId);
    }
  }, [entityType, entityId, enabled, log]);
}
