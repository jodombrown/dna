/**
 * DNA Offline Queue Service
 *
 * Critical for African connectivity realities. Messages are queued when offline
 * and delivered when reconnected using exponential backoff.
 *
 * Queue flow:
 * 1. User sends message while offline
 * 2. Message queued in localStorage with 'queued' status
 * 3. UI shows optimistic "Sending..." indicator
 * 4. When online: queue processes sequentially
 * 5. Exponential backoff on failures (1s, 3s, 10s, 30s, 60s)
 * 6. Max 5 retries before marking as 'failed'
 *
 * Target: >99% message delivery when reconnected
 */

import { logger } from '@/lib/logger';
import type {
  OfflineQueueItem,
  OfflineQueueItemType,
  OfflineQueueItemStatus,
  OfflineQueueState,
} from '@/types/messagingPRD';

const LOG_TAG = 'OfflineQueueService';
const QUEUE_STORAGE_KEY = 'dna_offline_queue';
const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 3000, 10000, 30000, 60000]; // Exponential backoff

type ProcessorFn = (item: OfflineQueueItem) => Promise<void>;

export const offlineQueueService = {
  items: [] as OfflineQueueItem[],
  isProcessing: false,
  processors: new Map<OfflineQueueItemType, ProcessorFn>(),
  onStateChange: null as ((state: OfflineQueueState) => void) | null,

  /**
   * Initialize the offline queue. Load from localStorage and set up event listeners.
   * Call this once during app initialization.
   */
  init(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OfflineQueueItem[];
        this.items = parsed.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));
      }
    } catch (err) {
      logger.warn(LOG_TAG, 'Failed to load offline queue from storage', err);
      this.items = [];
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      logger.info(LOG_TAG, 'Device came online, processing queue');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      logger.info(LOG_TAG, 'Device went offline');
      this.notifyStateChange();
    });

    // Process any pending items if online
    if (navigator.onLine && this.items.length > 0) {
      this.processQueue();
    }
  },

  /**
   * Register a processor function for a specific queue item type.
   * Processors handle the actual sending/execution of queued operations.
   */
  registerProcessor(type: OfflineQueueItemType, processor: ProcessorFn): void {
    this.processors.set(type, processor);
  },

  /**
   * Add an item to the offline queue.
   * Returns the queue item for optimistic UI updates.
   */
  async enqueue(
    type: OfflineQueueItemType,
    payload: Record<string, unknown>
  ): Promise<OfflineQueueItem> {
    const queueItem: OfflineQueueItem = {
      id: crypto.randomUUID(),
      type,
      payload,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      status: 'queued',
    };

    this.items.push(queueItem);
    this.persist();
    this.notifyStateChange();

    logger.info(LOG_TAG, `Queued ${type} item`, { id: queueItem.id });

    // If online, process immediately
    if (navigator.onLine) {
      this.processQueue();
    }

    return queueItem;
  },

  /**
   * Process all pending items in the queue sequentially.
   * Uses exponential backoff for failed attempts.
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return;
    this.isProcessing = true;
    this.notifyStateChange();

    const pending = this.items.filter(
      (i) => i.status === 'queued' || i.status === 'retrying'
    );

    logger.info(LOG_TAG, `Processing ${pending.length} queued items`);

    for (const item of pending) {
      const processor = this.processors.get(item.type);
      if (!processor) {
        logger.warn(LOG_TAG, `No processor registered for type: ${item.type}`);
        item.status = 'failed';
        continue;
      }

      try {
        item.status = 'retrying';
        this.notifyStateChange();

        await processor(item);
        item.status = 'sent';
        logger.info(LOG_TAG, `Successfully processed ${item.type}`, { id: item.id });
      } catch (error) {
        item.retryCount++;
        if (item.retryCount >= item.maxRetries) {
          item.status = 'failed';
          logger.error(LOG_TAG, `Item failed after ${item.maxRetries} retries`, {
            id: item.id,
            type: item.type,
            error,
          });
        } else {
          item.status = 'retrying';
          // Wait with exponential backoff
          const delay = RETRY_DELAYS[Math.min(item.retryCount - 1, RETRY_DELAYS.length - 1)];
          logger.info(LOG_TAG, `Retrying in ${delay}ms (attempt ${item.retryCount}/${item.maxRetries})`, {
            id: item.id,
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // Clean up successfully sent items
    this.items = this.items.filter((i) => i.status !== 'sent');
    this.persist();
    this.isProcessing = false;
    this.notifyStateChange();
  },

  /**
   * Remove a specific item from the queue (e.g., user cancels).
   */
  remove(itemId: string): void {
    this.items = this.items.filter((i) => i.id !== itemId);
    this.persist();
    this.notifyStateChange();
  },

  /**
   * Retry all failed items.
   */
  retryFailed(): void {
    for (const item of this.items) {
      if (item.status === 'failed') {
        item.status = 'queued';
        item.retryCount = 0;
      }
    }
    this.persist();

    if (navigator.onLine) {
      this.processQueue();
    }
  },

  /**
   * Clear all items from the queue.
   */
  clear(): void {
    this.items = [];
    this.persist();
    this.notifyStateChange();
  },

  /**
   * Get the current queue state.
   */
  getState(): OfflineQueueState {
    return {
      items: [...this.items],
      isOnline: navigator.onLine,
      lastSyncAt: null,
      isSyncing: this.isProcessing,
    };
  },

  /**
   * Get count of pending items by type.
   */
  getPendingCount(type?: OfflineQueueItemType): number {
    const pending = this.items.filter(
      (i) => i.status === 'queued' || i.status === 'retrying'
    );
    if (type) {
      return pending.filter((i) => i.type === type).length;
    }
    return pending.length;
  },

  /**
   * Get count of failed items.
   */
  getFailedCount(): number {
    return this.items.filter((i) => i.status === 'failed').length;
  },

  /**
   * Persist queue to localStorage.
   */
  persist(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.items));
    } catch (err) {
      logger.warn(LOG_TAG, 'Failed to persist offline queue', err);
    }
  },

  /**
   * Notify listeners of state change.
   */
  notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  },

  /**
   * Set callback for state changes.
   */
  setStateChangeCallback(callback: (state: OfflineQueueState) => void): void {
    this.onStateChange = callback;
  },
};
