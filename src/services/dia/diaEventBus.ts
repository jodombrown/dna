/**
 * DIA | Event Bus — Sprint 4B
 *
 * Lightweight event emission system for platform events.
 * Components and mutation handlers emit events via diaEventBus.emit(),
 * which routes them through the Nudge Engine for proactive card generation.
 *
 * CRITICAL: Only call emit() from mutation handlers (after successful API calls).
 * NEVER emit from render functions, effects that fire on re-render, or during
 * component mount.
 *
 * Usage:
 *   import { diaEventBus } from '@/services/dia/diaEventBus';
 *
 *   // After a successful mutation:
 *   diaEventBus.emit({ type: 'new_connection', userId, connectedUserId });
 *
 *   // Subscribe to events (for components that react directly):
 *   const unsubscribe = diaEventBus.on('new_connection', (event) => { ... });
 *   // Later: unsubscribe();
 */

import type { DIAPlatformEvent, DIAPlatformEventType } from './diaEventTypes';
import { processEvent } from './diaNudgeEngine';
import { storeNudge } from './diaNudgeStorage';

type EventListener = (event: DIAPlatformEvent) => void;

class DIAEventBus {
  private listeners: Map<string, EventListener[]> = new Map();

  /**
   * Emit a platform event. This triggers:
   * 1. The Nudge Engine to process the event and generate nudges
   * 2. Any registered listeners for this event type
   *
   * Non-blocking — fires and forgets. Nudge failures are silently caught.
   */
  emit(event: DIAPlatformEvent): void {
    // Process through nudge engine (async, non-blocking)
    processEvent(event).then(nudges => {
      for (const nudge of nudges) {
        storeNudge(nudge);
      }
    }).catch(() => {
      // Silently fail — DIA events are non-critical
    });

    // Notify direct listeners
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        try {
          listener(event);
        } catch {
          // Silently fail — listener errors should not propagate
        }
      }
    }
  }

  /**
   * Subscribe to a specific event type.
   * Returns an unsubscribe function.
   */
  on(eventType: DIAPlatformEventType, callback: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    const callbacks = this.listeners.get(eventType)!;
    callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const current = this.listeners.get(eventType);
      if (current) {
        this.listeners.set(
          eventType,
          current.filter(cb => cb !== callback),
        );
      }
    };
  }

  /**
   * Remove all listeners (useful for testing or cleanup).
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get the count of registered listener types (for verification).
   */
  getListenerTypeCount(): number {
    return this.listeners.size;
  }
}

/** Singleton event bus instance used throughout the application */
export const diaEventBus = new DIAEventBus();
