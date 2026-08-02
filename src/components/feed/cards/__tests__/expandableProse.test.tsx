/**
 * jsdom has NO layout: scrollHeight and clientHeight are both 0, so any
 * overflow assertion here would pass against a stub and certify nothing.
 * Stub the metrics and test the ONE thing jsdom can genuinely certify: the
 * control is not a descendant of the clamped element. That containment is
 * the regression BD332 fixes. Real overflow behaviour goes to device QA.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableProse } from '../ExpandableProse';

const LONG = 'word '.repeat(400);

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true, get() { return 200; },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true, get() { return 80; },
  });
  (globalThis as any).ResizeObserver = class {
    observe() {} unobserve() {} disconnect() {}
  };
});

afterAll(() => {
  delete (HTMLElement.prototype as any).scrollHeight;
  delete (HTMLElement.prototype as any).clientHeight;
});

describe('ExpandableProse', () => {
  it('renders the control OUTSIDE the clamped element', () => {
    render(<ExpandableProse content={LONG} clampLines={4} />);
    const clamped = screen.getByTestId('expandable-prose-clamped');
    const control = screen.getByTestId('expandable-prose-control');
    expect(clamped.className).toContain('line-clamp-4');
    expect(clamped.contains(control)).toBe(false);
  });

  it('toggles to the full body and back', () => {
    render(<ExpandableProse content={LONG} />);
    const control = screen.getByTestId('expandable-prose-control');
    expect(control).toHaveTextContent('Read more');
    fireEvent.click(control);
    expect(screen.getByTestId('expandable-prose-control')).toHaveTextContent('Show less');
    expect(screen.queryByTestId('expandable-prose-clamped')).toBeNull();
  });

  it('renders nothing for empty content', () => {
    const { container } = render(<ExpandableProse content="   " />);
    expect(container).toBeEmptyDOMElement();
  });
});
