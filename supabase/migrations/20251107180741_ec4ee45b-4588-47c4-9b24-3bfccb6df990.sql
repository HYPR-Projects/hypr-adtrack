-- ============================================
-- FIX: Atualizar cron job para incluir campaign_metrics_daily
-- ============================================

-- Remover agendamento anterior
SELECT cron.unschedule('refresh-campaign-metrics');

-- Criar novo agendamento que atualiza AMBAS as materialized views
SELECT cron.schedule(
  'refresh-campaign-metrics',
  '*/5 * * * *',  -- A cada 5 minutos
  $$
  -- Atualizar ambas as materialized views usadas pelos relatórios
  REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_daily;
  $$
);

-- Executar refresh imediato para processar eventos pendentes
REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_daily;

-- Comentário explicativo atualizado
COMMENT ON EXTENSION pg_cron IS 
'Agendamento automático de tarefas. Jobs ativos:
- cleanup-old-events: Deleta eventos com mais de 90 dias (diário às 3h)
- refresh-campaign-metrics: Atualiza métricas (summary + daily) a cada 5 min';