-- Proteger a Materialized View desabilitando acesso direto via API
-- Revogar todos os acessos diretos
REVOKE ALL ON campaign_metrics_summary FROM anon, authenticated, public;

-- Permitir acesso apenas via service_role (usado pelas RPC functions)
GRANT SELECT ON campaign_metrics_summary TO service_role;

-- Documentar que acesso é apenas via RPC
COMMENT ON MATERIALIZED VIEW campaign_metrics_summary IS 'Internal view - access only via get_campaign_counters RPC function';