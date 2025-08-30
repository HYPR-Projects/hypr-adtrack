import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CampaignGroup } from "@/hooks/useCampaignGroups";

interface EditCampaignGroupDialogProps {
  campaignGroup: CampaignGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignGroupUpdated: () => void;
}

export const EditCampaignGroupDialog = ({
  campaignGroup,
  open,
  onOpenChange,
  onCampaignGroupUpdated
}: EditCampaignGroupDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && campaignGroup) {
      setName(campaignGroup.name);
      setDescription(campaignGroup.description || "");
      setStartDate(campaignGroup.start_date || "");
      setEndDate(campaignGroup.end_date || "");
    }
  }, [open, campaignGroup]);

  const updateCampaignGroup = async (updateData: {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const { error } = await supabase
      .from('campaign_groups')
      .update(updateData)
      .eq('id', campaignGroup.id);

    return { error };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    const updateData = {
      name: name.trim(),
      description: description.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    };

    const { error } = await updateCampaignGroup(updateData);

    if (error) {
      toast({
        title: "Erro ao atualizar campanha",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Campanha atualizada",
        description: "A campanha foi atualizada com sucesso.",
      });

      onOpenChange(false);
      onCampaignGroupUpdated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Campanha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Campanha *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Campanha Black Friday 2024"
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os objetivos e características desta campanha..."
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
                min={startDate}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !name.trim()}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};