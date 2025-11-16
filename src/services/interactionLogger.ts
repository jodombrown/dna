import { supabase } from '@/integrations/supabase/client';

export type EntityType = 'event' | 'space' | 'need' | 'story' | 'profile' | 'project' | 'post' | 'community';
export type InteractionType = 'view' | 'click' | 'cta' | 'scroll' | 'join' | 'connect_click' | 'rsvp' | 'apply' | 'share' | 'save' | 'like' | 'comment';
export type ContextC = 'Connect' | 'Convene' | 'Collaborate' | 'Contribute' | 'Convey' | 'Messages' | 'Home' | 'Profile' | 'Discover';

export interface LogInteractionParams {
  entityType: EntityType;
  entityId: string;
  interactionType: InteractionType;
  contextC?: ContextC;
  weight?: number;
  metadata?: Record<string, any>;
}

/**
 * M4: Interaction Logger Service
 * Captures user interactions for ML personalization
 */
export class InteractionLogger {
  private static instance: InteractionLogger;
  private buffer: LogInteractionParams[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BUFFER_SIZE = 10;
  private readonly FLUSH_INTERVAL_MS = 5000;

  private constructor() {
    this.startFlushInterval();
  }

  static getInstance(): InteractionLogger {
    if (!InteractionLogger.instance) {
      InteractionLogger.instance = new InteractionLogger();
    }
    return InteractionLogger.instance;
  }

  /**
   * Log a user interaction
   */
  async log(params: LogInteractionParams): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      this.buffer.push(params);

      // Flush if buffer is full
      if (this.buffer.length >= this.BUFFER_SIZE) {
        await this.flush();
      }
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  }

  /**
   * Flush buffered interactions to database
   */
  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const interactions = this.buffer.map(interaction => ({
        user_id: user.id,
        entity_type: interaction.entityType,
        entity_id: interaction.entityId,
        interaction_type: interaction.interactionType,
        context_c: interaction.contextC,
        weight: interaction.weight || 1.0,
        metadata: interaction.metadata || {},
      }));

      await supabase.from('user_interactions').insert(interactions);
      
      this.buffer = [];
    } catch (error) {
      console.error('Failed to flush interactions:', error);
    }
  }

  /**
   * Start periodic flushing
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Stop periodic flushing
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }
}

// Singleton instance
export const interactionLogger = InteractionLogger.getInstance();

// Helper functions for common interactions
export const logInteraction = {
  view: (entityType: EntityType, entityId: string, contextC?: ContextC) =>
    interactionLogger.log({ entityType, entityId, interactionType: 'view', contextC, weight: 0.5 }),

  click: (entityType: EntityType, entityId: string, contextC?: ContextC) =>
    interactionLogger.log({ entityType, entityId, interactionType: 'click', contextC, weight: 1.0 }),

  cta: (entityType: EntityType, entityId: string, contextC?: ContextC) =>
    interactionLogger.log({ entityType, entityId, interactionType: 'cta', contextC, weight: 2.0 }),

  join: (entityType: EntityType, entityId: string, contextC?: ContextC) =>
    interactionLogger.log({ entityType, entityId, interactionType: 'join', contextC, weight: 3.0 }),

  rsvp: (entityType: EntityType, entityId: string, contextC?: ContextC) =>
    interactionLogger.log({ entityType, entityId, interactionType: 'rsvp', contextC, weight: 2.5 }),

  like: (entityType: EntityType, entityId: string, contextC?: ContextC) =>
    interactionLogger.log({ entityType, entityId, interactionType: 'like', contextC, weight: 1.5 }),

  comment: (entityType: EntityType, entityId: string, contextC?: ContextC) =>
    interactionLogger.log({ entityType, entityId, interactionType: 'comment', contextC, weight: 2.0 }),

  share: (entityType: EntityType, entityId: string, contextC?: ContextC) =>
    interactionLogger.log({ entityType, entityId, interactionType: 'share', contextC, weight: 2.5 }),
};
