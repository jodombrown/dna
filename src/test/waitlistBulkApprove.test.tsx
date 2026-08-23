/**
 * Waitlist bulk approve, at the page.
 *
 * The settlement module is unit tested in src/lib/__tests__. This asserts the
 * page actually uses it, which is the half a module test cannot reach: the old
 * code's defect was not bad arithmetic, it was two Promise.all calls whose
 * results the page never looked at.
 *
 * Fixture is three pending rows where row 2's send-beta-access-granted invoke
 * rejects. Rows 1 and 3 must still be attempted, all three must still be
 * flipped, and the toast must be the destructive settlement summary rather
 * than "3 entries approved".
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

const toastMock = vi.fn();
const invokeMock = vi.fn();
const insertMock = vi.fn();

interface Row {
  id: string;
  email: string;
  full_name: string | null;
  message: string | null;
  linkedin_url: string | null;
  country: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  last_invite_sent_at: string | null;
  last_invite_sent_by: string | null;
  archived_at: string | null;
}

const makeRow = (n: number, overrides: Partial<Row> = {}): Row => ({
  id: `row-${n}`,
  email: `person${n}@example.com`,
  full_name: `Person ${n}`,
  message: null,
  linkedin_url: null,
  country: 'Ghana',
  status: 'pending',
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-01T00:00:00Z',
  last_invite_sent_at: null,
  last_invite_sent_by: null,
  archived_at: null,
  ...overrides,
});

/** Rows the mocked client serves. Mutated in place by the update chain. */
let table: Row[] = [];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (name: string) => {
      if (name === 'admin_activity_log') {
        return { insert: (payload: unknown) => { insertMock(payload); return Promise.resolve({ error: null }); } };
      }
      return {
        select: () => ({
          order: async () => ({ data: table.map(r => ({ ...r })), error: null }),
        }),
        update: (patch: Partial<Row>) => ({
          eq: (_col: string, id: string) => ({
            select: () => ({
              maybeSingle: async () => {
                const row = table.find(r => r.id === id);
                if (!row) return { data: null, error: null };
                Object.assign(row, patch);
                return { data: { id: row.id }, error: null };
              },
            }),
          }),
        }),
      };
    },
    functions: { invoke: (...args: unknown[]) => invokeMock(...args) },
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'admin-1' } }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

import WaitlistManagement from '@/pages/admin/WaitlistManagement';

/** Approve every visible row and wait for the settlement toast. */
const approveAll = async () => {
  await waitFor(() => expect(screen.getByText('person1@example.com')).toBeInTheDocument());

  const checkboxes = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxes[0]); // header select-all

  const approve = await screen.findByRole('button', { name: /^Approve$/ });
  fireEvent.click(approve);

  await waitFor(() => expect(toastMock).toHaveBeenCalled());
};

const lastToast = () => toastMock.mock.calls[toastMock.mock.calls.length - 1][0];

