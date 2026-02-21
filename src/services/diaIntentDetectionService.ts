/**
 * DNA Post Composer — DIA Intent Detection Service
 *
 * Sprint 3B: Detects if the user might be in the wrong composer mode
 * based on text patterns. Extends the existing diaComposerService patterns
 * with richer pattern matching and confidence scoring.
 *
 * Architecture: This is a standalone service that complements diaComposerService.
 * diaComposerService handles ambient DIA analysis (mode mismatch, tag suggestions,
 * timezone intelligence). This service focuses specifically on Sprint 3B intent
 * detection with enhanced patterns, confidence scoring, and dismissed-mode tracking.
 */

import type { ComposerMode } from '@/hooks/useUniversalComposer';

export interface IntentSuggestion {
  id: string;
  suggestedMode: ComposerMode;
  message: string;
  confidence: number;
}

export interface IntentDetectionConfig {
  analyzeAfterChars: number;
  confidenceThreshold: number;
  debounceMs: number;
  dismissedModes: Set<ComposerMode>;
}

const DEFAULT_CONFIG: IntentDetectionConfig = {
  analyzeAfterChars: 30,
  confidenceThreshold: 0.7,
  debounceMs: 500,
  dismissedModes: new Set(),
};

// ============================================================
// Detection Patterns
// ============================================================

const EVENT_PATTERNS: RegExp[] = [
  /join us (on|this|next)/i,
  /save the date/i,
  /\b(rsvp|register|attend|happening on)\b/i,
  /\b(this|next) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\b(january|february|march|april|may|june|july|august|september|october|november|december) \d{1,2}/i,
  /\b\d{1,2}(st|nd|rd|th)?\s+(of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  /\b(workshop|summit|mixer|meetup|gathering|conference|webinar)\b/i,
];

const OPPORTUNITY_PATTERNS: RegExp[] = [
  /looking for (a|an|someone)/i,
  /\b(hiring|seeking|need|wanted)\b/i,
  /i can (help|offer|provide|teach|mentor)/i,
  /\b(available for|open to)\b/i,
  /\b(freelance|contract|volunteer|intern)\b/i,
  /who (knows|can|has)/i,
  /does anyone/i,
];

const STORY_PATTERNS: RegExp[] = [
  /\b(lessons learned|my journey|looking back|reflecting on)\b/i,
  /\b(chapter|part \d|introduction)\b/i,
  /\b(when i (first|was|moved|started|left))\b/i,
  /\b(growing up in|back in (my|the|our))\b/i,
];

const SPACE_PATTERNS: RegExp[] = [
  /who wants to (work on|collaborate|build|join)/i,
  /\b(project|initiative|working group|task force)\b/i,
  /looking for (collaborators|team members|partners)/i,
  /let's (build|create|start|launch) (a|an|this)/i,
];

const INTENT_MESSAGES: Record<Exclude<ComposerMode, 'post' | 'community'>, string> = {
  event: 'This sounds like an event. Switch to Host an Event to add date, location, and registration?',
  need: 'This looks like an opportunity. Switch to Post an Opportunity for better matching?',
  story: 'This is shaping up to be a story. Switch to Tell a Story for a richer publishing experience?',
  space: 'Sounds like a project taking shape. Switch to Start a Space to build your team?',
};

// ============================================================
// Confidence Scoring
// ============================================================

interface PatternMatchResult {
  mode: ComposerMode;
  matchCount: number;
  confidence: number;
}

function countPatternMatches(text: string, patterns: RegExp[]): number {
  return patterns.filter((pattern) => pattern.test(text)).length;
}

function calculateConfidence(matchCount: number, isStoryLengthTrigger: boolean): number {
  if (isStoryLengthTrigger && matchCount >= 1) return 0.8;
  if (matchCount >= 3) return 0.9;
  if (matchCount >= 2) return 0.75;
  if (matchCount === 1) return 0.6;
  return 0;
}

// Priority order for tie-breaking: event > need > story > space
const MODE_PRIORITY: Record<string, number> = {
  event: 4,
  need: 3,
  story: 2,
  space: 1,
};

// ============================================================
// Main Detection Function
// ============================================================

/**
 * Detects if the user's text content suggests they should be in a different
 * composer mode. Returns the highest-confidence suggestion, or null if
 * no suggestion meets the threshold.
 */
export function detectIntent(
  text: string,
  currentMode: ComposerMode,
  config?: Partial<IntentDetectionConfig>
): IntentSuggestion | null {
  const mergedConfig: IntentDetectionConfig = { ...DEFAULT_CONFIG, ...config };

  if (text.length < mergedConfig.analyzeAfterChars) {
    return null;
  }

  const candidates: PatternMatchResult[] = [];

  // Check each mode (skip current mode and dismissed modes)
  if (currentMode !== 'event' && !mergedConfig.dismissedModes.has('event')) {
    const matchCount = countPatternMatches(text, EVENT_PATTERNS);
    if (matchCount > 0) {
      candidates.push({
        mode: 'event',
        matchCount,
        confidence: calculateConfidence(matchCount, false),
      });
    }
  }

  if (currentMode !== 'need' && !mergedConfig.dismissedModes.has('need')) {
    const matchCount = countPatternMatches(text, OPPORTUNITY_PATTERNS);
    if (matchCount > 0) {
      candidates.push({
        mode: 'need',
        matchCount,
        confidence: calculateConfidence(matchCount, false),
      });
    }
  }

  if (currentMode !== 'story' && !mergedConfig.dismissedModes.has('story')) {
    const matchCount = countPatternMatches(text, STORY_PATTERNS);
    const isLongContent = text.length > 1500;
    if (matchCount > 0 || isLongContent) {
      candidates.push({
        mode: 'story',
        matchCount,
        confidence: calculateConfidence(matchCount, isLongContent),
      });
    }
  }

  if (currentMode !== 'space' && !mergedConfig.dismissedModes.has('space')) {
    const matchCount = countPatternMatches(text, SPACE_PATTERNS);
    if (matchCount > 0) {
      candidates.push({
        mode: 'space',
        matchCount,
        confidence: calculateConfidence(matchCount, false),
      });
    }
  }

  // Filter by threshold
  const validCandidates = candidates.filter(
    (c) => c.confidence >= mergedConfig.confidenceThreshold
  );

  if (validCandidates.length === 0) {
    return null;
  }

  // Pick highest confidence; break ties by priority
  validCandidates.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return (MODE_PRIORITY[b.mode] ?? 0) - (MODE_PRIORITY[a.mode] ?? 0);
  });

  const best = validCandidates[0];
  const message = INTENT_MESSAGES[best.mode as Exclude<ComposerMode, 'post' | 'community'>];

  if (!message) return null;

  return {
    id: crypto.randomUUID(),
    suggestedMode: best.mode,
    message,
    confidence: best.confidence,
  };
}
