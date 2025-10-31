-- Fix SUM() return type casting to bigint in get_report_from_materialized_view
CREATE OR REPLACE FUNCTION public.get_report_from_materialized_view(
  p_campaign_ids uuid[] DEFAULT NULL,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL,
  p_group_by text DEFAULT 'day'
)
RETURNS TABLE(
  period_start timestamp with time zone,
  campaign_id uuid,
  page_views bigint,
  cta_clicks bigint,
  pin_clicks bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  start_date_filter date;
  end_date_filter date;
BEGIN
  start_date_filter := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  end_date_filter := COALESCE(p_end_date, CURRENT_DATE);
  
  RETURN QUERY
  SELECT 
    CASE p_group_by
      WHEN 'week' THEN date_trunc('week', (cmd.metric_date::timestamp AT TIME ZONE 'UTC'))
      WHEN 'month' THEN date_trunc('month', (cmd.metric_date::timestamp AT TIME ZONE 'UTC'))
      ELSE date_trunc('day', (cmd.metric_date::timestamp AT TIME ZONE 'UTC'))
    END as period_start,
    cmd.campaign_id,
    SUM(cmd.page_views)::bigint as page_views,
    SUM(cmd.cta_clicks)::bigint as cta_clicks,
    SUM(cmd.pin_clicks)::bigint as pin_clicks
  FROM campaign_metrics_daily cmd
  WHERE (auth.uid() IS NOT NULL)
    AND (p_campaign_ids IS NULL OR cmd.campaign_id = ANY(p_campaign_ids))
    AND cmd.metric_date >= start_date_filter
    AND cmd.metric_date <= end_date_filter
  GROUP BY 
    CASE p_group_by
      WHEN 'week' THEN date_trunc('week', (cmd.metric_date::timestamp AT TIME ZONE 'UTC'))
      WHEN 'month' THEN date_trunc('month', (cmd.metric_date::timestamp AT TIME ZONE 'UTC'))
      ELSE date_trunc('day', (cmd.metric_date::timestamp AT TIME ZONE 'UTC'))
    END,
    cmd.campaign_id
  HAVING SUM(cmd.page_views + cmd.cta_clicks + cmd.pin_clicks) > 0
  ORDER BY period_start DESC, cmd.campaign_id;
END;
$$;