describe('WaitlistManagement bulk approve', () => {
  beforeEach(() => {
    toastMock.mockReset();
    invokeMock.mockReset();
    insertMock.mockReset();
    table = [makeRow(1), makeRow(2), makeRow(3)];
  });

  it('keeps sending after a rejected invite and reports 2 of 3', async () => {
    invokeMock.mockImplementation(async (_fn: string, opts: { body: { waitlistId: string } }) => {
      if (opts.body.waitlistId === 'row-2') {
        // Shape supabase-js hands back for a non-2xx edge function response.
        return { data: null, error: new Error('Could not send the access email') };
      }
      const row = table.find(r => r.id === opts.body.waitlistId);
      if (row) row.last_invite_sent_at = '2026-08-23T00:00:00Z';
      return { data: { success: true }, error: null };
    });

    render(<WaitlistManagement />);
    await approveAll();

    // Row 2 rejecting did not cancel row 3.
    const invited = invokeMock.mock.calls.map(c => (c[1] as { body: { waitlistId: string } }).body.waitlistId);
    expect(invited).toEqual(['row-1', 'row-2', 'row-3']);

    // All three flips landed. That is exactly why the summary must not claim
    // the batch failed, and must not claim it succeeded either.
    expect(table.every(r => r.status === 'approved')).toBe(true);

    const toast = lastToast();
    expect(toast.variant).toBe('destructive');
    expect(toast.title).toBe('Approved with failures');
    expect(toast.description).toContain('Approved 3.');
    expect(toast.description).toContain('Invites sent 2, failed 1.');
    expect(toast.description).toContain('person2@example.com');

    // The stranded row is recorded for the audit trail, not just the toast.
    const bulkLog = insertMock.mock.calls
      .map(c => c[0] as { action: string; details: { invites_failed?: { email: string }[] } })
      .find(entry => entry.action === 'bulk_waitlist_approved');
    expect(bulkLog?.details.invites_failed).toEqual([
      { email: 'person2@example.com', reason: 'Could not send the access email' },
    ]);
  });

  it('surfaces the stranded row under Needs invite once the batch settles', async () => {
    invokeMock.mockImplementation(async (_fn: string, opts: { body: { waitlistId: string } }) => {
      if (opts.body.waitlistId === 'row-2') return { data: null, error: new Error('smtp down') };
      const row = table.find(r => r.id === opts.body.waitlistId);
      if (row) row.last_invite_sent_at = '2026-08-23T00:00:00Z';
      return { data: { success: true }, error: null };
    });

    render(<WaitlistManagement />);
    await approveAll();

    // The counter reads 1, without a click, next to the other stat counters.
    const counter = await screen.findByLabelText(/^Needs invite: 1\./);
    expect(counter).toBeInTheDocument();

    // And the row itself is marked in the table.
    await waitFor(() => expect(screen.getAllByText('Needs invite').length).toBeGreaterThan(0));
  });

  it('shows a live count while a capped batch works through the rows', async () => {
    // Nine rows at four concurrent is three rounds, so the bar has something
    // to say for long enough to be worth saying. Each send parks until
    // released, which is what a real one-to-two minute batch looks like.
    table = Array.from({ length: 9 }, (_, i) => makeRow(i + 1));

    const releases: Array<() => void> = [];
    invokeMock.mockImplementation(
      (_fn: string, opts: { body: { waitlistId: string } }) =>
        new Promise(resolve => {
          releases.push(() => {
            const row = table.find(r => r.id === opts.body.waitlistId);
            if (row) row.last_invite_sent_at = '2026-08-23T00:00:00Z';
            resolve({ data: { success: true }, error: null });
          });
        }),
    );

    render(<WaitlistManagement />);
    await waitFor(() => expect(screen.getByText('person1@example.com')).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(await screen.findByRole('button', { name: /^Approve$/ }));

    // Status flips settle on their own, then the sends park mid-batch.
    await waitFor(() => expect(releases.length).toBeGreaterThan(0));
    expect(await screen.findByText(/^Sending \d+ of 9$/)).toBeInTheDocument();

    // Never more than the cap in flight, which is the whole point of batching.
    expect(releases.length).toBeLessThanOrEqual(4);

    // Drain every round as it opens.
    for (let guard = 0; guard < 20 && releases.length > 0; guard += 1) {
      releases.splice(0).forEach(release => release());
      await waitFor(() => expect(invokeMock.mock.calls.length).toBeGreaterThan(0));
    }

    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(invokeMock).toHaveBeenCalledTimes(9);
    expect(lastToast().description).toBe('Approved 9. Invites sent 9, failed 0.');

    // The label clears once the batch settles, rather than sticking on screen.
    await waitFor(() => expect(screen.queryByText(/^Sending /)).not.toBeInTheDocument());
  });

  it('reads zero and sends a plain toast when every invite lands', async () => {
    invokeMock.mockImplementation(async (_fn: string, opts: { body: { waitlistId: string } }) => {
      const row = table.find(r => r.id === opts.body.waitlistId);
      if (row) row.last_invite_sent_at = '2026-08-23T00:00:00Z';
      return { data: { success: true }, error: null };
    });

    render(<WaitlistManagement />);
    await approveAll();

    const toast = lastToast();
    expect(toast.variant).toBe('default');
    expect(toast.title).toBe('Approved');
    expect(toast.description).toBe('Approved 3. Invites sent 3, failed 0.');

    expect(await screen.findByLabelText(/^Needs invite: 0\./)).toBeInTheDocument();
  });
});
