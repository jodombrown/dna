-- Align capacity logic to status = 'going' and add robust triggers

-- Update registration RPC to count only 'going' attendees for capacity
CREATE OR REPLACE FUNCTION public.rpc_event_register(p_event uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := (select auth.uid());
  v_max int;
  v_cnt int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  select max_attendees into v_max from public.events where id = p_event;
  if v_max is not null then
    select count(*) into v_cnt from public.event_registrations where event_id = p_event and status = 'going';
    if v_cnt >= v_max then
      raise exception 'capacity_reached';
    end if;
  end if;
  insert into public.event_registrations(event_id, user_id)
  values (p_event, v_uid)
  on conflict (event_id, user_id) do nothing;
  -- Optional ADIN: log contribution (safe, SECURITY DEFINER)
  perform public.rpc_log_contribution('event', p_event, NULL, jsonb_build_object('action','registered'));
end;
$function$;

-- Recalculate attendee counts whenever regs change
DROP TRIGGER IF EXISTS event_reg_change ON public.event_registrations;
CREATE TRIGGER event_reg_change
AFTER INSERT OR UPDATE OF status OR DELETE ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public._on_event_reg_change();

-- Ensure waitlist promotion runs on delete
DROP TRIGGER IF EXISTS event_reg_delete_promote ON public.event_registrations;
CREATE TRIGGER event_reg_delete_promote
AFTER DELETE ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.trg_event_reg_cancel_promote();