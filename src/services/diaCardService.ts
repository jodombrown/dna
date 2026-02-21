/**
 * DNA | DIA Card Service
 *
 * Central service for generating DIA intelligence cards based on user context
 * and the current surface. Each module gets its own card types with contextual data.
 *
 * DIA (Diaspora Intelligence Agent) — the nervous system woven through all Five C's.
 */

import { supabase } from '@/integrations/supabase/client';
import { generateConnectCards } from '@/services/dia/connectCards';
import { generateConveneCards } from '@/services/dia/conveneCards';
import { generateCollaborateCards } from '@/services/dia/collaborateCards';
import { generateContributeCards } from '@/services/dia/contributeCards';
import { generateConveyCards } from '@/services/dia/conveyCards';
import { generateCrossCCards } from '@/services/dia/crossCCards';

// ── Types ──────────────────────────────────────────────

export type DIACardCategory = 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey' | 'cross_c';

export interface DIACard {
  id: string;
  category: DIACardCategory;
  cardType: string;
  headline: string;
  body: string;
  accentColor: string;
  icon: string;
  priority: number;
  actions: DIACardAction[];
  metadata: Record<string, unknown>;
  dismissKey: string;
  expiresAt?: string;
}

export interface DIACardAction {
  label: string;
  type: 'navigate' | 'open_composer' | 'connect' | 'rsvp' | 'dismiss' | 'custom';
  payload: Record<string, unknown>;
  isPrimary: boolean;
}

export interface DIACardRequest {
  userId: string;
  surface: DIACardSurface;
  limit: number;
  excludeDismissed: boolean;
}

export type DIACardSurface =
  | 'feed'
  | 'connect_hub'
  | 'convene_hub'
  | 'collaborate_hub'
  | 'contribute_hub'
  | 'convey_hub'
  | 'event_detail'
  | 'space_detail'
  | 'opportunity_detail'
  | 'profile';

// ── Module Accent Colors ───────────────────────────────

export const MODULE_ACCENT_COLORS: Record<DIACardCategory, string> = {
  connect: '#4A8D77',
  convene: '#C4942A',
  collaborate: '#2D5A3D',
  contribute: '#B87333',
  convey: '#2A7A8C',
  cross_c: '#C4942A',
};

// ── Dismissed Card Tracking (localStorage for alpha) ───

interface DismissedCard {
  dismissKey: string;
  dismissedAt: string;
  expiresAt: string;
}

const DISMISSED_STORAGE_KEY = 'dia_dismissed_cards';
const DISMISSAL_DURATION_DAYS = 7;

function getActiveDismissals(): DismissedCard[] {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (!raw) return [];
    const all: DismissedCard[] = JSON.parse(raw);
    const now = new Date().toISOString();
    return all.filter(d => d.expiresAt > now);
  } catch {
    return [];
  }
}

export function isDismissed(dismissKey: string): boolean {
  return getActiveDismissals().some(d => d.dismissKey === dismissKey);
}

export function dismissDIACard(dismissKey: string): void {
  const active = getActiveDismissals();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DISMISSAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const updated: DismissedCard[] = [
    ...active.filter(d => d.dismissKey !== dismissKey),
    {
      dismissKey,
      dismissedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    },
  ];

  localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(updated));
}

// ── Surface → Category Mapping ─────────────────────────

const SURFACE_CATEGORIES: Record<DIACardSurface, DIACardCategory[]> = {
  feed: ['connect', 'convene', 'collaborate', 'contribute', 'convey', 'cross_c'],
  connect_hub: ['connect'],
  convene_hub: ['convene'],
  collaborate_hub: ['collaborate'],
  contribute_hub: ['contribute'],
  convey_hub: ['convey'],
  event_detail: ['convene', 'cross_c'],
  space_detail: ['collaborate', 'cross_c'],
  opportunity_detail: ['contribute', 'cross_c'],
  profile: ['connect', 'cross_c'],
};

// ── Card Generator Registry ───────────────────────────

type CardGenerator = (userId: string) => Promise<DIACard | null>;

function getGeneratorsForCategory(category: DIACardCategory): CardGenerator[] {
  switch (category) {
    case 'connect':
      return generateConnectCards();
    case 'convene':
      return generateConveneCards();
    case 'collaborate':
      return generateCollaborateCards();
    case 'contribute':
      return generateContributeCards();
    case 'convey':
      return generateConveyCards();
    case 'cross_c':
      return generateCrossCCards();
    default:
      return [];
  }
}

// ── Main Entry Point ───────────────────────────────────

export async function getDIACards(request: DIACardRequest): Promise<DIACard[]> {
  const { userId, surface, limit, excludeDismissed } = request;

  // Determine which categories to query
  const categories = SURFACE_CATEGORIES[surface] || [];

  // Gather dismissed keys for filtering
  const dismissedKeys = excludeDismissed
    ? new Set(getActiveDismissals().map(d => d.dismissKey))
    : new Set<string>();

  // Collect all generators for relevant categories
  const generatorEntries: Array<{ generator: CardGenerator }> = [];
  for (const category of categories) {
    const generators = getGeneratorsForCategory(category);
    for (const generator of generators) {
      generatorEntries.push({ generator });
    }
  }

  // Run all generators concurrently — each returns null on failure
  const results = await Promise.allSettled(
    generatorEntries.map(({ generator }) => generator(userId))
  );

  // Filter: non-null, non-dismissed, non-expired
  const now = new Date().toISOString();
  const cards: DIACard[] = [];

  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue;
    const card = result.value;

    if (excludeDismissed && dismissedKeys.has(card.dismissKey)) continue;
    if (card.expiresAt && card.expiresAt < now) continue;

    cards.push(card);
  }

  // Sort by priority (highest first)
  cards.sort((a, b) => b.priority - a.priority);

  // Return up to limit
  return cards.slice(0, limit);
}

// ── Convenience export for feed integration ────────────

export async function getDIACardsForFeed(userId: string): Promise<DIACard[]> {
  return getDIACards({
    userId,
    surface: 'feed',
    limit: 3,
    excludeDismissed: true,
  });
}

export const diaCardService = {
  getDIACards,
  getDIACardsForFeed,
  dismissDIACard,
  isDismissed,
  getActiveDismissals,
};
