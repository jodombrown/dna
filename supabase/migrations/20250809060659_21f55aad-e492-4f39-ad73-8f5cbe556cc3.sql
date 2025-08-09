-- 1) Safe RPC for ad-hoc logs (defense-in-depth)
create or replace function public.rpc_log_contribution(
  p_type text,
  p_target_id uuid,
  p_target_title text default null,
  p_metadata jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := (select auth.uid());
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  insert into public.user_contributions(id, user_id, type, target_id, target_title, metadata)
  values (gen_random_uuid(), v_user, p_type, p_target_id, nullif(p_target_title, ''), coalesce(p_metadata, '{}'::jsonb));
end; $$;
revoke all on function public.rpc_log_contribution(text, uuid, text, jsonb) from public, anon; grant execute on function public.rpc_log_contribution(text, uuid, text, jsonb) to authenticated;

-- 2) Trigger helpers that run as table owner (no user spoofing)
create or replace function public._log_contrib_fixed(_user uuid, _type text, _target uuid, _title text, _meta jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.user_contributions(id, user_id, type, target_id, target_title, metadata)
  values (gen_random_uuid(), _user, _type, _target, nullif(_title, ''), coalesce(_meta, '{}'::jsonb));
$$;

-- 3) TASKS: on insert and status change to done
create or replace function public.trg_tasks_log()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    perform public._log_contrib_fixed(new.created_by, 'task', new.id, new.title, jsonb_build_object('action','created','space_id', new.space_id));
  elsif TG_OP = 'UPDATE' and new.status is distinct from old.status and new.status = 'done' then
    perform public._log_contrib_fixed(coalesce(new.assignee_id, new.created_by), 'task', new.id, new.title, jsonb_build_object('action','completed','space_id', new.space_id));
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
    perform public._log_contrib_fixed(new.created_by, 'milestone', new.id, new.title, jsonb_build_object('action','created','space_id', new.space_id));
  elsif TG_OP = 'UPDATE' and new.status is distinct from old.status and new.status = 'completed' then
    perform public._log_contrib_fixed(new.created_by, 'milestone', new.id, new.title, jsonb_build_object('action','completed','space_id', new.space_id));
  end if;
  return new;
end; $$;

drop trigger if exists trg_milestones_log on public.milestones;
create trigger trg_milestones_log after insert or update on public.milestones for each row execute function public.trg_milestones_log();

-- 5) POSTS: on insert
-- Assumes table public.posts has author_id and title/content fields
create or replace function public.trg_posts_log()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public._log_contrib_fixed(new.author_id, 'post', new.id, coalesce(nullif(new.title,''), left(coalesce(new.content,''), 80)), jsonb_build_object('action','created'));
  return new;
end; $$;

drop trigger if exists trg_posts_log on public.posts;
create trigger trg_posts_log after insert on public.posts for each row execute function public.trg_posts_log();

-- 6) OPPORTUNITIES: on insert
create or replace function public.trg_opps_log()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public._log_contrib_fixed(new.created_by, 'opportunity', new.id, new.title, jsonb_build_object('action','created','visibility', new.visibility));
  return new;
end; $$;

drop trigger if exists trg_opps_log on public.opportunities;
create trigger trg_opps_log after insert on public.opportunities for each row execute function public.trg_opps_log();