import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { CampaignWithTags, Tag, Profile } from '@/hooks/useCampaigns';

export const useCampaignsQuery = (campaignGroupId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['campaigns', user?.id, campaignGroupId],
    queryFn: async () => {
      if (!user) return [];

      // Build query with optional campaign_group_id filter
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          tags (
            id,
            title,
            code,
            type,
            created_at,
            campaign_id
          ),
          campaign_groups!campaigns_campaign_group_id_fkey (
            name
          ),
          insertion_orders (
            client_name
          )
        `)
        .order('created_at', { ascending: false });

      if (campaignGroupId) {
        query = query.eq('campaign_group_id', campaignGroupId);
      }

      const { data: campaignsData, error: campaignsError } = await query;

      if (campaignsError) throw campaignsError;

      // Collect all campaign IDs and user IDs for batch fetching
      const campaignIds = (campaignsData || []).map(c => c.id);
      const userIds = [...new Set((campaignsData || []).map(c => c.user_id).filter(Boolean))];

      // Fetch profiles and metrics in PARALLEL
      const [profilesData, metricsData] = await Promise.all([
        userIds.length > 0
          ? supabase.from('profiles').select('*').in('id', userIds)
          : Promise.resolve({ data: [], error: null }),
        campaignIds.length > 0
          ? supabase.rpc('get_campaign_counters', { campaign_ids: campaignIds })
          : Promise.resolve({ data: [], error: null })
      ]);

      // Log errors for debugging
      if (metricsData.error) {
        console.error('[useCampaignsQuery] Error fetching metrics:', metricsData.error);
      }

      // Create lookup maps
      const profilesMap = new Map(
        (profilesData.data || []).map(p => [p.id, p])
      );

      // Ensure metricsData is always a valid array
      const metricsArray = Array.isArray(metricsData.data) ? metricsData.data : [];
      
      const metricsMap = new Map(
        metricsArray.map((m: any) => [
          m.campaign_id,
          {
            cta_clicks: Number(m.cta_clicks) || 0,
            pin_clicks: Number(m.pin_clicks) || 0,
            page_views: Number(m.page_views) || 0,
            total_7d: Number(m.total_7d) || 0,
            last_hour: Number(m.last_hour) || 0
          }
        ])
      );

      // Combine data
      const campaignsWithMetrics: CampaignWithTags[] = (campaignsData || []).map((campaign) => {
        const metrics = metricsMap.get(campaign.id) || {
          cta_clicks: 0,
          pin_clicks: 0,
          page_views: 0,
          total_7d: 0,
          last_hour: 0
        };

        // Lógica de status baseada em datas + atividade recente
        const now = new Date();
        const startDate = new Date(campaign.start_date);
        const endDate = new Date(campaign.end_date);
        
        let derivedStatus: 'active' | 'paused' | 'scheduled' | 'expired';
        
        if (now < startDate) {
          // Campanha ainda não começou
          derivedStatus = 'scheduled';
        } else if (now > endDate) {
          // Campanha já finalizou
          derivedStatus = 'expired';
        } else {
          // Campanha no período válido: verificar atividade na última hora
          derivedStatus = metrics.last_hour > 0 ? 'active' : 'paused';
        }

        return {
          ...campaign,
          tags: campaign.tags || [],
          profile: campaign.user_id ? profilesMap.get(campaign.user_id) : undefined,
          campaign_group: (campaign as any).campaign_groups,
          insertion_order: (campaign as any).insertion_orders,
          metrics,
          derivedStatus
        } as CampaignWithTags;
      });

      return campaignsWithMetrics;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - aggressive caching for better performance
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false, // Don't refetch if cache is still valid
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchInterval: 60 * 1000, // Background refresh every 1 minute
    retry: 2, // Retry twice if request fails
    retryDelay: 1000, // Wait 1 second between retries
  });

  const prefetch = (groupId?: string) => {
    if (user) {
      queryClient.prefetchQuery({
        queryKey: ['campaigns', user.id, groupId],
      });
    }
  };

  return { ...query, prefetch };
};
