/**
 * DIA | Content Intelligence Service
 *
 * Analyzes content for topics, sentiment, quality signals, and mode detection.
 * Powers: Composer (mode detection, tag suggestions), Feed (content quality score)
 *
 * This extends the existing diaComposerService with deeper analysis capabilities.
 */

import type {
  ContentAnalysis,
  ContentQualitySignals,
  ContentSentiment,
  FiveCModule,
  TrustBoundary,
} from '@/types/dia';

/** Word patterns that suggest specific Five C modes */
const MODE_PATTERNS: Record<FiveCModule, RegExp[]> = {
  connect: [
    /\b(looking for|seeking|want to meet|connect with|network)\b/i,
    /\b(introduction|collaborate|mentor|advisor)\b/i,
  ],
  convene: [
    /\b(join us|save the date|event|conference|meetup|workshop|webinar)\b/i,
    /\b(rsvp|register|attend|happening on|this (monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
    /\b\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  ],
  collaborate: [
    /\b(project|task force|working group|sprint|milestone)\b/i,
    /\b(collaborate|build together|co-create|open source)\b/i,
  ],
  contribute: [
    /\b(hiring|seeking|opportunity|available for|offer|need)\b/i,
    /\b(funding|investment|grant|volunteer|donate|impact)\b/i,
  ],
  convey: [
    /\b(story|journey|lesson learned|reflection|chapter)\b/i,
    /\b(thread|series|part \d|my experience)\b/i,
  ],
};

/** Positive sentiment keywords (diaspora-aware) */
const POSITIVE_WORDS = new Set([
  'excited', 'proud', 'amazing', 'inspiring', 'grateful', 'blessed',
  'transformative', 'empowering', 'impactful', 'milestone', 'breakthrough',
  'celebrate', 'achievement', 'progress', 'opportunity', 'growth',
]);

/** Negative sentiment keywords */
const NEGATIVE_WORDS = new Set([
  'frustrated', 'disappointed', 'failed', 'struggling', 'challenge',
  'difficult', 'concern', 'issue', 'problem', 'unfortunately',
]);

/**
 * Perform full content analysis including mode detection, topics, sentiment, and quality.
 */
function analyzeContent(content: string, contentType?: string): ContentAnalysis {
  const words = content.split(/\s+/);
  const wordCount = words.length;

  return {
    content_id: '', // Set by caller
    detected_mode: detectMode(content),
    topics: extractTopics(content),
    sentiment: analyzeSentiment(content),
    quality_score: computeQualityScore(content),
    suggested_tags: extractTags(content),
    suggested_audience: suggestAudience(content, contentType),
    language: 'en', // Future: language detection
    reading_time_minutes: Math.max(1, Math.ceil(wordCount / 200)),
  };
}

/**
 * Detect which Five C mode this content best fits.
 */
function detectMode(content: string): FiveCModule | null {
  let bestMode: FiveCModule | null = null;
  let bestScore = 0;

  for (const [mode, patterns] of Object.entries(MODE_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) score += matches.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMode = mode as FiveCModule;
    }
  }

  return bestScore >= 1 ? bestMode : null;
}

/**
 * Extract topics from content using keyword frequency and patterns.
 */
function extractTopics(content: string): string[] {
  const topics: string[] = [];
  const lower = content.toLowerCase();

  // Detect common diaspora/African topics
  const topicPatterns: Record<string, RegExp> = {
    'fintech': /\b(fintech|mobile money|digital payment|mpesa)\b/i,
    'technology': /\b(tech|software|ai|artificial intelligence|blockchain)\b/i,
    'investment': /\b(invest|funding|vc|venture capital|angel)\b/i,
    'entrepreneurship': /\b(startup|founder|entrepreneur|business)\b/i,
    'education': /\b(education|university|scholarship|learning)\b/i,
    'health': /\b(health|medical|healthcare|wellness)\b/i,
    'agriculture': /\b(agriculture|farming|agritech|food security)\b/i,
    'energy': /\b(energy|solar|renewable|power)\b/i,
    'diaspora': /\b(diaspora|remittance|homeland|heritage)\b/i,
    'culture': /\b(culture|art|music|film|creative)\b/i,
  };

  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(lower)) {
      topics.push(topic);
    }
  }

  return topics.slice(0, 5);
}

/**
 * Analyze content sentiment. Diaspora-aware: "inspiring" is a distinct positive category.
 */
function analyzeSentiment(content: string): ContentSentiment {
  const words = content.toLowerCase().split(/\s+/);
  let positive = 0;
  let negative = 0;

  for (const word of words) {
    const cleaned = word.replace(/[^a-z]/g, '');
    if (POSITIVE_WORDS.has(cleaned)) positive++;
    if (NEGATIVE_WORDS.has(cleaned)) negative++;
  }

  if (positive > 0 && negative > 0) return 'mixed';
  if (positive > 2) return 'inspiring';
  if (positive > 0) return 'positive';
  if (negative > 0) return 'negative';
  return 'neutral';
}

/**
 * Compute a quality score (0-100) based on content signals.
 */
function computeQualityScore(content: string): number {
  const signals = getQualitySignals(content);

  return Math.round(
    signals.length_score * 0.25 +
    signals.formatting_score * 0.20 +
    signals.media_richness * 0.15 +
    signals.engagement_prediction * 0.20 +
    signals.originality_score * 0.20,
  );
}

/**
 * Get detailed quality signals for content.
 */
function getQualitySignals(content: string): ContentQualitySignals {
  const wordCount = content.split(/\s+/).length;
  const hasFormatting = /(\*\*|__|\[.*\]\(.*\)|#{1,3}\s|>\s|-\s)/.test(content);
  const hasLinks = /https?:\/\/\S+/.test(content);
  const hasMentions = /@\w+/.test(content);
  const hasHashtags = /#\w+/.test(content);
  const paragraphs = content.split(/\n\n+/).length;

  return {
    length_score: Math.min(100, Math.max(10, wordCount * 0.5)),
    formatting_score: (hasFormatting ? 40 : 0) + (paragraphs > 1 ? 30 : 0) + (hasMentions ? 15 : 0) + (hasHashtags ? 15 : 0),
    media_richness: hasLinks ? 50 : 0, // Increased when media attachments detected externally
    engagement_prediction: Math.min(100, wordCount * 0.3 + (hasMentions ? 20 : 0) + (hasHashtags ? 15 : 0)),
    originality_score: 50, // Baseline — would need ML for true originality
  };
}

/**
 * Extract suggested hashtags from content.
 */
function extractTags(content: string): string[] {
  const tags: string[] = [];

  // Extract existing hashtags
  const hashtagMatches = content.match(/#(\w{2,30})/g);
  if (hashtagMatches) {
    tags.push(...hashtagMatches.map(h => h.slice(1).toLowerCase()));
  }

  // Suggest tags based on detected topics
  const topics = extractTopics(content);
  for (const topic of topics) {
    if (!tags.includes(topic)) {
      tags.push(topic);
    }
  }

  return [...new Set(tags)].slice(0, 8);
}

/**
 * Suggest audience visibility based on content type.
 */
function suggestAudience(content: string, contentType?: string): TrustBoundary {
  if (contentType === 'story') return 'public';
  if (contentType === 'event') return 'public';
  if (contentType === 'opportunity') return 'public';

  const wordCount = content.split(/\s+/).length;
  if (wordCount > 200) return 'public'; // Long-form content is likely meant to be shared
  return 'network';
}

export const contentIntelligenceService = {
  analyzeContent,
  detectMode,
  extractTopics,
  analyzeSentiment,
  computeQualityScore,
  getQualitySignals,
  extractTags,
};
