import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CampaignGroup {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused';
  start_date?: string;
  end_date?: string;
  insertion_order_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  insertion_order?: {
    id: string;
    client_name: string;
    description?: string;
  };
  campaigns_count?: number;
  total_clicks?: number;
  total_page_views?: number;
  derivedStatus: 'active' | 'paused';
}

export interface CreateCampaignGroupData {
  name: string;
  description?: string;
  insertion_order_id: string;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'paused';
}

export interface UpdateCampaignGroupData {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'paused';
  insertion_order_id?: string;
}

export const useCampaignGroups = () => {
  const [campaignGroups, setCampaignGroups] = useState<CampaignGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCampaignGroups = useCallback(async () => {
    if (!user) {
      setCampaignGroups([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch campaign groups with insertion order info and campaigns with their tags
      const { data: groups, error } = await supabase
        .from('campaign_groups')
        .select(`
          *,
          insertion_orders!inner(id, client_name, description),
          campaigns!campaigns_campaign_group_id_fkey(
            id,
            tags(id)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Collect all campaign IDs for batch metrics fetch
      const allCampaignIds = (groups || []).flatMap(group => 
        (group.campaigns || []).map((campaign: any) => campaign.id)
      );

      // Fetch metrics for all campaigns in one call
      let campaignMetrics: Record<string, { page_views: number; cta_clicks: number; pin_clicks: number; last_hour: number }> = {};
      
      if (allCampaignIds.length > 0) {
        const { data: metricsData, error: metricsError } = await supabase
          .rpc('get_campaign_counters', { campaign_ids: allCampaignIds });

        if (!metricsError && metricsData) {
          campaignMetrics = metricsData.reduce((acc: any, item: any) => {
            acc[item.campaign_id] = {
              page_views: item.page_views || 0,
              cta_clicks: item.cta_clicks || 0,
              pin_clicks: item.pin_clicks || 0,
              last_hour: item.last_hour || 0
            };
            return acc;
          }, {});
        }
      }

      // Process the data to include aggregated metrics and derived status
      const processedGroups: CampaignGroup[] = (groups || []).map((group) => {
        const campaigns = group.campaigns || [];
        const campaignsCount = campaigns.length;
        
        // Calculate totals for this group
        let totalPageViews = 0;
        let totalClicks = 0;
        let hasRecentActivity = false;

        campaigns.forEach((campaign: any) => {
          const metrics = campaignMetrics[campaign.id];
          if (metrics) {
            totalPageViews += metrics.page_views;
            totalClicks += metrics.cta_clicks + metrics.pin_clicks;
            if (metrics.last_hour > 0) {
              hasRecentActivity = true;
            }
          }
        });

        // Derive status: if group is paused, keep paused; otherwise check for recent activity
        const derivedStatus = group.status === 'paused' ? 'paused' : (hasRecentActivity ? 'active' : 'paused');

        // Debug logging in development
        if (process.env.NODE_ENV === 'development' && (totalPageViews > 0 || totalClicks > 0)) {
          console.debug(`Group "${group.name}": ${totalPageViews} page views, ${totalClicks} clicks, ${campaigns.length} campaigns`);
        }

        return {
          ...group,
          status: group.status as 'active' | 'paused',
          insertion_order: group.insertion_orders,
          campaigns_count: campaignsCount,
          total_clicks: totalClicks,
          total_page_views: totalPageViews,
          derivedStatus
        } as CampaignGroup;
      });

        setCampaignGroups(processedGroups);
    } catch (error) {
      console.error('Error fetching campaign groups:', error);
      setCampaignGroups([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCampaignGroup = useCallback(async (data: CreateCampaignGroupData) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data: newGroup, error } = await supabase
        .from('campaign_groups')
        .insert({
          ...data,
          user_id: user.id,
          status: data.status || 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the list
      await fetchCampaignGroups();
      
      return { data: newGroup, error: null };
    } catch (error) {
      console.error('Error creating campaign group:', error);
      return { error: 'Failed to create campaign group' };
    }
  }, [user, fetchCampaignGroups]);

  const updateCampaignGroup = useCallback(async (id: string, data: UpdateCampaignGroupData) => {
    try {
      const { data: updatedGroup, error } = await supabase
        .from('campaign_groups')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Refresh the list
      await fetchCampaignGroups();
      
      return { data: updatedGroup, error: null };
    } catch (error) {
      console.error('Error updating campaign group:', error);
      return { error: 'Failed to update campaign group' };
    }
  }, [fetchCampaignGroups]);

  const deleteCampaignGroup = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaign_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchCampaignGroups();
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting campaign group:', error);
      return { error: 'Failed to delete campaign group' };
    }
  }, [fetchCampaignGroups]);

  useEffect(() => {
    fetchCampaignGroups();
  }, [fetchCampaignGroups]);

  return {
    campaignGroups,
    loading,
    fetchCampaignGroups,
    createCampaignGroup,
    updateCampaignGroup,
    deleteCampaignGroup
  };
};