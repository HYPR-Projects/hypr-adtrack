-- FASE 1.1: Criar Materialized View para Métricas Pré-calculadas
CREATE MATERIALIZED VIEW campaign_metrics_summary AS
SELECT 
  c.id as campaign_id,
  COUNT(DISTINCT t.id) as total_tags,
  COALESCE(SUM(CASE WHEN e.event_type = 'page_view' THEN 1 ELSE 0 END), 0) as page_views,
  COALESCE(SUM(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END), 0) as cta_clicks,
  COALESCE(SUM(CASE WHEN e.event_type = 'pin_click' THEN 1 ELSE 0 END), 0) as pin_clicks,
  COALESCE(SUM(CASE WHEN e.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END), 0) as total_7d,
  COALESCE(SUM(CASE WHEN e.created_at >= NOW() - INTERVAL '1 hour' THEN 1 ELSE 0 END), 0) as last_hour,
  MAX(e.created_at) as last_event_at
FROM campaigns c
LEFT JOIN tags t ON t.campaign_id = c.id
LEFT JOIN events e ON e.tag_id = t.id
GROUP BY c.id;

-- Criar índice único para refresh concorrente
CREATE UNIQUE INDEX campaign_metrics_summary_campaign_id_idx ON campaign_metrics_summary (campaign_id);

-- FASE 1.2: Modificar RPC get_campaign_counters para usar Materialized View
CREATE OR REPLACE FUNCTION public.get_campaign_counters(campaign_ids uuid[])
RETURNS TABLE(
  campaign_id uuid, 
  page_views bigint, 
  cta_clicks bigint, 
  pin_clicks bigint, 
  total_7d bigint, 
  last_hour bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    campaign_id,
    page_views,
    cta_clicks,
    pin_clicks,
    total_7d,
    last_hour
  FROM campaign_metrics_summary
  WHERE campaign_id = ANY(campaign_ids)
    AND (auth.uid() IS NOT NULL);
$$;

-- Criar função para refresh da materialized view
CREATE OR REPLACE FUNCTION public.refresh_campaign_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_summary;
END;
$$;