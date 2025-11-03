-- ============================================
-- REFRESH AUTOMÁTICO DE MÉTRICAS (A CADA 5 MIN)
-- ============================================

-- Remover agendamento anterior se existir
SELECT cron.unschedule('refresh-campaign-metrics') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'refresh-campaign-metrics'
);

-- Agendar refresh da materialized view a cada 5 minutos
-- Mantém as métricas de last_hour sempre atualizadas
SELECT cron.schedule(
  'refresh-campaign-metrics',
  '*/5 * * * *',  -- A cada 5 minutos
  $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_summary;
  $$
);

-- Comentário explicativo
COMMENT ON EXTENSION pg_cron IS 
'Agendamento automático de tarefas. Jobs ativos:
- cleanup-old-events: Deleta eventos com mais de 90 dias (diário às 3h)
- refresh-campaign-metrics: Atualiza métricas de campanha (a cada 5 min)';