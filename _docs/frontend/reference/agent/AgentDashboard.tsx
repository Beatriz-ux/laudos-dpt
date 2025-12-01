import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/police/dashboard-layout';
import { StatusBadge, PriorityBadge, DaysCounter } from '@/components/police/status-badge';
import { CreateReportDialog } from '@/components/police/create-report-dialog';
import { useAuth } from '@/contexts/auth-context';
import { DashboardService, ReportService, OfficerService } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { DashboardStats, Report } from '@/types';

export default function AgentDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, reports] = await Promise.all([
        DashboardService.getStats(),
        ReportService.getReports()
      ]);
      
      setStats(dashboardStats);
      // Get 5 most recent reports
      setRecentReports(reports.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async (data: any) => {
    if (!user) return;
    
    try {
      await ReportService.createReport(data, user.id);
      setIsCreateReportOpen(false);
      toast({
        title: "Sucesso",
        description: "Laudo criado com sucesso"
      });
      // Reload stats to reflect new report
      loadDashboardData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao criar laudo"
      });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (!user) return null;

  if (isLoading) {
    return (
      <DashboardLayout user={user} onLogout={logout}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user.name} • Central de Controle
            </p>
          </div>
          <Button onClick={() => setIsCreateReportOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Laudo
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Laudos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="metric-value">{stats.totalReports}</div>
                <p className="text-xs text-muted-foreground">
                  Todos os laudos no sistema
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="metric-value text-warning">{stats.pendingReports}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando atribuição
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <AlertTriangle className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="metric-value text-info">{stats.inProgressReports}</div>
                <p className="text-xs text-muted-foreground">
                  Sendo processados
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="metric-value text-success">{stats.completedReports}</div>
                <p className="text-xs text-muted-foreground">
                  Finalizados este mês
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Laudos Recentes</CardTitle>
              <CardDescription>
                Últimos laudos criados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum laudo encontrado
                </p>
              ) : (
                recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {report.number}
                        </Badge>
                        <StatusBadge status={report.status} />
                        <PriorityBadge priority={report.priority} />
                      </div>
                      <p className="text-sm font-medium">{report.vehicle.plate}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.location.address}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <DaysCounter 
                        assignedAt={report.assignedAt} 
                        status={report.status} 
                      />
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {recentReports.length > 0 && (
                <div className="pt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/agent/reports">
                      Ver Todos os Laudos
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => setIsCreateReportOpen(true)} className="w-full justify-start" size="lg">
                <Plus className="h-5 w-5 mr-3" />
                Criar Novo Laudo
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link to="/agent/reports">
                  <FileText className="h-5 w-5 mr-3" />
                  Gerenciar Laudos
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link to="/agent/officers">
                  <Users className="h-5 w-5 mr-3" />
                  Gerenciar Policiais
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateReportDialog
        open={isCreateReportOpen}
        onOpenChange={setIsCreateReportOpen}
        onSubmit={handleCreateReport}
      />
    </DashboardLayout>
  );
}