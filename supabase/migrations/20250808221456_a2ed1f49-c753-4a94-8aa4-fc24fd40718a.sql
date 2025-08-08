-- Create helpful indexes for fast counts
create index if not exists idx_user_contributions_user_type_created on public.user_contributions(user_id, type, created_at desc);
create index if not exists idx_memberships_user_status on public.collaboration_memberships(user_id, status);
create index if not exists idx_tasks_assignee_due_status on public.tasks(assignee_id, due_date, status);
create index if not exists idx_notifications_user_isread on public.notifications(user_id, is_read);

-- Dashboard counts RPC for the current user
create or replace function public.rpc_dashboard_counts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with me as (select (select auth.uid()) as uid),
  saved as (
    select count(*) c from public.user_contributions uc
    where uc.user_id = (select uid from me)
      and uc.type = 'opportunity_saved'
  ),
  joins as (
    select count(*) c from public.collaboration_memberships m
    where m.user_id = (select uid from me) and m.status = 'pending'
  ),
  tasks_due as (
    select count(*) c from public.tasks t
    where t.assignee_id = (select uid from me)
      and t.status in ('todo','in-progress')
      and t.due_date is not null
      and t.due_date <= current_date + interval '7 days'
  ),
  notifs as (
    select count(*) c from public.notifications n
    where n.user_id = (select uid from me) and coalesce(n.is_read,false) = false
  ),
  spaces_active as (
    select count(*) c
    from public.collaboration_memberships m
    join public.collaboration_spaces s on s.id = m.space_id
    where m.user_id = (select uid from me)
      and m.status = 'approved'
      and s.status = 'active'
  )
  select jsonb_build_object(
    'saved_opportunities', (select c from saved),
    'pending_joins', (select c from joins),
    'tasks_due_7d', (select c from tasks_due),
    'unread_notifications', (select c from notifs),
    'active_spaces', (select c from spaces_active)
  );
$$;

revoke all on function public.rpc_dashboard_counts() from public, anon;
grant execute on function public.rpc_dashboard_counts() to authenticated;