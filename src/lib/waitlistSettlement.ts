/**
 * Per-row settlement for waitlist bulk actions.
 *
 * The bug this closes: handleBulkAction fired every status update through
 * Promise.all and never read a single result, then fired every invite through
 * a second Promise.all that THREW on the first rejection. At 200 rows that
 * left 200 rows reading 'approved', an unknown subset actually emailed, and
 * nothing on screen able to tell the two apart.
 *
 * The ordering is forced and must not be redesigned. send-beta-access-granted
 * returns 409 unless beta_waitlist.status is already 'approved', so the flip
 * has to land before the send. That makes a partial batch structurally
 * possible: the flip can succeed and the send fail, and the only honest
 * response is to report it per row rather than to pretend the batch is atomic.
 *
 * There is nothing to make atomic here. The recovery path is the stranded-row
 * invariant in `needsInvite` below, which is queryable at any later time.
 */

/** The minimum a row needs to be settled and named in a failure list. */
export interface WaitlistRowRef {
  id: string;
  email: string;
}

/** What actually happened to one row, both halves reported separately. */
export interface RowSettlement {
  id: string;
  email: string;
  /** The status flip landed. */
  statusOk: boolean;
  /** send-beta-access-granted confirmed a send. False when no send was due. */
  inviteOk: boolean;
  /** Why the row is not fully settled. Absent when it is. */
  reason?: string;
}

export interface BulkSettlement {
  rows: RowSettlement[];
  statusOk: RowSettlement[];
  statusFailed: RowSettlement[];
  /** Rows a send was attempted for. Empty when the action sends nothing. */
  inviteAttempted: RowSettlement[];
  inviteOk: RowSettlement[];
  inviteFailed: RowSettlement[];
}

export interface SettlementOps {
  /** Flip one row's status. Must reject or throw when the row did not change. */
  updateStatus: (row: WaitlistRowRef) => Promise<void>;
  /**
   * Send one row's access email. Must reject or throw when the send failed.
   * Omit for actions that send nothing, such as reject.
   */
  sendInvite?: (row: WaitlistRowRef) => Promise<void>;
}

/** Best effort human-readable cause from anything a rejection can carry. */
export function reasonOf(err: unknown): string {
  if (typeof err === 'string' && err.trim()) return err.trim();
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === 'object') {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  return 'Unknown error';
}

/**
 * Run a bulk action over rows and return what settled, never what was fired.
 *
 * Both phases use Promise.allSettled, so one rejection never cancels a sibling.
 * Every row is accounted for in the result whether it succeeded or not.
 *
 * A row whose status flip failed is deliberately not sent to: the edge function
 * would answer 409 for exactly that row, and a 409 in the failure list would
 * read as an email problem when it is a database problem.
 */
export async function settleBulkAction(
  rows: WaitlistRowRef[],
  ops: SettlementOps,
): Promise<BulkSettlement> {
  const settlements: RowSettlement[] = rows.map(row => ({
    id: row.id,
    email: row.email,
    statusOk: false,
    inviteOk: false,
  }));

  const statusResults = await Promise.allSettled(rows.map(row => ops.updateStatus(row)));
  statusResults.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      settlements[i].statusOk = true;
    } else {
      settlements[i].reason = reasonOf(result.reason);
    }
  });

  const inviteTargets = ops.sendInvite ? settlements.filter(s => s.statusOk) : [];

  if (ops.sendInvite) {
    const send = ops.sendInvite;
    // .map fires every send before the first await, so a rejection in the
    // middle of the batch cannot stop the rows after it from being attempted.
    const inviteResults = await Promise.allSettled(
      inviteTargets.map(s => send({ id: s.id, email: s.email })),
    );
    inviteResults.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        inviteTargets[i].inviteOk = true;
        inviteTargets[i].reason = undefined;
      } else {
        inviteTargets[i].reason = reasonOf(result.reason);
      }
    });
  }

  return {
    rows: settlements,
    statusOk: settlements.filter(s => s.statusOk),
    statusFailed: settlements.filter(s => !s.statusOk),
    inviteAttempted: inviteTargets,
    inviteOk: inviteTargets.filter(s => s.inviteOk),
    inviteFailed: inviteTargets.filter(s => !s.inviteOk),
  };
}

/** How many failing addresses a toast names before it summarises the rest. */
const MAX_LISTED_EMAILS = 8;

function listEmails(rows: RowSettlement[]): string {
  const shown = rows.slice(0, MAX_LISTED_EMAILS).map(r => r.email);
  const hidden = rows.length - shown.length;
  return hidden > 0 ? `${shown.join(', ')}, and ${hidden} more` : shown.join(', ');
}

export interface SettlementToast {
  title: string;
  description: string;
  destructive: boolean;
}

/**
 * Turn a settlement into the summary the admin reads.
 *
 * The old copy was a single "N entries approved" that was true about the flip
 * and silent about the send. This says both numbers, always, and names the
 * addresses that did not get an email. The full list of stranded rows lives
 * behind the "Needs invite" filter, so truncating the toast loses nothing.
 */
export function describeSettlement(action: string, settlement: BulkSettlement): SettlementToast {
  const verb = action === 'approved' ? 'Approved' : action === 'rejected' ? 'Rejected' : `Set to ${action}`;
  const failed = settlement.statusFailed.length > 0 || settlement.inviteFailed.length > 0;
  const parts: string[] = [];

  if (settlement.statusFailed.length === 0) {
    parts.push(`${verb} ${settlement.statusOk.length}.`);
  } else {
    parts.push(`${verb} ${settlement.statusOk.length} of ${settlement.rows.length}.`);
    parts.push(`Status update failed for ${listEmails(settlement.statusFailed)}.`);
  }

  if (settlement.inviteAttempted.length > 0) {
    parts.push(`Invites sent ${settlement.inviteOk.length}, failed ${settlement.inviteFailed.length}.`);
    if (settlement.inviteFailed.length > 0) {
      parts.push(`Not emailed: ${listEmails(settlement.inviteFailed)}.`);
      parts.push('These rows are approved and waiting under "Needs invite".');
    }
  }

  return {
    title: failed ? `${verb} with failures` : verb,
    description: parts.join(' '),
    destructive: failed,
  };
}

/** The subset of a waitlist row the stranded invariant reads. */
export interface StrandedCandidate {
  status: string;
  last_invite_sent_at: string | null;
  archived_at: string | null;
}

/**
 * The stranded-row invariant: approved, never emailed, not archived.
 *
 * This is the single definition. The filter, the count badge and the row
 * action all read it, so none of them can drift from the others. It mirrors
 * exactly, over rows already in memory:
 *
 *   .eq('status', 'approved').is('last_invite_sent_at', null).is('archived_at', null)
 */
export function needsInvite(entry: StrandedCandidate): boolean {
  return entry.status === 'approved' && !entry.last_invite_sent_at && !entry.archived_at;
}

/** The filter value for the stranded view. Not a beta_waitlist.status. */
export const NEEDS_INVITE_FILTER = 'needs-invite';
