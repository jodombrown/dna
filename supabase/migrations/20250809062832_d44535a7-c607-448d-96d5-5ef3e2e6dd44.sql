-- Reusable helpers to award badges and prevent duplicates
create or replace function public.award_badge_if_missing(p_user uuid, p_key text, p_name text, p_desc text default null, p_icon text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_exists int;
begin
  select 1 into v_exists from public.user_badges where user_id = p_user and badge_type = p_key limit 1;
  if v_exists is not null then return false; end if;
  insert into public.user_badges(user_id, badge_type, badge_name, description, icon)
  values (p_user, p_key, coalesce(p_name, p_key), p_desc, p_icon);
  insert into public.notifications(user_id, type, payload, read, created_at)
  values (p_user, 'badge_awarded', jsonb_build_object('badge_key', p_key, 'badge_name', coalesce(p_name, p_key), 'description', p_desc, 'icon', p_icon), false, now());
  return true;
end; $$;

-- Utility to count user contributions by type and optional metadata action
create or replace function public.count_contrib(p_user uuid, p_type text, p_action text default null)
returns integer
language sql
stable
set search_path = public
as $$
  select count(*)::int
  from public.user_contributions c
  where c.user_id = p_user
    and c.type = p_type
    and (p_action is null or (c.metadata ->> 'action') = p_action)
$$;

-- Badge evaluation after each contribution insert
create or replace function public.trg_contrib_awards()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := new.user_id; v_type text := new.type; v_awarded boolean;
begin
  -- First contribution
  if public.count_contrib(v_user, v_type, null) = 1 then
    perform public.award_badge_if_missing(v_user, 'first_contribution', 'First Contribution', 'Logged your first contribution', 'spark');
  end if;

  -- Task-specific milestones
  if v_type = 'task' then
    if public.count_contrib(v_user, 'task', 'completed') = 1 then
      perform public.award_badge_if_missing(v_user, 'first_task_completed', 'First Task Completed', 'Completed your first task', 'check');
    end if;
    if public.count_contrib(v_user, 'task', 'completed') >= 5 then
      perform public.award_badge_if_missing(v_user, 'five_tasks', 'Task Streak 5', 'Completed 5 tasks', 'list-checks');
    end if;
    if public.count_contrib(v_user, 'task', 'completed') >= 10 then
      perform public.award_badge_if_missing(v_user, 'ten_tasks', 'Task Streak 10', 'Completed 10 tasks', 'trophy');
    end if;
  end if;

  -- Milestone completion
  if v_type = 'milestone' and (new.metadata ->> 'action') = 'completed' then
    if public.count_contrib(v_user, 'milestone', 'completed') = 1 then
      perform public.award_badge_if_missing(v_user, 'first_milestone_completed', 'Milestone Achieved', 'Completed your first milestone', 'flag');
    end if;
  end if;

  -- Posting activity
  if v_type = 'post' then
    if public.count_contrib(v_user, 'post', 'created') >= 5 then
      perform public.award_badge_if_missing(v_user, 'community_builder', 'Community Builder', 'Published 5 posts', 'megaphone');
    end if;
  end if;

  -- Opportunity creation
  if v_type = 'opportunity' then
    if public.count_contrib(v_user, 'opportunity', 'created') = 1 then
      perform public.award_badge_if_missing(v_user, 'opportunity_starter', 'Opportunity Starter', 'Posted your first opportunity', 'lightbulb');
    end if;
  end if;

  return new;
end; $$;

drop trigger if exists trg_contrib_awards on public.user_contributions;
create trigger trg_contrib_awards after insert on public.user_contributions for each row execute function public.trg_contrib_awards();