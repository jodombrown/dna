-- Update the public profile bundle function to match actual table structure
create or replace function public.rpc_public_profile_bundle(p_username text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_user uuid; v_profile jsonb; v_contrib jsonb; v_badges jsonb;
begin
  v_user := public._user_id_by_username(p_username);
  if v_user is null then
    return jsonb_build_object('found', false);
  end if;

  -- Only expose non-sensitive, explicitly public fields
  select jsonb_build_object(
    'user_id', p.id,
    'username', p.username,
    'full_name', p.full_name,
    'headline', p.headline,
    'bio', p.bio,
    'region', p.region,
    'skills', coalesce(p.skills, '{}'::text[]),
    'impact_areas', coalesce(p.impact_areas, '{}'::text[]),
    'avatar_url', p.avatar_url,
    'visibility', p.visibility
  ) into v_profile
  from public.profiles p
  where p.id = v_user and coalesce(p.visibility, 'public') = 'public';

  if v_profile is null then
    return jsonb_build_object('found', false, 'reason', 'not_public');
  end if;

  -- Get contributions using actual table structure
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'type', c.type,
    'target_id', c.target_id,
    'description', c.description,
    'sector', c.sector,
    'region', c.region,
    'created_at', c.created_at
  ) order by c.created_at desc), '[]'::jsonb)
  into v_contrib
  from public.user_contributions c
  where c.user_id = v_user;

  -- Awarded badges
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', ub.id,
    'badge_type', ub.badge_type,
    'badge_name', ub.badge_name,
    'description', ub.description,
    'icon', ub.icon,
    'created_at', ub.created_at
  ) order by ub.created_at desc), '[]'::jsonb)
  into v_badges
  from public.user_badges ub
  where ub.user_id = v_user;

  return jsonb_build_object(
    'found', true,
    'profile', v_profile,
    'contributions', v_contrib,
    'badges', v_badges
  );
end;
$$;