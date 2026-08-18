# Admin controls for waitlist entries: archive, delete, reset

Right now a waitlist entry can only be reviewed, approved, rejected, or sent an access email. Nothing can be cleared off the list. This adds the missing lifecycle actions to Admin > Waitlist.

## What you get

Per entry, in a single "More" menu next to Review:

- **Archive** - hides the entry from the default view without losing it. Stamps who archived it and when. An archived entry cannot be sent an access email (already true today).
- **Unarchive** - puts it back in the active list.
- **Reset to pending** - for an entry rejected or approved by mistake. Clears the decision, does not send anything.
- **Copy email** - one click, for when you want to write to someone directly.
- **Delete permanently** - destructive, last in the menu, separated. Opens a confirm dialog that names the person and their email and requires you to type DELETE. Deleting a waitlist row does not delete an account that already signed in, and the dialog says so.

Bulk, on the selection bar that already exists: **Archive selected** and **Delete selected** alongside Approve and Reject. Bulk delete uses the same typed-confirm dialog and shows the count.

## What changes in the view

- The status filter gains **Archived**. Archived entries are hidden from every other filter view, so the working list stays clean.
- An **Archived** badge on any archived row, with when it was archived.
- The four stat cards stay counting active entries only, and a fifth reads Archived.
- CSV export follows what is on screen and gains an Archived column.

## Safeguards

- Approve, reject, archive, unarchive, reset and delete each write an entry to the admin activity log, same as approve and reject do today, so every removal is traceable after the row is gone.
- Delete is the only irreversible action and the only one behind a typed confirmation.
- Nothing in this change sends email. Access email stays the separate action it is now.

## Technical notes

- One file: `src/pages/admin/WaitlistManagement.tsx`. Actions move into a `DropdownMenu`; the confirm uses `AlertDialog`.
- No migration needed. Verified against the live catalog: `beta_waitlist` already carries `archived_at` and `archived_by`, and the admin DELETE and UPDATE policies (`has_role(auth.uid(), 'admin')`) plus table privileges for `authenticated` are already in place, so delete and archive work from the client as an admin.
- Archive is an update setting `archived_at = now()` and `archived_by = auth user id`; unarchive nulls both. Reset sets `status = 'pending'`.
- Bulk operations run as one `.in('id', ids)` statement rather than a fan-out of per-row calls, so a partial failure surfaces as a failure instead of a silent half-apply.
- After every mutation the list is refetched and the result read back before the success toast claims anything.
