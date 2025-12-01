import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, UserCheck, X, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/components/police/dashboard-layout';
import { DataTable } from '@/components/police/data-table';
import { StatusBadge, PriorityBadge, DaysCounter } from '@/components/police/status-badge';
import { SearchFilter, type FilterOptions } from '@/components/police/search-filter';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ReportService, OfficerService } from '@/lib/supabase';
import type { Report, User } from '@/types';

export default function AgentReports() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reportsData, officersData] = await Promise.all([
          ReportService.getReports(),
          OfficerService.getOfficers()
        ]);
        
        setReports(reportsData);
        setFilteredReports(reportsData);
        setOfficers(officersData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

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

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(report => report.status === filters.status);
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

  const handleAssignOfficer = async (reportId: string, officerId: string) => {
    if (!user) return;
    
    try {
      await ReportService.assignReport(reportId, officerId, user.id);
      
      // Reload reports
      const updatedReports = await ReportService.getReports();
      setReports(updatedReports);
      
      toast({
        title: "Sucesso",
        description: "Policial atribuído com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atribuir policial",
        variant: "destructive",
      });
    }
  };

  const handleCancelReport = async (reportId: string, reason: string) => {
    if (!user) return;
    
    try {
      await ReportService.cancelReport(reportId, user.id, reason);
      
      // Reload reports
      const updatedReports = await ReportService.getReports();
      setReports(updatedReports);
      
      toast({
        title: "Sucesso",
        description: "Laudo cancelado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cancelar laudo",
        variant: "destructive",
      });
    }
  };

  const getOfficerName = (officerId?: string) => {
    if (!officerId) return '-';
    const officer = officers.find(o => o.id === officerId);
    return officer ? officer.name : 'Policial não encontrado';
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
      key: 'status',
      label: 'Status',
      render: (report: Report) => <StatusBadge status={report.status} />,
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
      key: 'assignedTo',
      label: 'Policial',
      render: (report: Report) => (
        <span className="text-sm">{getOfficerName(report.assignedTo)}</span>
      ),
    },
    {
      key: 'assignedAt',
      label: 'Prazo',
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/agent/reports/${report.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Link>
            </DropdownMenuItem>
            
            {(report.status === 'PENDING' || report.status === 'RECEIVED') && (
              <DropdownMenuItem 
                onClick={() => {
                  // TODO: Open assign officer dialog
                  console.log('Assign officer to', report.id);
                }}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Atribuir Policial
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {report.status !== 'COMPLETED' && report.status !== 'CANCELLED' && (
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => {
                  // TODO: Open cancel dialog
                  handleCancelReport(report.id, 'Cancelado pelo agente');
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar Laudo
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (!user) return null;

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Laudos</h1>
            <p className="text-muted-foreground">
              Gerenciar todos os laudos do sistema
            </p>
          </div>
          <Button asChild>
            <Link to="/agent/reports/create">
              <Plus className="h-4 w-4 mr-2" />
              Novo Laudo
            </Link>
          </Button>
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
              Laudos ({filteredReports.length})
            </CardTitle>
            <CardDescription>
              Lista de todos os laudos com status e informações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <DataTable
                data={filteredReports}
                columns={columns}
                onRowClick={(report) => {
                  // Navigate to report details
                  window.location.href = `/agent/reports/${report.id}`;
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}