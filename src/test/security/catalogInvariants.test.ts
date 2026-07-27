/**
 * Live catalog invariants (BD268). Calls public.check_security_invariants(),
 * which is the single definition of these rules — the weekly drift read
 * (BD264) calls the same function. Do not reimplement the queries here;
 * two definitions of one rule is BD242's producer/consumer problem by hand.
 *
 * FAIL-CLOSED (BD238): a missing credential is a hard failure, never a skip.
 * The key is read from process.env and is deliberately NOT VITE_-prefixed,
 * so it can never be inlined into a client bundle.
 */
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe('security · catalog invariants preflight', () => {
  it('has live credentials — fail-closed, never skipped', () => {
    const missing = [
      !url && 'VITE_SUPABASE_URL',
      !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean);
    if (missing.length > 0) {
      throw new Error(
        `Catalog invariants cannot certify anything: missing ${missing.join(', ')}. ` +
          'Hard failure by design (BD238). Do not reintroduce describe.skip.',
      );
    }
    expect(missing).toHaveLength(0);
  });
});

describe('security · catalog invariants are all GREEN', () => {
  it('runs every invariant and none is RED', async () => {
    const supabase = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc('check_security_invariants');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);

    // Under-firing is not the safe direction for a gate. If the function is
    // replaced by one that returns fewer invariants, that must fail loudly
    // rather than pass on a shorter list.
    expect(data).toHaveLength(8);

    const red = (data as Array<{ invariant: string; status: string; violations: number; detail: string; scope: string }>)
      .filter((r) => r.status !== 'GREEN');
    expect(JSON.stringify(red, null, 2)).toBe('[]');
  });
});
