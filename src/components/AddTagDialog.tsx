import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus } from "lucide-react";

interface AddTagDialogProps {
  onTagAdded: (title: string, type: 'click-button' | 'pin' | 'page-view') => void;
  campaignName: string;
}

const AddTagDialog = ({ onTagAdded, campaignName }: AddTagDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<'click-button' | 'pin' | 'page-view'>('click-button');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onTagAdded(title.trim(), type);
    
    // Reset form
    setTitle("");
    setType('click-button');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Tag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Tag</DialogTitle>
          <DialogDescription>
            Adicione uma nova tag de tracking para a campanha "{campaignName}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Tag *</Label>
            <Input
              id="title"
              placeholder="Ex: Botão Principal, Pin da Loja"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Um nome descritivo para identificar esta tag
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Tipo da Tag *</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as 'click-button' | 'pin' | 'page-view')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="click-button" id="click-button" />
                <Label htmlFor="click-button" className="font-normal">
                  Click Button - Botões de ação, banners, links clicáveis
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pin" id="pin" />
                <Label htmlFor="pin" className="font-normal">
                  PIN - Pontos no mapa, localizações, marcadores
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="page-view" id="page-view" />
                <Label htmlFor="page-view" className="font-normal">
                  Page View - Visualizações de página, impressões
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Criar Tag
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTagDialog;