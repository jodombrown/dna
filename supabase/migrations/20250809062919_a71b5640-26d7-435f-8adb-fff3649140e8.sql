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

-- Utility to count user contributions by type
create or replace function public.count_contrib(p_user uuid, p_type text)
returns integer
language sql
stable
set search_path = public
as $$
  select count(*)::int
  from public.user_contributions c
  where c.user_id = p_user
    and c.type = p_type
$$;

-- Badge evaluation after each contribution insert
create or replace function public.trg_contrib_awards()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := new.user_id; v_type text := new.type;
begin
  -- First contribution of any type
  if (select count(*) from public.user_contributions where user_id = v_user) = 1 then
    perform public.award_badge_if_missing(v_user, 'first_contribution', 'First Contribution', 'Logged your first contribution', '✨');
  end if;

  -- Task-specific milestones
  if v_type = 'task' then
    declare task_count int := public.count_contrib(v_user, 'task');
    begin
      if task_count = 1 then
        perform public.award_badge_if_missing(v_user, 'first_task', 'First Task', 'Created your first task', '✅');
      elsif task_count = 5 then
        perform public.award_badge_if_missing(v_user, 'five_tasks', 'Task Streak 5', 'Created 5 tasks', '📋');
      elsif task_count = 10 then
        perform public.award_badge_if_missing(v_user, 'ten_tasks', 'Task Master', 'Created 10 tasks', '🏆');
      end if;
    end;
  end if;

  -- Post activity milestones
  if v_type = 'post' then
    declare post_count int := public.count_contrib(v_user, 'post');
    begin
      if post_count = 1 then
        perform public.award_badge_if_missing(v_user, 'first_post', 'First Post', 'Shared your first post', '📝');
      elsif post_count = 5 then
        perform public.award_badge_if_missing(v_user, 'community_builder', 'Community Builder', 'Published 5 posts', '📢');
      end if;
    end;
  end if;

  -- Event milestones
  if v_type = 'event' then
    if public.count_contrib(v_user, 'event') = 1 then
      perform public.award_badge_if_missing(v_user, 'event_organizer', 'Event Organizer', 'Created your first event', '📅');
    end if;
  end if;

  -- Community milestones
  if v_type = 'community' then
    if public.count_contrib(v_user, 'community') = 1 then
      perform public.award_badge_if_missing(v_user, 'community_founder', 'Community Founder', 'Created your first community', '🏘️');
    end if;
  end if;

  return new;
end; $$;

drop trigger if exists trg_contrib_awards on public.user_contributions;
create trigger trg_contrib_awards after insert on public.user_contributions for each row execute function public.trg_contrib_awards();