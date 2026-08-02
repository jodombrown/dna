/**
 * LensBar primitive — first test for the shell primitive (BD340).
 *
 * jsdom has no layout engine, so this asserts structure only: which tab is
 * selected, and which colour class the active icon carries. No width, overflow,
 * or position assertions — those cannot be meaningful without layout.
 *
 * The C-vs-neutral split (BD337) is the load-bearing behaviour here: a surface
 * that IS a C colours its active lens through the c5 key; a surface that is not
 * (Feed) passes no `c` and the active lens resolves to --foreground.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { Newspaper, Compass, Bookmark } from 'lucide-react';

import { LensBar, type Lens } from '@/components/shell/LensBar';

const LENSES: Lens[] = [
  { id: 'one', label: 'One', icon: Newspaper, description: 'First lens' },
  { id: 'two', label: 'Two', icon: Compass, description: 'Second lens' },
  { id: 'three', label: 'Three', icon: Bookmark, description: 'Third lens' },
];

/** Surfaces the live location so a test can assert the URL was not rewritten. */
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

const renderBar = (props: Partial<React.ComponentProps<typeof LensBar>>, entry = '/x') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <LensBar lenses={LENSES} ariaLabel="Test lenses" {...props} />
      <LocationProbe />
    </MemoryRouter>,
  );

/** Class attribute of the svg inside the currently selected tab. */
const activeIconClass = (): string => {
  const selected = screen.getByRole('tab', { selected: true });
  return selected.querySelector('svg')?.getAttribute('class') ?? '';
};

describe('LensBar', () => {
  it('neutral path: with no c the active icon is --foreground, not a palette C', () => {
    renderBar({});
    const cls = activeIconClass();
    expect(cls).toContain('text-foreground');
    expect(cls).not.toMatch(/text-c5-/);
  });

  it('C path: with c="convene" the active icon carries text-c5-convene', () => {
    renderBar({ c: 'convene' });
    expect(activeIconClass()).toContain('text-c5-convene');
  });

  it('route-driven: ?lens=<second id> selects the second lens, not the first', () => {
    renderBar({}, '/x?lens=two');
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('fallback: an unrecognised ?lens= selects the first lens and does not rewrite the URL', () => {
    renderBar({}, '/x?lens=nonsense');
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('location')).toHaveTextContent('/x?lens=nonsense');
  });
});
