-- Security-test probe (BD141 positive-path media coverage).
--
-- PostgREST exposes only public + graphql_public here, so the media-upload
-- security suite cannot read storage.objects directly to prove an uploaded
-- row is owned by the member who created it. This function is the read-back
-- path: it returns ONLY exact (bucket, name) matches, runs as the caller
-- (SECURITY INVOKER — no definer escalation), and is executable ONLY by
-- service_role, which already holds SELECT + BYPASSRLS on storage.objects.
-- anon and authenticated get nothing.
create or replace function public.security_probe_media_object(
  p_bucket text,
  p_name text
)
returns table (bucket_id text, owner_id text, name text)
language sql
stable
security invoker
set search_path = ''
as $$
  select o.bucket_id, o.owner_id, o.name
  from storage.objects o
  where o.bucket_id = p_bucket
    and o.name = p_name;
$$;

revoke all on function public.security_probe_media_object(text, text) from public;
revoke all on function public.security_probe_media_object(text, text) from anon;
revoke all on function public.security_probe_media_object(text, text) from authenticated;
grant execute on function public.security_probe_media_object(text, text) to service_role;
