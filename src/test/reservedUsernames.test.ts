/**
 * BD344 step 1 — every routed first segment under /dna/ must be reserved.
 *
 * This gate DERIVES its expectation from the route table in src/App.tsx rather
 * than restating a list. A test that hardcoded the segments would assert that a
 * constant equals itself and would have passed every single day this defect
 * existed. Instead we read the routes off disk, extract the first path segment
 * after /dna/, and assert each one is present in USERNAME_RULES.reservedWords.
 *
 * When a new /dna/<segment> route is added without reserving the segment, this
 * test fails AND prints the missing segments, so the fix is obvious from the
 * failure message instead of costing an hour of "expected true to be false".
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { USERNAME_RULES } from '@/lib/username/validation';

const here = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(resolve(here, '../App.tsx'), 'utf8');

/**
 * Pull the first path segment after /dna/ out of every path="/dna/..." literal.
 * Discard dynamic params (segments starting with ':') and the catch-all '*',
 * since those are not literal reserved names — they are wildcards.
 */
function routedDnaFirstSegments(source: string): string[] {
  const segments = new Set<string>();
  const routeRe = /path="\/dna\/([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = routeRe.exec(source)) !== null) {
    const first = match[1].split('/')[0];
    if (!first || first.startsWith(':') || first === '*') continue;
    segments.add(first);
  }
  return [...segments];
}

describe('reserved usernames cover every routed /dna/ segment', () => {
  it('reserves every first path segment routed under /dna/', () => {
    const segments = routedDnaFirstSegments(appSource);

    // Sanity: the derivation must actually find routes. A regex that silently
    // matched nothing would make this test vacuously pass.
    expect(segments.length).toBeGreaterThan(0);

    const reserved = new Set(USERNAME_RULES.reservedWords);
    const missing = segments.filter((s) => !reserved.has(s)).sort();

    expect(
      missing,
      missing.length === 0
        ? undefined
        : `These routed /dna/ segments are not reserved in USERNAME_RULES.reservedWords: ` +
            `${missing.join(', ')}. Add them to src/lib/username/validation.ts.`,
    ).toEqual([]);
  });
});
