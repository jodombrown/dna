/**
 * Waitlist bulk-approve settlement.
 *
 * Guards the failure this replaced: two Promise.all calls, the first with its
 * results never read, the second throwing on the first rejection. At 200 rows
 * that produced 200 rows reading 'approved', an unknown subset emailed, and no
 * way to tell them apart from the screen.
 *
 * The gate case is row 2 of 3 rejecting its send. Rows 1 and 3 must still be
 * attempted, and the summary must say 2 of 3.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  settleBulkAction,
  describeSettlement,
  describeProgress,
  needsInvite,
  reasonOf,
  DEFAULT_CONCURRENCY,
} from '../waitlistSettlement';

const ROWS = [
  { id: 'row-1', email: 'one@example.com' },
  { id: 'row-2', email: 'two@example.com' },
  { id: 'row-3', email: 'three@example.com' },
];

describe('settleBulkAction', () => {
  it('attempts every send even when a middle row rejects, and reports 2 of 3', async () => {
    const updateStatus = vi.fn().mockResolvedValue(undefined);
    const sendInvite = vi.fn(async (row: { id: string }) => {
      if (row.id === 'row-2') throw new Error('Resend rejected the address');
    });

    const settlement = await settleBulkAction(ROWS, { updateStatus, sendInvite });

    // Rows 1 and 3 were not cancelled by row 2's rejection.
    expect(sendInvite).toHaveBeenCalledTimes(3);
    expect(sendInvite.mock.calls.map(c => c[0].id)).toEqual(['row-1', 'row-2', 'row-3']);

    expect(settlement.statusOk).toHaveLength(3);
    expect(settlement.statusFailed).toHaveLength(0);
    expect(settlement.inviteOk.map(r => r.id)).toEqual(['row-1', 'row-3']);
    expect(settlement.inviteFailed.map(r => r.id)).toEqual(['row-2']);
    expect(settlement.inviteFailed[0].reason).toBe('Resend rejected the address');

    const summary = describeSettlement('approved', settlement);
    expect(summary.description).toContain('Approved 3.');
    expect(summary.description).toContain('Invites sent 2, failed 1.');
    expect(summary.description).toContain('two@example.com');
    expect(summary.destructive).toBe(true);
    expect(summary.title).toBe('Approved with failures');
  });

  it('reports a clean batch without a destructive toast', async () => {
    const settlement = await settleBulkAction(ROWS, {
      updateStatus: vi.fn().mockResolvedValue(undefined),
      sendInvite: vi.fn().mockResolvedValue(undefined),
    });

    const summary = describeSettlement('approved', settlement);
    expect(summary.title).toBe('Approved');
    expect(summary.description).toBe('Approved 3. Invites sent 3, failed 0.');
    expect(summary.destructive).toBe(false);
  });

  it('does not send to a row whose status flip failed', async () => {
    // The edge function answers 409 for a row that is not already approved, so
    // sending would file a database failure under "email failed".
    const updateStatus = vi.fn(async (row: { id: string }) => {
      if (row.id === 'row-1') throw new Error('permission denied');
    });
    const sendInvite = vi.fn().mockResolvedValue(undefined);

    const settlement = await settleBulkAction(ROWS, { updateStatus, sendInvite });

    expect(sendInvite.mock.calls.map(c => c[0].id)).toEqual(['row-2', 'row-3']);
    expect(settlement.statusFailed.map(r => r.id)).toEqual(['row-1']);
    expect(settlement.statusFailed[0].reason).toBe('permission denied');

    const summary = describeSettlement('approved', settlement);
    expect(summary.description).toContain('Approved 2 of 3.');
    expect(summary.description).toContain('Status update failed for one@example.com.');
    expect(summary.description).toContain('Invites sent 2, failed 0.');
    expect(summary.destructive).toBe(true);
  });

  it('runs no sends at all for an action that does not email', async () => {
    const settlement = await settleBulkAction(ROWS, {
      updateStatus: vi.fn().mockResolvedValue(undefined),
      sendInvite: undefined,
    });

    expect(settlement.inviteAttempted).toHaveLength(0);

    const summary = describeSettlement('rejected', settlement);
    expect(summary.description).toBe('Rejected 3.');
    expect(summary.description).not.toContain('Invites');
    expect(summary.destructive).toBe(false);
  });

  it('truncates a long failure list rather than printing 200 addresses', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: `row-${i}`,
      email: `user${i}@example.com`,
    }));

    const settlement = await settleBulkAction(many, {
      updateStatus: vi.fn().mockResolvedValue(undefined),
      sendInvite: vi.fn().mockRejectedValue(new Error('smtp down')),
    });

    const summary = describeSettlement('approved', settlement);
    expect(summary.description).toContain('Invites sent 0, failed 12.');
    expect(summary.description).toContain('and 4 more');
    expect(summary.description).not.toContain('user11@example.com');
  });

  it('names a cause for rejections that are not Error instances', async () => {
    const settlement = await settleBulkAction([ROWS[0]], {
      updateStatus: vi.fn().mockResolvedValue(undefined),
      // supabase-js FunctionsHttpError is a plain object shape in some paths.
      sendInvite: vi.fn().mockRejectedValue({ message: 'Entry is not approved' }),
    });

    expect(settlement.inviteFailed[0].reason).toBe('Entry is not approved');
  });
});

describe('concurrency cap', () => {
  /** A worker that records peak in-flight count and resolves on demand. */
  const trackingWorker = () => {
    let inFlight = 0;
    let peak = 0;
    const worker = async () => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      // Yield twice so every sibling in the round is admitted before any exits.
      await Promise.resolve();
      await Promise.resolve();
      inFlight -= 1;
    };
    return { worker, peak: () => peak };
  };

  it('never runs more than four sends at once, whatever the batch size', async () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({
      id: `row-${i}`,
      email: `user${i}@example.com`,
    }));
    const status = trackingWorker();
    const invite = trackingWorker();

    await settleBulkAction(rows, {
      updateStatus: status.worker,
      sendInvite: invite.worker,
    });

    // Assert the observed peak first, so a regression reports the real
    // symptom (50 in flight) rather than only the changed constant.
    expect(invite.peak()).toBeLessThanOrEqual(4);
    expect(status.peak()).toBeLessThanOrEqual(4);
    // And the cap is a cap, not a serialisation: it does use the headroom.
    expect(invite.peak()).toBe(4);
    expect(DEFAULT_CONCURRENCY).toBe(4);
  });

  it('runs the rounds after a failing round, and settles every row', async () => {
    // The old code threw on the first rejection. Batching reintroduces the
    // chance to strand rows queued behind a failure, so pin it: row 2 fails in
    // round one and rows 5 through 9 are in later rounds.
    const rows = Array.from({ length: 9 }, (_, i) => ({
      id: `row-${i}`,
      email: `user${i}@example.com`,
    }));
    const sendInvite = vi.fn(async (row: { id: string }) => {
      if (row.id === 'row-1') throw new Error('rate limited');
    });

    const settlement = await settleBulkAction(rows, {
      updateStatus: vi.fn().mockResolvedValue(undefined),
      sendInvite,
    });

    expect(sendInvite).toHaveBeenCalledTimes(9);
    expect(settlement.inviteOk).toHaveLength(8);
    expect(settlement.inviteFailed.map(r => r.id)).toEqual(['row-1']);
    // Positional alignment survives batching: the failure is attributed to the
    // row that actually failed, not to whichever slot it landed in.
    expect(settlement.rows[1].email).toBe('user1@example.com');
    expect(settlement.rows[1].inviteOk).toBe(false);
    expect(settlement.rows[8].inviteOk).toBe(true);
  });

  it('reports progress for both phases, counting failed rows too', async () => {
    const rows = Array.from({ length: 6 }, (_, i) => ({
      id: `row-${i}`,
      email: `user${i}@example.com`,
    }));
    const seen: string[] = [];

    await settleBulkAction(rows, {
      updateStatus: vi.fn().mockResolvedValue(undefined),
      sendInvite: vi.fn(async (row: { id: string }) => {
        if (row.id === 'row-0') throw new Error('nope');
      }),
      onProgress: p => seen.push(describeProgress('approved', p)),
    });

    // Both phases counted to completion. A counter that stalls on the first
    // failure is worse than no counter.
    // Each phase announces itself at 0, then counts to its own total.
    expect(seen[0]).toBe('Approving 0 of 6');
    expect(seen).toContain('Approving 6 of 6');
    expect(seen).toContain('Sending 0 of 6');
    expect(seen).toContain('Sending 6 of 6');
    expect(seen.filter(l => l.startsWith('Approving'))).toHaveLength(7);
    expect(seen.filter(l => l.startsWith('Sending'))).toHaveLength(7);
    // The label never runs backwards or repeats a phase out of order.
    expect(seen.indexOf('Sending 0 of 6')).toBeGreaterThan(seen.indexOf('Approving 6 of 6'));
  });

  it('honours an explicit concurrency and never divides by zero', async () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({ id: `row-${i}`, email: `u${i}@e.com` }));
    const tracked = trackingWorker();

    await settleBulkAction(rows, { updateStatus: tracked.worker, concurrency: 1 });
    expect(tracked.peak()).toBe(1);

    const zero = trackingWorker();
    const settlement = await settleBulkAction(rows, { updateStatus: zero.worker, concurrency: 0 });
    expect(zero.peak()).toBe(1);
    expect(settlement.statusOk).toHaveLength(5);
  });
});

