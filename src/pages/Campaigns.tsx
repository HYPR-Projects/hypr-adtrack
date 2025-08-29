import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Copy, ExternalLink, BarChart3, Eye, MousePointer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - será substituído por queries do Supabase
const mockCampaigns = [
  {
    id: "1",
    name: "Campanha Black Friday",
    description: "Promoção especial para Black Friday",
    status: "active",
    budget: 5000,
    start_date: "2024-01-15",
    end_date: "2024-02-15",
    created_at: "2024-01-10",
    metrics: {
      cta_clicks: 245,
      pin_clicks: 189,
      total_7d: 67
    },
    tags: {
      cta: "bf2024_cta_x9k2m",
      pin: "bf2024_pin_h7n4j"
    }
  },
  {
    id: "2", 
    name: "Campanha Natal",
    description: "Campanha para período natalino",
    status: "paused",
    budget: 3000,
    start_date: "2024-12-01",
    end_date: "2024-12-31",
    created_at: "2024-11-20",
    metrics: {
      cta_clicks: 156,
      pin_clicks: 98,
      total_7d: 23
    },
    tags: {
      cta: "natal24_cta_k8j5l",
      pin: "natal24_pin_m9p2q"
    }
  }
];

const generateTag = (campaignName: string, type: string): string => {
  const clean = campaignName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
  const random = Math.random().toString(36).slice(2, 8);
  return `${clean}_${type}_${random}`;
};

const CampaignCard = ({ campaign }: { campaign: any }) => {
  const { toast } = useToast();
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`,
    });
  };

  const getPixelUrl = (tag: string) => 
    `https://seu-project-id.functions.supabase.co/track-event?tag=${tag}&cb=` + "${timestamp}";

  const getJsSnippet = (tag: string) => 
    `fetch("https://seu-project-id.functions.supabase.co/track-event", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  mode: "no-cors",
  body: JSON.stringify({
    tag: "${tag}",
    metadata: { ua: navigator.userAgent }
  })
})`;

  return (
    <Card className="bg-gradient-card shadow-card-soft hover:shadow-campaign transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {campaign.name}
            </CardTitle>
            <CardDescription className="mt-1">{campaign.description}</CardDescription>
          </div>
          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="px-3 py-1">
            {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <MousePointer className="w-5 h-5 mx-auto mb-2 text-campaign-primary" />
              <div className="text-2xl font-bold text-campaign-primary">{campaign.metrics.cta_clicks}</div>
              <div className="text-sm text-muted-foreground">CTA Clicks</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Eye className="w-5 h-5 mx-auto mb-2 text-campaign-secondary" />
              <div className="text-2xl font-bold text-campaign-secondary">{campaign.metrics.pin_clicks}</div>
              <div className="text-sm text-muted-foreground">PIN Clicks</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <BarChart3 className="w-5 h-5 mx-auto mb-2 text-campaign-success" />
              <div className="text-2xl font-bold text-campaign-success">{campaign.metrics.total_7d}</div>
              <div className="text-sm text-muted-foreground">Últimos 7d</div>
            </div>
          </div>

          <Separator />

          {/* Tags e URLs */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Tags de Tracking</h4>
            
            {/* CTA Tag */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-campaign-primary/10 text-campaign-primary border-campaign-primary/30">
                  CTA
                </Badge>
                <code className="text-xs bg-muted px-2 py-1 rounded">{campaign.tags.cta}</code>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="copy"
                  size="sm"
                  onClick={() => copyToClipboard(getPixelUrl(campaign.tags.cta), "Pixel URL (CTA)")}
                  className="justify-start"
                >
                  <Copy className="w-3 h-3" />
                  Pixel URL
                </Button>
                <Button
                  variant="copy"
                  size="sm"
                  onClick={() => copyToClipboard(getJsSnippet(campaign.tags.cta), "JS Snippet (CTA)")}
                  className="justify-start"
                >
                  <Copy className="w-3 h-3" />
                  JS Snippet
                </Button>
              </div>
            </div>

            {/* PIN Tag */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-campaign-secondary/10 text-campaign-secondary border-campaign-secondary/30">
                  PIN
                </Badge>
                <code className="text-xs bg-muted px-2 py-1 rounded">{campaign.tags.pin}</code>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="copy"
                  size="sm"
                  onClick={() => copyToClipboard(getPixelUrl(campaign.tags.pin), "Pixel URL (PIN)")}
                  className="justify-start"
                >
                  <Copy className="w-3 h-3" />
                  Pixel URL
                </Button>
                <Button
                  variant="copy"
                  size="sm"
                  onClick={() => copyToClipboard(getJsSnippet(campaign.tags.pin), "JS Snippet (PIN)")}
                  className="justify-start"
                >
                  <Copy className="w-3 h-3" />
                  JS Snippet
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CreateCampaignDialog = ({ onCampaignCreated }: { onCampaignCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Simulação de criação de campanha
    const ctaTag = generateTag(name, 'cta');
    const pinTag = generateTag(name, 'pin');
    
    toast({
      title: "Campanha criada!",
      description: `Tags geradas: ${ctaTag}, ${pinTag}`,
    });
    
    // Reset form
    setName("");
    setDescription("");
    setBudget("");
    setOpen(false);
    onCampaignCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="campaign" size="lg" className="w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          Nova Campanha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-primary bg-clip-text text-transparent">
            Criar Nova Campanha
          </DialogTitle>
          <DialogDescription>
            Crie uma nova campanha e gere automaticamente as tags de tracking.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Campanha *</Label>
            <Input
              id="name"
              placeholder="Ex: Black Friday 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição opcional da campanha"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Orçamento (R$)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="0.00"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="campaign" className="flex-1">
              Criar Campanha
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Campaigns = () => {
  const [campaigns] = useState(mockCampaigns);
  
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalClicks = campaigns.reduce((sum, c) => sum + c.metrics.cta_clicks + c.metrics.pin_clicks, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Painel de Campanhas
              </h1>
              <p className="text-white/80">
                Gerencie suas campanhas e acompanhe métricas de tracking
              </p>
            </div>
            <CreateCampaignDialog onCampaignCreated={() => window.location.reload()} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-card-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-campaign-primary/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-campaign-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-campaign-primary">{totalCampaigns}</div>
                  <div className="text-sm text-muted-foreground">Total de Campanhas</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card shadow-card-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-campaign-success/10 rounded-lg">
                  <ExternalLink className="w-6 h-6 text-campaign-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-campaign-success">{activeCampaigns}</div>
                  <div className="text-sm text-muted-foreground">Campanhas Ativas</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card shadow-card-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-campaign-secondary/10 rounded-lg">
                  <MousePointer className="w-6 h-6 text-campaign-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-campaign-secondary">{totalClicks}</div>
                  <div className="text-sm text-muted-foreground">Total de Clicks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Suas Campanhas</h2>
            <Badge variant="outline" className="px-3 py-1">
              {campaigns.length} campanha{campaigns.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {campaigns.length === 0 ? (
            <Card className="bg-gradient-card shadow-card-soft">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma campanha criada ainda</p>
                </div>
                <CreateCampaignDialog onCampaignCreated={() => window.location.reload()} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;