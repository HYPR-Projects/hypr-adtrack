
-- Increase statement timeout for refresh function to 5 minutes
CREATE OR REPLACE FUNCTION public.refresh_campaign_metrics()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET statement_timeout TO '300s'
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_daily;
END;
$function$;

-- Also update the trigger function with higher timeout
CREATE OR REPLACE FUNCTION public.trigger_refresh_campaign_metrics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET statement_timeout TO '300s'
AS $function$
BEGIN
  IF pg_try_advisory_xact_lock(123456789) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_daily;
  END IF;
  RETURN NEW;
END;
$function$;