describe('describeProgress', () => {
  it('names the phase that is running', () => {
    expect(describeProgress('approved', { phase: 'status', done: 48, total: 200 }))
      .toBe('Approving 48 of 200');
    expect(describeProgress('approved', { phase: 'invite', done: 48, total: 200 }))
      .toBe('Sending 48 of 200');
    expect(describeProgress('rejected', { phase: 'status', done: 1, total: 2 }))
      .toBe('Rejecting 1 of 2');
  });
});

describe('reasonOf', () => {
  it('falls back to a named cause rather than an empty string', () => {
    expect(reasonOf(new Error('boom'))).toBe('boom');
    expect(reasonOf('plain string')).toBe('plain string');
    expect(reasonOf({ message: '  spaced  ' })).toBe('spaced');
    expect(reasonOf(null)).toBe('Unknown error');
    expect(reasonOf({})).toBe('Unknown error');
  });
});

describe('needsInvite', () => {
  const base = { status: 'approved', last_invite_sent_at: null, archived_at: null };

  it('matches approved, never emailed, not archived', () => {
    expect(needsInvite(base)).toBe(true);
  });

  it('excludes rows that fall outside any leg of the invariant', () => {
    expect(needsInvite({ ...base, status: 'pending' })).toBe(false);
    expect(needsInvite({ ...base, last_invite_sent_at: '2026-08-23T00:00:00Z' })).toBe(false);
    expect(needsInvite({ ...base, archived_at: '2026-08-23T00:00:00Z' })).toBe(false);
  });
});
