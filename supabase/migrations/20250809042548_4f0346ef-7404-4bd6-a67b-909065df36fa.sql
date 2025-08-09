-- 1) task_comments table
create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  space_id uuid not null,
  author_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_task_comments_task on public.task_comments(task_id);
create index if not exists idx_task_comments_space on public.task_comments(space_id);
alter table public.task_comments enable row level security;

-- RLS: read if member
drop policy if exists "read comments if space member" on public.task_comments;
create policy "read comments if space member" on public.task_comments for select using (
  public.is_member_of_space(space_id, (select auth.uid()), array['owner','admin','member'], true)
);

-- insert own comment if member
drop policy if exists "insert own comment" on public.task_comments;
create policy "insert own comment" on public.task_comments for insert with check (
  author_id = (select auth.uid())
  and public.is_member_of_space(space_id, (select auth.uid()), array['owner','admin','member'], true)
);

-- delete by author or owner/admin
drop policy if exists "delete comment by author or owner" on public.task_comments;
create policy "delete comment by author or owner" on public.task_comments for delete using (
  author_id = (select auth.uid())
  or public.is_member_of_space(space_id, (select auth.uid()), array['owner','admin'], true)
);

-- 2) RPCs: create/update/assign/status/comment
create or replace function public.rpc_task_create(p_space uuid, p_title text, p_description text default null, p_due date default null, p_priority text default 'normal')
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_user uuid := (select auth.uid());
begin
  if not public.is_member_of_space(p_space, v_user, array['owner','admin','member'], true) then raise exception 'not authorized'; end if;
  insert into public.tasks(id, space_id, title, description, status, priority, assignee_id, due_date, created_by)
  values (gen_random_uuid(), p_space, trim(p_title), nullif(trim(p_description), ''), 'todo', coalesce(p_priority,'normal'), v_user, p_due, v_user)
  returning id into v_id;
  return v_id;
end; $$;
revoke all on function public.rpc_task_create(uuid,text,text,date,text) from public, anon;
grant execute on function public.rpc_task_create(uuid,text,text,date,text) to authenticated;

create or replace function public.rpc_task_update(p_task uuid, p_title text default null, p_description text default null, p_due date default null, p_priority text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_space uuid; v_user uuid := (select auth.uid());
begin
  select space_id into v_space from public.tasks where id = p_task;
  if v_space is null then raise exception 'task not found'; end if;
  if not public.is_member_of_space(v_space, v_user, array['owner','admin','member'], true) then raise exception 'not authorized'; end if;
  update public.tasks
  set title = coalesce(nullif(trim(p_title), ''), title),
      description = case when p_description is null then description else nullif(trim(p_description), '') end,
      due_date = coalesce(p_due, due_date),
      priority = coalesce(p_priority, priority)
  where id = p_task;
end; $$;
revoke all on function public.rpc_task_update(uuid,text,text,date,text) from public, anon;
grant execute on function public.rpc_task_update(uuid,text,text,date,text) to authenticated;

create or replace function public.rpc_task_assign(p_task uuid, p_assignee uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_space uuid; v_user uuid := (select auth.uid());
begin
  select space_id into v_space from public.tasks where id = p_task;
  if v_space is null then raise exception 'task not found'; end if;
  if not public.is_member_of_space(v_space, v_user, array['owner','admin'], true) then raise exception 'not authorized'; end if;
  if not public.is_member_of_space(v_space, p_assignee, array['owner','admin','member'], true) then raise exception 'assignee not a member'; end if;
  update public.tasks set assignee_id = p_assignee where id = p_task;
end; $$;
revoke all on function public.rpc_task_assign(uuid,uuid) from public, anon;
grant execute on function public.rpc_task_assign(uuid,uuid) to authenticated;

create or replace function public.rpc_task_set_status(p_task uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare v_space uuid; v_user uuid := (select auth.uid());
begin
  if p_status not in ('todo','in-progress','done') then raise exception 'invalid status'; end if;
  select space_id into v_space from public.tasks where id = p_task;
  if v_space is null then raise exception 'task not found'; end if;
  if not public.is_member_of_space(v_space, v_user, array['owner','admin','member'], true) then raise exception 'not authorized'; end if;
  update public.tasks set status = p_status where id = p_task;
end; $$;
revoke all on function public.rpc_task_set_status(uuid,text) from public, anon;
grant execute on function public.rpc_task_set_status(uuid,text) to authenticated;

create or replace function public.rpc_task_comment(p_task uuid, p_body text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_space uuid; v_id uuid; v_user uuid := (select auth.uid());
begin
  if length(trim(p_body)) < 1 then raise exception 'empty comment'; end if;
  select space_id into v_space from public.tasks where id = p_task;
  if v_space is null then raise exception 'task not found'; end if;
  if not public.is_member_of_space(v_space, v_user, array['owner','admin','member'], true) then raise exception 'not authorized'; end if;
  insert into public.task_comments(id, task_id, space_id, author_id, body)
  values (gen_random_uuid(), p_task, v_space, v_user, trim(p_body)) returning id into v_id;
  return v_id;
end; $$;
revoke all on function public.rpc_task_comment(uuid,text) from public, anon;
grant execute on function public.rpc_task_comment(uuid,text) to authenticated;

-- 3) trigger to log task events in impact_log (safer than notifications schema)
create or replace function public.notify_task_events() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'UPDATE' then
    if NEW.assignee_id is distinct from OLD.assignee_id and NEW.assignee_id is not null then
      insert into public.impact_log(user_id, type, target_type, target_id, pillar, points, created_at)
      values (NEW.assignee_id, 'task_assigned', 'task', NEW.id, 'collaborate', 1, now());
    end if;
    if NEW.status is distinct from OLD.status then
      insert into public.impact_log(user_id, type, target_type, target_id, pillar, points, created_at)
      select m.user_id, 'task_status', 'task', NEW.id, 'collaborate', 0, now()
      from public.collaboration_memberships m
      where m.space_id = NEW.space_id and m.status = 'approved';
    end if;
  end if;
  return NEW;
end; $$;

drop trigger if exists trg_notify_task_events on public.tasks;
create trigger trg_notify_task_events after update on public.tasks for each row execute function public.notify_task_events();