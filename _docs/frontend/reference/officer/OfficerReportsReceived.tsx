import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/police/dashboard-layout';
import { DataTable } from '@/components/police/data-table';
import { StatusBadge, PriorityBadge, DaysCounter } from '@/components/police/status-badge';
import { SearchFilter, type FilterOptions } from '@/components/police/search-filter';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ReportService } from '@/lib/supabase';
import type { Report } from '@/types';

export default function OfficerReportsReceived() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    const loadReports = async () => {
      if (!user) return;
      
      try {
        const reportsData = await ReportService.getReports(user.id);
        const receivedReports = reportsData.filter(r => r.status === 'RECEIVED');
        
        setReports(receivedReports);
        setFilteredReports(receivedReports);
      } catch (error) {
        console.error('Error loading reports:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar laudos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [user, toast]);

  // Filter reports based on search and filters
  useEffect(() => {
    let filtered = [...reports];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report =>
        report.number.toLowerCase().includes(query) ||
        report.vehicle.plate.toLowerCase().includes(query) ||
        report.vehicle.chassis?.toLowerCase().includes(query) ||
        report.location.address.toLowerCase().includes(query)
      );
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(report => report.priority === filters.priority);
    }

    // Apply date filters
    if (filters.startDate) {
      filtered = filtered.filter(report => 
        new Date(report.createdAt) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(report => 
        new Date(report.createdAt) <= new Date(filters.endDate!)
      );
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, filters]);

  const handleStartReport = async (reportId: string) => {
    if (!user) return;
    
    try {
      await ReportService.updateReport(reportId, { 
        status: 'IN_PROGRESS' 
      }, user.id);
      
      // Navigate to report form
      window.location.href = `/officer/reports/${reportId}`;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar laudo",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: 'number',
      label: 'Número',
      render: (report: Report) => (
        <Badge variant="outline" className="font-mono text-xs">
          {report.number}
        </Badge>
      ),
    },
    {
      key: 'priority',
      label: 'Prioridade',
      render: (report: Report) => <PriorityBadge priority={report.priority} />,
    },
    {
      key: 'vehicle.plate',
      label: 'Placa',
      render: (report: Report) => (
        <span className="font-mono font-medium">{report.vehicle.plate}</span>
      ),
    },
    {
      key: 'location.address',
      label: 'Local',
      render: (report: Report) => (
        <span className="text-sm">{report.location.address}</span>
      ),
    },
    {
      key: 'assignedAt',
      label: 'Recebido há',
      render: (report: Report) => (
        <DaysCounter assignedAt={report.assignedAt} status={report.status} />
      ),
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      render: (report: Report) => (
        <span className="text-sm text-muted-foreground">
          {new Date(report.createdAt).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (report: Report) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => handleStartReport(report.id)}
          >
            <PlayCircle className="h-3 w-3 mr-1" />
            Iniciar
          </Button>
          <Button
            size="sm"
            variant="outline"
            asChild
          >
            <Link to={`/officer/reports/${report.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  if (!user) return null;

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-info" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Laudos Recebidos</h1>
              <p className="text-muted-foreground">
                Laudos atribuídos prontos para iniciar
              </p>
            </div>
          </div>
          <Badge variant="info" className="text-lg px-3 py-1">
            {filteredReports.length} recebidos
          </Badge>
        </div>

        {/* Search and Filters */}
        <SearchFilter
          onSearch={setSearchQuery}
          onFilter={setFilters}
          defaultSearch={searchQuery}
          defaultFilters={filters}
        />

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Laudos Recebidos ({filteredReports.length})
            </CardTitle>
            <CardDescription>
              Clique em "Iniciar" para começar a preencher o laudo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum laudo recebido
                </h3>
                <p className="text-muted-foreground">
                  Você não possui laudos recebidos no momento
                </p>
              </div>
            ) : (
              <DataTable
                data={filteredReports}
                columns={columns}
                onRowClick={(report) => {
                  // Navigate to report details
                  window.location.href = `/officer/reports/${report.id}`;
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}