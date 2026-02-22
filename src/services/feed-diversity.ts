/**
 * DNA | Sprint 11 - Content Diversity Engine
 *
 * Enforces diversity rules on scored feed items to ensure
 * a balanced, engaging feed across all Five C's.
 *
 * Rules:
 * - Max 3 consecutive items of same content_type
 * - At least 1 item from each C in every 20-item window
 * - DIA cards never back-to-back (min 4 non-DIA between)
 * - Event cards boost when event < 48 hours away
 * - No more than 60% from any single region
 */

import type { FeedItem, FeedContentType, EventFeedContent, SpaceFeedContent } from '@/types/feedTypes';
import type { CModule } from '@/types/composer';

// ============================================================
// DIVERSITY RULES
// ============================================================

const MAX_CONSECUTIVE_SAME_TYPE = 3;
const MIN_NON_DIA_BETWEEN_DIA = 4;
const MAX_REGION_PROPORTION = 0.6;
const C_MODULE_WINDOW_SIZE = 20;

// ============================================================
// MAIN FUNCTION
// ============================================================

export function applyDiversityRules(scoredItems: FeedItem[]): FeedItem[] {
  if (scoredItems.length === 0) return [];

  // Work with a mutable copy
  let items = [...scoredItems];

  // Step 1: Filter past events
  items = filterPastEvents(items);

  // Step 2: Boost imminent events
  items = boostImminentEvents(items);

  // Step 3: Enforce consecutive type limit
  items = enforceConsecutiveTypeLimit(items);

  // Step 4: Enforce DIA spacing
  items = enforceDIASpacing(items);

  // Step 5: Ensure C-module representation in windows
  items = ensureCModuleCoverage(items);

  // Step 6: Enforce regional diversity
  items = enforceRegionalDiversity(items);

  return items;
}

// ============================================================
// FILTER PAST EVENTS
// ============================================================

function filterPastEvents(items: FeedItem[]): FeedItem[] {
  const now = Date.now();
  return items.filter((item) => {
    if (item.type !== 'event') return true;
    const eventContent = item.content as EventFeedContent;
    const endTime = new Date(eventContent.endDateTime).getTime();
    return endTime > now;
  });
}

// ============================================================
// BOOST IMMINENT EVENTS
// ============================================================

function boostImminentEvents(items: FeedItem[]): FeedItem[] {
  const now = Date.now();
  return items.map((item) => {
    if (item.type !== 'event') return item;
    const eventContent = item.content as EventFeedContent;
    const startTime = new Date(eventContent.startDateTime).getTime();
    const hoursUntil = (startTime - now) / (1000 * 60 * 60);

    if (hoursUntil > 0 && hoursUntil <= 48) {
      return { ...item, relevanceScore: item.relevanceScore * 1.5 };
    }
    return item;
  });
}

// ============================================================
// ENFORCE MAX CONSECUTIVE SAME TYPE
// ============================================================

function enforceConsecutiveTypeLimit(items: FeedItem[]): FeedItem[] {
  const result: FeedItem[] = [];
  const deferred: FeedItem[] = [];

  for (const item of items) {
    const recentTypes = result.slice(-MAX_CONSECUTIVE_SAME_TYPE).map((i) => i.type);
    const allSameType =
      recentTypes.length === MAX_CONSECUTIVE_SAME_TYPE &&
      recentTypes.every((t) => t === item.type);

    if (allSameType) {
      deferred.push(item);
    } else {
      result.push(item);

      // Try to insert deferred items that are now valid
      let inserted = true;
      while (inserted && deferred.length > 0) {
        inserted = false;
        for (let i = 0; i < deferred.length; i++) {
          const deferredTypes = result.slice(-MAX_CONSECUTIVE_SAME_TYPE).map((r) => r.type);
          const wouldViolate =
            deferredTypes.length === MAX_CONSECUTIVE_SAME_TYPE &&
            deferredTypes.every((t) => t === deferred[i].type);

          if (!wouldViolate) {
            result.push(deferred.splice(i, 1)[0]);
            inserted = true;
            break;
          }
        }
      }
    }
  }

  // Append any remaining deferred items
  result.push(...deferred);
  return result;
}

// ============================================================
// ENFORCE DIA SPACING
// ============================================================

