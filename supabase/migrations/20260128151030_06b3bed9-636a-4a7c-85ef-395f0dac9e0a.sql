-- Create function to get report data directly from events table
CREATE OR REPLACE FUNCTION public.get_report_from_events(
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
      WHEN 'week' THEN date_trunc('week', e.created_at)
      WHEN 'month' THEN date_trunc('month', e.created_at)
      ELSE date_trunc('day', e.created_at)
    END as period_start,
    t.campaign_id,
    SUM(CASE WHEN e.event_type = 'page_view' THEN 1 ELSE 0 END)::bigint as page_views,
    SUM(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END)::bigint as cta_clicks,
    SUM(CASE WHEN e.event_type = 'pin_click' THEN 1 ELSE 0 END)::bigint as pin_clicks
  FROM events e
  JOIN tags t ON e.tag_id = t.id
  WHERE (auth.uid() IS NOT NULL)
    AND (p_campaign_ids IS NULL OR t.campaign_id = ANY(p_campaign_ids))
    AND e.created_at >= start_date_filter
    AND e.created_at < (end_date_filter + INTERVAL '1 day')
  GROUP BY 
    CASE p_group_by
      WHEN 'week' THEN date_trunc('week', e.created_at)
      WHEN 'month' THEN date_trunc('month', e.created_at)
      ELSE date_trunc('day', e.created_at)
    END,
    t.campaign_id
  HAVING SUM(1) > 0
  ORDER BY period_start DESC, t.campaign_id;
END;
$$;