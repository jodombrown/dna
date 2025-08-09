-- Ensure RLS and policies for notifications table
alter table if exists public.notifications enable row level security;

-- Read own notifications
drop policy if exists "read own notifications" on public.notifications;
create policy "read own notifications" on public.notifications for select using (
  user_id = (select auth.uid())
);

-- Update read flag on own notifications
drop policy if exists "update read own notifications" on public.notifications;
create policy "update read own notifications" on public.notifications for update using (
  user_id = (select auth.uid())
) with check (
  user_id = (select auth.uid())
);
