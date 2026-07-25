/**
 * THE RULE (BD228): the format enum never reaches a member raw. 'in_person'
 * must read "In person", not "In_person". One formatter owns the mapping so
 * no surface can hand-roll a label that drifts from the others.
 */
import { describe, it, expect } from 'vitest';
import { formatEventFormat } from '@/lib/events/eventFormat';

describe('formatEventFormat', () => {
  it('maps every enum member to its label', () => {
    expect(formatEventFormat('in_person')).toBe('In person');
    expect(formatEventFormat('virtual')).toBe('Virtual');
    expect(formatEventFormat('hybrid')).toBe('Hybrid');
  });

  it('never leaks the underscore that started BD228', () => {
    expect(formatEventFormat('in_person')).not.toContain('_');
  });

  it('renders nothing for absent values', () => {
    expect(formatEventFormat(null)).toBe('');
    expect(formatEventFormat(undefined)).toBe('');
    expect(formatEventFormat('')).toBe('');
  });

  it('humanises an unknown value rather than leaking a raw enum', () => {
    expect(formatEventFormat('some_future_mode')).toBe('Some future mode');
  });
});
