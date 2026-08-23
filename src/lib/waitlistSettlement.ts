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

/** Which half of the action a progress tick is reporting. */
export type SettlementPhase = 'status' | 'invite';

export interface SettlementProgress {
  phase: SettlementPhase;
  done: number;
  total: number;
}

/**
 * How many rows are in flight at once.
 *
 * Four, not "all of them". Each send-beta-access-granted invocation is roughly
 * seven round trips: token check, has_role RPC, waitlist select, generateLink
 * against the auth admin API, a profiles update, the Resend send, then the
 * waitlist stamp and the audit insert. Two hundred of those in parallel is
 * around fourteen hundred concurrent operations and two hundred simultaneous
 * sends at a transactional mail provider that rate limits by design.
 *
 * That is a spurious-failure generator, and it would defeat the point of this
 * module. A settlement summary is only worth reading if a name on the failure
 * list means the row actually failed, rather than meaning the batch throttled
 * itself. Two hundred rows at four concurrent is about fifty rounds and a
 * minute or two of wall clock, which is fine for an admin action.
 */
export const DEFAULT_CONCURRENCY = 4;

export interface SettlementOps {
  /** Flip one row's status. Must reject or throw when the row did not change. */
  updateStatus: (row: WaitlistRowRef) => Promise<void>;
  /**
   * Send one row's access email. Must reject or throw when the send failed.
   * Omit for actions that send nothing, such as reject.
   */
  sendInvite?: (row: WaitlistRowRef) => Promise<void>;
  /** In-flight cap for both phases. Defaults to DEFAULT_CONCURRENCY. */
  concurrency?: number;
  /**
   * Called as each row completes, so a batch that runs for a minute can say so.
   * A disabled button with no feedback reads as a hang and gets force-quit.
   */
  onProgress?: (progress: SettlementProgress) => void;
}

/**
 * Settle items in sequential batches, never more than `limit` in flight.
 *
 * Results come back positionally aligned with `items`, because the batches are
 * ordered slices and each batch's results are appended in order. Callers rely
 * on that alignment to attribute a failure to the right row.
 *
 * The progress tick lives in a finally so it fires for a rejected row too. A
 * counter that stalls on the first failure is worse than no counter.
 */
async function settleInBatches(
  items: WaitlistRowRef[],
  limit: number,
  worker: (item: WaitlistRowRef) => Promise<void>,
  onDone: (completed: number) => void,
): Promise<PromiseSettledResult<void>[]> {
  const results: PromiseSettledResult<void>[] = [];
  let completed = 0;
  const size = Math.max(1, Math.floor(limit));

  // Announce the phase before the first row finishes. Without this the label
  // holds the previous phase's "9 of 9" for as long as the first send takes,
  // which is the exact stretch the admin is staring at it.
  if (items.length > 0) onDone(0);

  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    const settled = await Promise.allSettled(
      batch.map(async item => {
        try {
          await worker(item);
        } finally {
          completed += 1;
          onDone(completed);
        }
      }),
    );
    results.push(...settled);
  }

  return results;
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
 * Both phases use Promise.allSettled, so one rejection never cancels a sibling,
 * and both run at most DEFAULT_CONCURRENCY rows at a time so a large batch does
 * not manufacture its own failures. Every row is accounted for in the result
 * whether it succeeded or not.
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

  const limit = ops.concurrency ?? DEFAULT_CONCURRENCY;
  const report = (phase: SettlementPhase, total: number) => (done: number) =>
    ops.onProgress?.({ phase, done, total });

  const statusResults = await settleInBatches(
    rows,
    limit,
    row => ops.updateStatus(row),
    report('status', rows.length),
  );
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
    // Every row still gets attempted. A rejection settles its own batch slot
    // and the rounds after it run regardless, so one bad address can never
    // strand the rows queued behind it.
    const inviteResults = await settleInBatches(
      inviteTargets.map(s => ({ id: s.id, email: s.email })),
      limit,
      row => send(row),
      report('invite', inviteTargets.length),
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

/**
 * The label for an in-flight batch, e.g. "Sending 48 of 200".
 *
 * The two phases are named separately on purpose. "Approving" and "Sending"
 * are different operations with different failure modes, and an admin watching
 * a two-minute batch should be able to tell which half is running.
 */
export function describeProgress(action: string, progress: SettlementProgress): string {
  if (progress.phase === 'invite') {
    return `Sending ${progress.done} of ${progress.total}`;
  }
  const gerund =
    action === 'approved' ? 'Approving' : action === 'rejected' ? 'Rejecting' : 'Updating';
  return `${gerund} ${progress.done} of ${progress.total}`;
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
