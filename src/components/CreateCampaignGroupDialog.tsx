import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useCampaignGroups } from "@/hooks/useCampaignGroups";

interface CreateCampaignGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insertionOrderId?: string;
  onCampaignGroupCreated: () => void;
}

export const CreateCampaignGroupDialog = ({
  open,
  onOpenChange,
  insertionOrderId,
  onCampaignGroupCreated
}: CreateCampaignGroupDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createCampaignGroup } = useCampaignGroups();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!insertionOrderId) {
      toast({
        title: "Erro",
        description: "ID da Insertion Order não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await createCampaignGroup({
      name: name.trim(),
      description: description.trim(),
      insertion_order_id: insertionOrderId,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });

    if (error) {
      toast({
        title: "Erro ao criar campanha",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Campanha criada",
        description: "A campanha foi criada com sucesso.",
      });

      // Reset form
      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      onOpenChange(false);
      onCampaignGroupCreated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Campanha</DialogTitle>
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
              {loading ? 'Criando...' : 'Criar Campanha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};