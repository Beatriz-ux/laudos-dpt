import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, FileEdit, CheckCircle, Clock, AlertTriangle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/police/dashboard-layout';
import { StatusBadge, PriorityBadge, DaysCounter } from '@/components/police/status-badge';
import { useAuth } from '@/contexts/auth-context';
import { DashboardService, ReportService } from '@/lib/supabase';
import type { DashboardStats, Report } from '@/types';

export default function OfficerDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        const [dashboardStats, reports] = await Promise.all([
          DashboardService.getStats(user.id),
          ReportService.getReports(user.id)
        ]);
        
        setStats(dashboardStats);
        // Get 5 most recent reports
        setMyReports(reports.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

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

  const receivedReports = myReports.filter(r => r.status === 'RECEIVED');
  const draftReports = myReports.filter(r => r.status === 'IN_PROGRESS');
  const completedReports = myReports.filter(r => r.status === 'COMPLETED');

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Laudos</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user.name} • {user.badge}
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recebidos</CardTitle>
                <Inbox className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="metric-value text-info">{receivedReports.length}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando início
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
                <FileEdit className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="metric-value text-warning">{draftReports.length}</div>
                <p className="text-xs text-muted-foreground">
                  Em andamento
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="metric-value text-success">{completedReports.length}</div>
                <p className="text-xs text-muted-foreground">
                  Finalizados
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="metric-value">{stats.myReports || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Meus laudos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Received Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Inbox className="h-5 w-5 text-info" />
                <span>Recebidos</span>
                {receivedReports.length > 0 && (
                  <Badge variant="info">{receivedReports.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Laudos prontos para iniciar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {receivedReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  Nenhum laudo recebido
                </p>
              ) : (
                receivedReports.slice(0, 3).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {report.number}
                        </Badge>
                        <PriorityBadge priority={report.priority} />
                      </div>
                      <p className="text-sm font-medium">{report.vehicle.plate}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <DaysCounter 
                        assignedAt={report.assignedAt} 
                        status={report.status} 
                      />
                      <Button size="sm" asChild>
                        <Link to={`/officer/reports/${report.id}`}>
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Iniciar
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {receivedReports.length > 3 && (
                <Button variant="outline" asChild className="w-full">
                  <Link to="/officer/reports/received">
                    Ver Todos ({receivedReports.length})
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Draft Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileEdit className="h-5 w-5 text-warning" />
                <span>Rascunhos</span>
                {draftReports.length > 0 && (
                  <Badge variant="warning">{draftReports.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Laudos em andamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {draftReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  Nenhum rascunho
                </p>
              ) : (
                draftReports.slice(0, 3).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {report.number}
                        </Badge>
                        <PriorityBadge priority={report.priority} />
                      </div>
                      <p className="text-sm font-medium">{report.vehicle.plate}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <DaysCounter 
                        assignedAt={report.assignedAt} 
                        status={report.status} 
                      />
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/officer/reports/${report.id}`}>
                          Continuar
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {draftReports.length > 3 && (
                <Button variant="outline" asChild className="w-full">
                  <Link to="/officer/reports/draft">
                    Ver Todos ({draftReports.length})
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Completed Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Concluídos</span>
                {completedReports.length > 0 && (
                  <Badge variant="success">{completedReports.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Laudos finalizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  Nenhum laudo concluído
                </p>
              ) : (
                completedReports.slice(0, 3).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {report.number}
                        </Badge>
                        <PriorityBadge priority={report.priority} />
                      </div>
                      <p className="text-sm font-medium">{report.vehicle.plate}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {report.completedAt && new Date(report.completedAt).toLocaleDateString('pt-BR')}
                      </p>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/officer/reports/${report.id}`}>
                          Ver
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {completedReports.length > 3 && (
                <Button variant="outline" asChild className="w-full">
                  <Link to="/officer/reports/completed">
                    Ver Todos ({completedReports.length})
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}