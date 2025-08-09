-- Fix the column reference to match existing table structure
-- 1) Safe RPC for ad-hoc logs (defense-in-depth)
create or replace function public.rpc_log_contribution(
  p_type text,
  p_target_id uuid,
  p_description text default null,
  p_sector text default null,
  p_region text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := (select auth.uid());
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  insert into public.user_contributions(user_id, type, target_id, description, sector, region)
  values (v_user, p_type, p_target_id, nullif(p_description, ''), nullif(p_sector, ''), nullif(p_region, ''));
end; $$;

revoke all on function public.rpc_log_contribution(text, uuid, text, text, text) from public, anon; 
grant execute on function public.rpc_log_contribution(text, uuid, text, text, text) to authenticated;

-- 2) Trigger helpers that run as table owner (no user spoofing)
create or replace function public._log_contrib_fixed(_user uuid, _type text, _target uuid, _description text, _sector text, _region text)
returns void language sql security definer set search_path = public as $$
  insert into public.user_contributions(user_id, type, target_id, description, sector, region)
  values (_user, _type, _target, nullif(_description, ''), nullif(_sector, ''), nullif(_region, ''));
$$;

-- 3) TASKS: on insert and status change to done
create or replace function public.trg_tasks_log()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    perform public._log_contrib_fixed(new.created_by, 'task', new.id, 'Created task: ' || coalesce(new.title, 'Untitled'), null, null);
  elsif TG_OP = 'UPDATE' and new.status is distinct from old.status and new.status = 'done' then
    perform public._log_contrib_fixed(coalesce(new.assignee_id, new.created_by), 'task', new.id, 'Completed task: ' || coalesce(new.title, 'Untitled'), null, null);
  end if;
  return new;
end; $$;

drop trigger if exists trg_tasks_log on public.tasks;
create trigger trg_tasks_log after insert or update on public.tasks for each row execute function public.trg_tasks_log();

-- 4) MILESTONES: on insert and when completed
create or replace function public.trg_milestones_log()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    perform public._log_contrib_fixed(new.created_by, 'milestone', new.id, 'Created milestone: ' || coalesce(new.title, 'Untitled'), null, null);
  elsif TG_OP = 'UPDATE' and new.status is distinct from old.status and new.status = 'completed' then
    perform public._log_contrib_fixed(new.created_by, 'milestone', new.id, 'Completed milestone: ' || coalesce(new.title, 'Untitled'), null, null);
  end if;
  return new;
end; $$;

drop trigger if exists trg_milestones_log on public.milestones;
create trigger trg_milestones_log after insert or update on public.milestones for each row execute function public.trg_milestones_log();

-- 5) POSTS: on insert
create or replace function public.trg_posts_log()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public._log_contrib_fixed(new.author_id, 'post', new.id, 'Created post: ' || coalesce(left(new.content, 80), 'Untitled'), null, null);
  return new;
end; $$;

drop trigger if exists trg_posts_log on public.posts;
create trigger trg_posts_log after insert on public.posts for each row execute function public.trg_posts_log();