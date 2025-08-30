import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface CampaignGroup {
  id: string;
  name: string;
  description?: string;
  user_id?: string;
  insertion_order_id: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  insertion_order?: {
    id: string;
    client_name: string;
  };
  _count?: {
    campaigns: number;
  };
}

export const useCampaignGroups = (insertionOrderId?: string) => {
  const [campaignGroups, setCampaignGroups] = useState<CampaignGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCampaignGroups = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('campaign_groups')
        .select(`
          *,
          insertion_order:insertion_orders(id, client_name),
          campaigns(id)
        `)
        .order('created_at', { ascending: false });

      if (insertionOrderId) {
        query = query.eq('insertion_order_id', insertionOrderId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching campaign groups:', error);
        toast({
          title: "Erro ao carregar campanhas",
          description: "Não foi possível carregar as campanhas. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      const formattedData = data?.map(group => ({
        ...group,
        _count: {
          campaigns: group.campaigns?.length || 0
        }
      })) || [];

      setCampaignGroups(formattedData);
    } catch (error) {
      console.error('Error in fetchCampaignGroups:', error);
      toast({
        title: "Erro ao carregar campanhas",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaignGroup = async (campaignGroupData: {
    name: string;
    description?: string;
    insertion_order_id: string;
    start_date?: string;
    end_date?: string;
  }) => {
    if (!user) {
      return { error: { message: 'Usuário não autenticado' } };
    }

    try {
      const { error } = await supabase
        .from('campaign_groups')
        .insert({
          ...campaignGroupData,
          user_id: user.id,
        });

      if (error) {
        console.error('Error creating campaign group:', error);
        return { error };
      }

      await fetchCampaignGroups();
      return { error: null };
    } catch (error) {
      console.error('Error in createCampaignGroup:', error);
      return { error: { message: 'Erro inesperado ao criar campanha' } };
    }
  };

  const deleteCampaignGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaign_groups')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting campaign group:', error);
        toast({
          title: "Erro ao excluir campanha",
          description: "Não foi possível excluir a campanha. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Campanha excluída",
        description: "A campanha foi excluída com sucesso.",
      });

      await fetchCampaignGroups();
    } catch (error) {
      console.error('Error in deleteCampaignGroup:', error);
      toast({
        title: "Erro ao excluir campanha",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchCampaignGroups();
    }
  }, [user, insertionOrderId]);

  return {
    campaignGroups,
    loading,
    fetchCampaignGroups,
    createCampaignGroup,
    deleteCampaignGroup,
  };
};