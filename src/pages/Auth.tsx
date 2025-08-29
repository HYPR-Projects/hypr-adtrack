import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, UserPlus, Target, BarChart3, MousePointer, MapPin } from 'lucide-react';

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  if (user) {
    window.location.href = '/';
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message || 'Erro ao fazer login');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password);
    
    if (error) {
      setError(error.message || 'Erro ao criar conta');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-neutral-50 to-neutral-100 flex-col justify-center p-12">
        <div className="max-w-md mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              HYPR Campaign Manager
            </h1>
            <p className="text-lg text-muted-foreground">
              Sistema completo de tracking para campanhas com métricas em tempo real
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Analytics Avançado</h3>
                <p className="text-xs text-muted-foreground">Métricas detalhadas em tempo real</p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <MousePointer className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Click Tracking</h3>
                <p className="text-xs text-muted-foreground">Monitore botões e interações</p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Map Pins</h3>
                <p className="text-xs text-muted-foreground">Rastreie cliques em localizações</p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">CTR Otimizado</h3>
                <p className="text-xs text-muted-foreground">Calcule e monitore performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="lg:hidden w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Bem-vindo ao HYPR
            </h2>
            <p className="text-sm text-muted-foreground">
              Acesse sua conta para gerenciar campanhas
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Fazer Login</CardTitle>
                  <CardDescription>
                    Entre com seu email @hypr.mobi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="seu-email@hypr.mobi"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Senha</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Digite sua senha"
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Conta</CardTitle>
                  <CardDescription>
                    Cadastre-se com seu email @hypr.mobi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="seu-email@hypr.mobi"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Digite sua senha (min. 6 caracteres)"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                      <Input
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirme sua senha"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Criando conta...' : 'Criar Conta'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Separator className="mb-4" />
            <p className="text-xs text-muted-foreground">
              Apenas colaboradores HYPR com email @hypr.mobi podem acessar o sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;