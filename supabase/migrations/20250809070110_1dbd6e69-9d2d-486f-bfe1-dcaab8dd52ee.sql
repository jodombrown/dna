-- Backend Health Snapshot
-- Returns a JSONB report of tables, RLS, functions, triggers, and potential risks.
create or replace function public.rpc_health_snapshot()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tables jsonb := '[]'::jsonb;
  v_functions jsonb := '[]'::jsonb;
  v_triggers jsonb := '[]'::jsonb;
  v_policies jsonb := '[]'::jsonb;
  v_grants jsonb := '[]'::jsonb;
  v_multi_insert_notifs boolean := false;
  v_has_rls_issues boolean := false;
  v_now timestamptz := now();
begin
  -- Key tables and expectations
  v_tables := jsonb_build_array(
    jsonb_build_object('name','profiles','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='profiles')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='profiles')),
    jsonb_build_object('name','collaboration_spaces','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='collaboration_spaces')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='collaboration_spaces')),
    jsonb_build_object('name','collaboration_memberships','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='collaboration_memberships')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='collaboration_memberships')),
    jsonb_build_object('name','tasks','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='tasks')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='tasks')),
    jsonb_build_object('name','milestones','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='milestones')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='milestones')),
    jsonb_build_object('name','task_comments','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='task_comments')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='task_comments')),
    jsonb_build_object('name','opportunities','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='opportunities')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='opportunities')),
    jsonb_build_object('name','posts','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='posts')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='posts')),
    jsonb_build_object('name','user_contributions','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='user_contributions')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='user_contributions')),
    jsonb_build_object('name','impact_badges','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='impact_badges')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='impact_badges')),
    jsonb_build_object('name','user_badges','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='user_badges')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='user_badges')),
    jsonb_build_object('name','notifications','exists',(select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='notifications')), 'rls',(select coalesce(relrowsecurity,false) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='notifications'))
  );

  -- Policies summary (names by table)
  v_policies := (
    select coalesce(jsonb_agg(jsonb_build_object(
      'table', pol.tablename,
      'name', pol.policyname,
      'cmd', pol.cmd,
      'permissive', pol.permissive
    )), '[]'::jsonb)
    from (
      select p.tablename, p.policyname, p.cmd, p.permissive
      from pg_policies p
      where p.schemaname = 'public'
    ) pol
  );

  -- Triggers we expect
  v_triggers := (
    select coalesce(jsonb_agg(jsonb_build_object(
      'table', c.relname,
      'trigger', t.tgname,
      'enabled', case when t.tgenabled = 'O' then true else false end
    )), '[]'::jsonb)
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and t.tgisinternal = false
      and t.tgname in ('trg_tasks_log','trg_milestones_log','trg_contrib_awards','trg_notify_task_events')
  );

  -- Functions we expect (and their volatility/security)
  v_functions := (
    select coalesce(jsonb_agg(jsonb_build_object(
      'name', p.proname,
      'security_definer', p.prosecdef,
      'volatile', case p.provolatile when 'v' then 'volatile' when 's' then 'stable' else 'immutable' end
    )), '[]'::jsonb)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'is_admin_user','is_member_of_space',
        'rpc_task_create','rpc_task_update','rpc_task_assign','rpc_task_set_status','rpc_task_comment',
        'rpc_public_profile_bundle','rpc_log_contribution','rpc_request_join_space','rpc_membership_approve','rpc_membership_reject'
      )
  );

  -- Risk: SECURITY DEFINER functions executable by anon/authenticated
  v_grants := (
    select coalesce(jsonb_agg(jsonb_build_object(
      'function', r.routine_name,
      'grantee', r.grantee,
      'privilege', r.privilege_type
    )), '[]'::jsonb)
    from information_schema.routine_privileges r
    where r.specific_schema = 'public'
      and r.privilege_type = 'EXECUTE'
      and r.grantee in ('anon','authenticated')
  );

  -- Warn for multiple permissive INSERT policies on notifications
  select (count(*) > 1) into v_multi_insert_notifs
  from pg_policies p
  where p.schemaname='public' and p.tablename='notifications' and p.cmd='INSERT' and p.permissive;

  -- Cheap RLS signal: any table in v_tables without rls=true
  select exists (
    select 1 from (
      select (t->>'rls')::bool as rls from jsonb_array_elements(v_tables) t
    ) s where coalesce(rls,false) = false
  ) into v_has_rls_issues;

  return jsonb_build_object(
    'generated_at', v_now,
    'tables', v_tables,
    'policies', v_policies,
    'triggers', v_triggers,
    'functions', v_functions,
    'grants_exec_to_anon_or_auth', v_grants,
    'warnings', jsonb_build_object(
      'notifications_multiple_permissive_insert', v_multi_insert_notifs,
      'some_tables_without_rls', v_has_rls_issues
    )
  );
end;
$$;

revoke all on function public.rpc_health_snapshot() from public, anon;
grant execute on function public.rpc_health_snapshot() to authenticated;