import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, MousePointer, Eye, Target, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  // Mock data simulando métricas atuais
  const todayEvents = 45;
  const totalCampaigns = 2;
  const activeCampaigns = 1;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-hero border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm mb-6">
              <Zap className="w-4 h-4" />
              Sistema de Tracking Avançado
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Painel de
              <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Campanhas
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Gere tags de eventos exclusivas, monitore cliques em CTAs e PINs, 
              e acompanhe o desempenho das suas campanhas em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/campaigns">
                <Button variant="campaign" size="xl" className="w-full sm:w-auto shadow-glow">
                  <Target className="w-5 h-5" />
                  Acessar Campanhas
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="campaign-outline" size="xl" className="w-full sm:w-auto">
                Ver Documentação
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Quick Stats */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Resumo de Hoje
            </h2>
            <p className="text-muted-foreground">Acompanhe o desempenho em tempo real</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-card shadow-card-soft hover:shadow-campaign transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-campaign-primary/10 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-campaign-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-campaign-primary">{totalCampaigns}</div>
                    <div className="text-sm text-muted-foreground">Total de Campanhas</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {activeCampaigns} ativa{activeCampaigns !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card shadow-card-soft hover:shadow-campaign transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-campaign-success/10 rounded-lg">
                    <MousePointer className="w-8 h-8 text-campaign-success" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-campaign-success">{todayEvents}</div>
                    <div className="text-sm text-muted-foreground">Eventos Hoje</div>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-campaign-success" />
                      <span className="text-xs text-campaign-success">+12% vs ontem</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card shadow-card-soft hover:shadow-campaign transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-campaign-secondary/10 rounded-lg">
                    <Eye className="w-8 h-8 text-campaign-secondary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-campaign-secondary">98.2%</div>
                    <div className="text-sm text-muted-foreground">Taxa de Entrega</div>
                    <Badge variant="outline" className="mt-1 text-xs bg-campaign-success/10 text-campaign-success border-campaign-success/30">
                      Excelente
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sistema completo de tracking para campanhas com geração automática de tags e métricas detalhadas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gradient-card shadow-card-soft">
              <CardHeader>
                <div className="w-12 h-12 bg-campaign-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-campaign-primary" />
                </div>
                <CardTitle className="text-xl">Criação de Campanhas</CardTitle>
                <CardDescription>
                  Crie campanhas e gere automaticamente tags exclusivas para CTA e PIN com apenas alguns cliques.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gradient-card shadow-card-soft">
              <CardHeader>
                <div className="w-12 h-12 bg-campaign-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-campaign-secondary" />
                </div>
                <CardTitle className="text-xl">Tracking em Tempo Real</CardTitle>
                <CardDescription>
                  Monitore cliques e eventos através de pixels e snippets JavaScript com métricas instantâneas.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gradient-card shadow-card-soft">
              <CardHeader>
                <div className="w-12 h-12 bg-campaign-success/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-campaign-success" />
                </div>
                <CardTitle className="text-xl">Analytics Avançado</CardTitle>
                <CardDescription>
                  Visualize métricas detalhadas, comparações temporais e relatórios de performance das campanhas.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gradient-card shadow-card-soft">
              <CardHeader>
                <div className="w-12 h-12 bg-campaign-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <MousePointer className="w-6 h-6 text-campaign-warning" />
                </div>
                <CardTitle className="text-xl">Integração Simples</CardTitle>
                <CardDescription>
                  Copie e cole URLs de pixel ou snippets JavaScript diretamente no seu sistema de mapas existente.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-hero border-none shadow-campaign">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Pronto para começar?
              </h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Configure suas primeiras campanhas de tracking e comece a monitorar seus resultados agora mesmo.
              </p>
              <Link to="/campaigns">
                <Button variant="campaign-outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary">
                  <Target className="w-5 h-5" />
                  Criar Primeira Campanha
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
