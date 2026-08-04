/**
 * The database refuses a scopeless stat: stat_citations.scope_geography is
 * NOT NULL. But FALLBACK_STAT_CITATIONS is passed as `placeholderData` and
 * renders on first paint, bypassing the database entirely. This gate stands
 * in for the constraint the database cannot reach: every fallback entry must
 * carry a non-empty scope_geography, so a first paint can never attribute a
 * figure to nowhere.
 */

import { describe, expect, it } from 'vitest';
import { FALLBACK_STAT_CITATIONS } from '@/hooks/useStatCitations';

describe('FALLBACK_STAT_CITATIONS scope gate', () => {
  it('keeps at least three entries so the gate cannot pass vacuously', () => {
    expect(FALLBACK_STAT_CITATIONS.length).toBeGreaterThanOrEqual(3);
  });

  it('gives every entry a non-empty scope_geography', () => {
    const offenders = FALLBACK_STAT_CITATIONS.filter(
      (c) => typeof c.scope_geography !== 'string' || c.scope_geography.trim() === '',
    ).map((c) => c.key);

    expect(offenders, `entries missing scope_geography: ${offenders.join(', ')}`).toEqual([]);
  });
});