function enforceDIASpacing(items: FeedItem[]): FeedItem[] {
  const result: FeedItem[] = [];
  const diaCards: FeedItem[] = [];
  const nonDiaCards: FeedItem[] = [];

  // Separate DIA and non-DIA items
  for (const item of items) {
    if (item.type === 'dia_insight') {
      diaCards.push(item);
    } else {
      nonDiaCards.push(item);
    }
  }

  // Interleave DIA cards with proper spacing
  let diaIndex = 0;
  let nonDiaSinceLastDia = 0;

  for (const item of nonDiaCards) {
    result.push(item);
    nonDiaSinceLastDia++;

    // Insert DIA card if spacing is met
    if (
      nonDiaSinceLastDia >= MIN_NON_DIA_BETWEEN_DIA + 1 &&
      diaIndex < diaCards.length
    ) {
      result.push(diaCards[diaIndex]);
      diaIndex++;
      nonDiaSinceLastDia = 0;
    }
  }

  // Append remaining DIA cards at the end
  while (diaIndex < diaCards.length) {
    result.push(diaCards[diaIndex]);
    diaIndex++;
  }

  return result;
}

// ============================================================
// ENSURE C-MODULE COVERAGE
// ============================================================

function ensureCModuleCoverage(items: FeedItem[]): FeedItem[] {
  if (items.length < C_MODULE_WINDOW_SIZE) return items;

  const result = [...items];
  const allCModules: CModule[] = ['CONNECT', 'CONVENE', 'COLLABORATE', 'CONTRIBUTE', 'CONVEY'] as CModule[];

  // Check each window of 20 items
  for (let windowStart = 0; windowStart + C_MODULE_WINDOW_SIZE <= result.length; windowStart += C_MODULE_WINDOW_SIZE) {
    const window = result.slice(windowStart, windowStart + C_MODULE_WINDOW_SIZE);
    const presentCs = new Set(window.map((item) => item.primaryC));
    const missingCs = allCModules.filter((c) => !presentCs.has(c));

    // For each missing C, try to swap in an item from later in the feed
    for (const missingC of missingCs) {
      const swapCandidate = result.findIndex(
        (item, idx) => idx >= windowStart + C_MODULE_WINDOW_SIZE && item.primaryC === missingC
      );

      if (swapCandidate !== -1) {
        // Find the lowest-scored item in the window to swap out
        let lowestIdx = windowStart;
        let lowestScore = result[windowStart].relevanceScore;
        for (let i = windowStart + 1; i < windowStart + C_MODULE_WINDOW_SIZE; i++) {
          if (result[i].relevanceScore < lowestScore && result[i].type !== 'dia_insight') {
            lowestScore = result[i].relevanceScore;
            lowestIdx = i;
          }
        }

        // Swap
        const temp = result[lowestIdx];
        result[lowestIdx] = result[swapCandidate];
        result[swapCandidate] = temp;
      }
    }
  }

  return result;
}

// ============================================================
// ENFORCE REGIONAL DIVERSITY
// ============================================================

function enforceRegionalDiversity(items: FeedItem[]): FeedItem[] {
  if (items.length < 5) return items;

  const regionCounts = new Map<string, number>();
  for (const item of items) {
    const region = getItemRegion(item);
    if (region) {
      regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
    }
  }

  // Check if any region exceeds 60%
  const threshold = Math.ceil(items.length * MAX_REGION_PROPORTION);
  const overRepresented = new Set<string>();
  for (const [region, count] of regionCounts) {
    if (count > threshold) {
      overRepresented.add(region);
    }
  }

  if (overRepresented.size === 0) return items;

  // Demote excess items from over-represented regions
  const result: FeedItem[] = [];
  const demoted: FeedItem[] = [];
  const currentCounts = new Map<string, number>();

  for (const item of items) {
    const region = getItemRegion(item);
    if (region && overRepresented.has(region)) {
      const currentCount = currentCounts.get(region) || 0;
      if (currentCount >= threshold) {
        demoted.push(item);
        continue;
      }
      currentCounts.set(region, currentCount + 1);
    }
    result.push(item);
  }

  // Interleave demoted items
  for (const item of demoted) {
    result.push(item);
  }

  return result;
}

function getItemRegion(item: FeedItem): string | null {
  if (item.type === 'event') {
    const content = item.content as EventFeedContent;
    return content.regionalHub;
  }
  if (item.type === 'space') {
    const content = item.content as SpaceFeedContent;
    return content.regionalFocus;
  }
  return null;
}
