/**
 * DNA | Sprint 11 - DIA Feed Cadence Engine
 *
 * Controls the frequency and placement of DIA insight cards
 * within the feed. Adapts based on user engagement patterns.
 *
 * Rules:
 * - Max 1 DIA card per 5 non-DIA items
 * - Min 4 non-DIA items between DIA cards
 * - New user boost (sessions 1-3): 1 per 3 items
 * - Engagement-adaptive: >50% DIA engagement -> 1 per 4; <10% -> 1 per 8
 * - Dismissed card types suppressed for 7 days
 */

import type { FeedItem, FeedContentType, DIAInsightFeedContent, DIAFeedInsightType } from '@/types/feedTypes';

// ============================================================
// TYPES
// ============================================================

export interface DIAEngagementStats {
  totalDIAImpressions: number;
  totalDIAEngagements: number;
  sessionCount: number;
  dismissedTypes: DIADismissRecord[];
}

interface DIADismissRecord {
  insightType: string;
  dismissedAt: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_INTERVAL = 5;
const MIN_NON_DIA_BETWEEN = 4;
const NEW_USER_INTERVAL = 3;
const NEW_USER_SESSION_THRESHOLD = 3;
const HIGH_ENGAGEMENT_INTERVAL = 4;
const HIGH_ENGAGEMENT_THRESHOLD = 0.5;
const LOW_ENGAGEMENT_INTERVAL = 8;
const LOW_ENGAGEMENT_THRESHOLD = 0.1;
const DISMISS_SUPPRESSION_DAYS = 7;

// ============================================================
// LOCAL STORAGE KEYS
// ============================================================

const DISMISS_STORAGE_KEY = 'dna_dia_dismissed_types';
const SESSION_COUNT_KEY = 'dna_session_count';

// ============================================================
// MAIN FUNCTION
// ============================================================

export function shouldInsertDIACard(
  feedItems: FeedItem[],
  position: number,
  userEngagement: DIAEngagementStats
): boolean {
  // Count non-DIA items since last DIA card
  let nonDIASinceLastDIA = 0;
  for (let i = position - 1; i >= 0; i--) {
    if (feedItems[i].type === 'dia_insight') break;
    nonDIASinceLastDIA++;
  }

  const interval = getAdaptiveInterval(userEngagement);

  // Must have at least MIN_NON_DIA_BETWEEN non-DIA items since last DIA
  if (nonDIASinceLastDIA < MIN_NON_DIA_BETWEEN) return false;

  // Check interval threshold
  return nonDIASinceLastDIA >= interval;
}

// ============================================================
// ADAPTIVE INTERVAL
// ============================================================

function getAdaptiveInterval(stats: DIAEngagementStats): number {
  // New user boost
  if (stats.sessionCount <= NEW_USER_SESSION_THRESHOLD) {
    return NEW_USER_INTERVAL;
  }

  // Engagement-adaptive
  if (stats.totalDIAImpressions > 0) {
    const engagementRate = stats.totalDIAEngagements / stats.totalDIAImpressions;

    if (engagementRate > HIGH_ENGAGEMENT_THRESHOLD) {
      return HIGH_ENGAGEMENT_INTERVAL;
    }
    if (engagementRate < LOW_ENGAGEMENT_THRESHOLD) {
      return LOW_ENGAGEMENT_INTERVAL;
    }
  }

  return DEFAULT_INTERVAL;
}

// ============================================================
// DISMISS MANAGEMENT
// ============================================================

export function isDIATypeSuppressed(insightType: string): boolean {
  const dismissed = getDismissedTypes();
  const now = Date.now();
  const suppressionMs = DISMISS_SUPPRESSION_DAYS * 24 * 60 * 60 * 1000;

  return dismissed.some(
    (record) =>
      record.insightType === insightType &&
      now - record.dismissedAt < suppressionMs
  );
}

export function dismissDIAType(insightType: string): void {
  const dismissed = getDismissedTypes();
  const now = Date.now();
  const suppressionMs = DISMISS_SUPPRESSION_DAYS * 24 * 60 * 60 * 1000;

  // Remove expired entries and add new one
  const updated = dismissed.filter(
    (record) => now - record.dismissedAt < suppressionMs
  );
  updated.push({ insightType, dismissedAt: now });

  try {
    localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silent fail if localStorage is unavailable
  }
}

function getDismissedTypes(): DIADismissRecord[] {
  try {
    const stored = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as DIADismissRecord[];
  } catch {
    return [];
  }
}

// ============================================================
// SESSION TRACKING
// ============================================================

export function getSessionCount(): number {
  try {
    const stored = localStorage.getItem(SESSION_COUNT_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementSessionCount(): void {
  try {
    const current = getSessionCount();
    localStorage.setItem(SESSION_COUNT_KEY, String(current + 1));
  } catch {
    // Silent fail
  }
}

// ============================================================
// DIA CARD FILTERING
// ============================================================

export function filterSuppressedDIACards(
  diaItems: FeedItem[]
): FeedItem[] {
  return diaItems.filter((item) => {
    if (item.type !== 'dia_insight') return true;
    const content = item.content as DIAInsightFeedContent;
    return !isDIATypeSuppressed(content.insightType);
  });
}

// ============================================================
// INTERLEAVE DIA CARDS INTO FEED
// ============================================================

export function interleaveDIACards(
  feedItems: FeedItem[],
  diaCards: FeedItem[],
  engagementStats: DIAEngagementStats
): FeedItem[] {
  if (diaCards.length === 0) return feedItems;

  const filteredDIA = filterSuppressedDIACards(diaCards);
  if (filteredDIA.length === 0) return feedItems;

  const result: FeedItem[] = [];
  let diaIndex = 0;
  let nonDIACount = 0;
  const interval = getAdaptiveInterval(engagementStats);

  for (const item of feedItems) {
    if (item.type === 'dia_insight') continue; // Skip existing DIA cards

    result.push(item);
    nonDIACount++;

    // Insert DIA card if interval met
    if (nonDIACount >= interval && diaIndex < filteredDIA.length) {
      result.push(filteredDIA[diaIndex]);
      diaIndex++;
      nonDIACount = 0;
    }
  }

  return result;
}
