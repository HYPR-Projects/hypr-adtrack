-- Create function to get individual campaign metrics by date range
CREATE OR REPLACE FUNCTION public.get_metrics_by_campaign_and_daterange(
  p_campaign_ids uuid[],
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone
)
RETURNS TABLE(
  campaign_id uuid,
  cta_clicks bigint,
  pin_clicks bigint,
  page_views bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    cmd.campaign_id,
    COALESCE(SUM(cmd.cta_clicks), 0)::bigint as cta_clicks,
    COALESCE(SUM(cmd.pin_clicks), 0)::bigint as pin_clicks,
    COALESCE(SUM(cmd.page_views), 0)::bigint as page_views
  FROM campaign_metrics_daily cmd
  WHERE cmd.campaign_id = ANY(p_campaign_ids)
    AND cmd.metric_date >= p_start_date::date
    AND cmd.metric_date <= p_end_date::date
    AND (auth.uid() IS NOT NULL)
  GROUP BY cmd.campaign_id;
$$;