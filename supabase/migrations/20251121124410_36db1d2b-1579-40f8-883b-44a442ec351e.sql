-- Create function to get aggregated metrics for specific campaigns in a date range
CREATE OR REPLACE FUNCTION public.get_aggregated_metrics_for_campaigns(
  p_campaign_ids uuid[],
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone
)
RETURNS TABLE(
  total_page_views bigint,
  total_cta_clicks bigint,
  total_pin_clicks bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(cmd.page_views), 0)::bigint as total_page_views,
    COALESCE(SUM(cmd.cta_clicks), 0)::bigint as total_cta_clicks,
    COALESCE(SUM(cmd.pin_clicks), 0)::bigint as total_pin_clicks
  FROM campaign_metrics_daily cmd
  WHERE (auth.uid() IS NOT NULL)
    AND cmd.campaign_id = ANY(p_campaign_ids)
    AND cmd.metric_date >= p_start_date::date
    AND cmd.metric_date <= p_end_date::date;
END;
$$;