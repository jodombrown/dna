create or replace function public.rpc_request_join_space(p_space uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid := (select auth.uid()); v_exists text;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  -- if already a member, do nothing; if rejected, flip to pending; else insert pending
  select status into v_exists from public.collaboration_memberships where space_id = p_space and user_id = v_user;
  if v_exists is null then
    insert into public.collaboration_memberships(space_id, user_id, role, status) values (p_space, v_user, 'member', 'pending');
  elsif v_exists = 'rejected' then
    update public.collaboration_memberships set status = 'pending' where space_id = p_space and user_id = v_user;
  end if;
end; $$;
revoke all on function public.rpc_request_join_space(uuid) from public, anon; grant execute on function public.rpc_request_join_space(uuid) to authenticated;

create or replace function public.rpc_membership_approve(p_space uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_actor uuid := (select auth.uid());
begin
  if not public.is_member_of_space(p_space, v_actor, array['owner','admin'], true) then raise exception 'not authorized'; end if;
  update public.collaboration_memberships set status = 'approved' where space_id = p_space and user_id = p_user;
end; $$;
revoke all on function public.rpc_membership_approve(uuid,uuid) from public, anon; grant execute on function public.rpc_membership_approve(uuid,uuid) to authenticated;

create or replace function public.rpc_membership_reject(p_space uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_actor uuid := (select auth.uid());
begin
  if not public.is_member_of_space(p_space, v_actor, array['owner','admin'], true) then raise exception 'not authorized'; end if;
  update public.collaboration_memberships set status = 'rejected' where space_id = p_space and user_id = p_user;
end; $$;
revoke all on function public.rpc_membership_reject(uuid,uuid) from public, anon; grant execute on function public.rpc_membership_reject(uuid,uuid) to authenticated;