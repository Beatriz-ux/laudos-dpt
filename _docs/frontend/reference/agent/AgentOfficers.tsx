import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, UserPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/police/dashboard-layout';
import { DataTable } from '@/components/police/data-table';
import { StatusBadge } from '@/components/police/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateOfficerDialog } from '@/components/police/create-officer-dialog';
import { OfficerService } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import type { User } from '@/types';

export default function AgentOfficers() {
  const { user, logout } = useAuth();
  const [officers, setOfficers] = useState<User[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOfficers();
  }, []);

  useEffect(() => {
    const filtered = officers.filter(officer =>
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOfficers(filtered);
  }, [officers, searchTerm]);

  const loadOfficers = async () => {
    try {
      setIsLoading(true);
      const data = await OfficerService.getOfficers();
      setOfficers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar policiais"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOfficer = async (data: any) => {
    try {
      const newOfficer = await OfficerService.createOfficer(data);
      setOfficers(prev => [...prev, newOfficer]);
      setIsCreateDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Policial cadastrado com sucesso"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao cadastrar policial"
      });
    }
  };

  const columns = [
    {
      key: 'badge',
      label: 'Matrícula',
      className: 'font-mono text-sm'
    },
    {
      key: 'name',
      label: 'Nome',
    },
    {
      key: 'email',
      label: 'Email',
      className: 'text-muted-foreground'
    },
    {
      key: 'department',
      label: 'Departamento',
      render: (officer: User) => (
        <StatusBadge status={officer.department === 'TRAFFIC' ? 'PENDING' : 'IN_PROGRESS'}>
          {officer.department === 'TRAFFIC' ? 'Trânsito' : 'Criminal'}
        </StatusBadge>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (officer: User) => (
        <StatusBadge status={officer.isActive ? 'COMPLETED' : 'CANCELLED'}>
          {officer.isActive ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      )
    },
    {
      key: 'createdAt',
      label: 'Cadastrado em',
      render: (officer: User) => 
        new Date(officer.createdAt).toLocaleDateString('pt-BR'),
      className: 'text-sm text-muted-foreground'
    }
  ];

  if (!user) return null;

  if (isLoading) {
    return (
      <DashboardLayout user={user} onLogout={logout}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
            <h1 className="text-2xl font-bold">Gerenciar Policiais</h1>
            <p className="text-muted-foreground">
              Cadastre e gerencie os policiais do sistema
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Policial
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Policiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{officers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Policiais Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {officers.filter(o => o.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Departamento Trânsito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">
                {officers.filter(o => o.department === 'TRAFFIC').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, matrícula, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredOfficers}
              columns={columns}
            />
          </CardContent>
        </Card>
      </div>

      <CreateOfficerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateOfficer}
      />
    </DashboardLayout>
  );
}