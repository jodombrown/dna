/**
 * BD467: the gap between a hub's chrome (header + tabs) and its first content
 * element is owned exclusively by DnaMobileHubShell's own `pt-5`. Before this
 * gate, six hubs independently guessed at their own top spacing and landed on
 * three different values (Feed/Connect/Convey ~12px, Convene ~20px,
 * Contribute/Collaborate ~36px) with nothing catching the drift.
 *
 * Rule: a hub's content wrapper may declare its own bottom spacing (`pb-*`,
 * clearance above the bottom nav) and horizontal spacing (`px-*`), both are
 * page-specific and fine. Top spacing (`pt-*`, or `py-*` which sets both) is
 * banned on every wrapper below DnaMobileHubShell — that edge belongs to the
 * shell alone. Only DnaMobileHubShell.tsx itself may declare it, and must.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const repoRoot = process.cwd();
const read = (rel: string) => readFileSync(resolve(repoRoot, rel), 'utf8');

const DECLARED_HUB_WRAPPERS = [
  'src/components/convene/ConveneShell.tsx',
  'src/pages/dna/convene/ConveneDiscovery.tsx',
  'src/components/contribute/ContributeShell.tsx',
  'src/components/collaborate/SpacesShell.tsx',
  'src/pages/dna/Feed.tsx',
  'src/pages/dna/connect/Connect.tsx',
  'src/pages/dna/convey/ConveyStoryHub.tsx',
];

const BANNED_TOP_SPACING = /\bp[ty]-(?!bottom-nav)[\w[\]./]+/;

describe('BD467: content-gap ownership', () => {
  it('DnaMobileHubShell declares the single canonical top gap', () => {
    const body = read('src/components/mobile/DnaMobileHubShell.tsx');
    expect(body).toMatch(/\bpt-5\b/);
  });

  for (const file of DECLARED_HUB_WRAPPERS) {
    it(`${file} does not declare its own top spacing`, () => {
      const body = read(file);
      const withoutShellProps = body.replace(/<DnaMobileHubShell[\s\S]*?>/g, '<DnaMobileHubShell>');
      const match = withoutShellProps.match(BANNED_TOP_SPACING);
      expect(
        match,
        match ? `Found banned top-spacing class "${match[0]}" in ${file}. Top spacing belongs to DnaMobileHubShell alone (BD467).` : undefined,
      ).toBeNull();
    });
  }
});
