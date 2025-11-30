# Documentação de Componentes

## Visão Geral

O sistema possui dois tipos principais de componentes:
1. **Componentes UI** (`/src/components/ui/`) - Componentes do Shadcn/UI
2. **Componentes Police** (`/src/components/police/`) - Componentes específicos do sistema

---

## Componentes Police

### DashboardLayout

**Arquivo**: `/src/components/police/dashboard-layout.tsx`

**Descrição**: Layout padrão para páginas autenticadas

**Props**:
```typescript
interface DashboardLayoutProps {
  user: User;
  onLogout: () => Promise<void>;
  children: React.ReactNode;
}
```

**Estrutura**:
```
┌─────────────────────────────────────┐
│            Sidebar                  │  ← Navegação lateral
├─────────────────────────────────────┤
│  Header com nome e logout           │  ← Topo
├─────────────────────────────────────┤
│                                     │
│          Main Content               │  ← children
│                                     │
└─────────────────────────────────────┘
```

**Uso**:
```typescript
<DashboardLayout user={user} onLogout={logout}>
  <div>Conteúdo da página</div>
</DashboardLayout>
```

---

### Sidebar

**Arquivo**: `/src/components/police/sidebar.tsx`

**Descrição**: Barra lateral de navegação

**Props**:
```typescript
interface SidebarProps {
  user: User;
  onLogout: () => void;
}
```

**Itens de Menu (AGENT)**:
- Dashboard (`/agent/dashboard`)
- Laudos (`/agent/reports`)
- Policiais (`/agent/officers`)

**Itens de Menu (OFFICER)**:
- Dashboard (`/officer/dashboard`)
- Laudos Recebidos (`/officer/reports/received`)

**Funcionalidades**:
- Destaque do item ativo
- Ícones Lucide
- Informações do usuário
- Botão de logout

---

### DataTable

**Arquivo**: `/src/components/police/data-table.tsx`

**Descrição**: Tabela de dados reutilizável

**Props**:
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}
```

**Funcionalidades**:
- Renderização customizada por coluna
- Click em linha
- Classes CSS customizadas
- Responsive

**Uso**:
```typescript
const columns = [
  {
    key: 'number',
    label: 'Número',
    render: (report) => <Badge>{report.number}</Badge>
  },
  {
    key: 'status',
    label: 'Status',
    render: (report) => <StatusBadge status={report.status} />
  }
];

<DataTable
  data={reports}
  columns={columns}
  onRowClick={(report) => navigate(`/reports/${report.id}`)}
/>
```

---

### MetricCard

**Arquivo**: `/src/components/police/metric-card.tsx`

**Descrição**: Card para exibir métricas

**Props**:
```typescript
interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}
```

**Uso**:
```typescript
<MetricCard
  title="Total de Laudos"
  value={stats.totalReports}
  description="Todos os laudos no sistema"
  icon={<FileText className="h-4 w-4" />}
/>
```

---

### StatusBadge

**Arquivo**: `/src/components/police/status-badge.tsx`

**Descrição**: Badge para exibir status do laudo

**Props**:
```typescript
interface StatusBadgeProps {
  status: ReportStatus;
}
```

**Variantes por Status**:
- **PENDING**: Amarelo (warning)
- **RECEIVED**: Azul (info)
- **IN_PROGRESS**: Azul (info)
- **COMPLETED**: Verde (success)
- **CANCELLED**: Vermelho (destructive)

**Textos**:
- PENDING → "Pendente"
- RECEIVED → "Recebido"
- IN_PROGRESS → "Em Andamento"
- COMPLETED → "Concluído"
- CANCELLED → "Cancelado"

**Uso**:
```typescript
<StatusBadge status="PENDING" />
```

---

### PriorityBadge

**Arquivo**: `/src/components/police/status-badge.tsx`

**Descrição**: Badge para exibir prioridade do laudo

**Props**:
```typescript
interface PriorityBadgeProps {
  priority: Priority;
}
```

**Variantes por Prioridade**:
- **HIGH**: Vermelho (destructive)
- **MEDIUM**: Amarelo (warning)
- **LOW**: Cinza (outline)

**Textos**:
- HIGH → "Alta"
- MEDIUM → "Média"
- LOW → "Baixa"

**Uso**:
```typescript
<PriorityBadge priority="HIGH" />
```

---

### DaysCounter

**Arquivo**: `/src/components/police/status-badge.tsx`

**Descrição**: Contador de dias desde atribuição

**Props**:
```typescript
interface DaysCounterProps {
  assignedAt?: string;
  status: ReportStatus;
}
```

**Lógica**:
- Se não atribuído: mostra "-"
- Se atribuído: calcula dias
- Cores:
  - 0-1 dias: Verde
  - 2-3 dias: Amarelo
  - 4+ dias: Vermelho

**Formato**: "X dia(s)"

**Uso**:
```typescript
<DaysCounter
  assignedAt={report.assignedAt}
  status={report.status}
/>
```

---

### SearchFilter

**Arquivo**: `/src/components/police/search-filter.tsx`

**Descrição**: Componente de busca e filtros

**Props**:
```typescript
interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  defaultSearch?: string;
  defaultFilters?: FilterOptions;
}

interface FilterOptions {
  status?: ReportStatus;
  priority?: Priority;
  startDate?: string;
  endDate?: string;
}
```

**Funcionalidades**:
- Campo de busca com ícone
- Filtros por status
- Filtros por prioridade
- Filtros por data (início/fim)
- Limpar filtros

**Uso**:
```typescript
<SearchFilter
  onSearch={setSearchQuery}
  onFilter={setFilters}
  defaultSearch={searchQuery}
  defaultFilters={filters}
/>
```

---

### CreateReportDialog

**Arquivo**: `/src/components/police/create-report-dialog.tsx`

**Descrição**: Dialog para criar novo laudo

**Props**:
```typescript
interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateReportRequest) => Promise<void>;
}
```

**Campos do Formulário**:
```typescript
interface FormData {
  priority: Priority;
  location: {
    address: string;
    city: string;
    state: string;
  };
  vehicle: {
    plate: string;
    isCloned?: boolean;
  };
  assignedTo?: string;  // Opcional
}
```

**Validações**:
- Todos os campos obrigatórios
- Placa no formato brasileiro
- Cidade e estado válidos

**Uso**:
```typescript
<CreateReportDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onSubmit={handleCreateReport}
/>
```

---

### CreateOfficerDialog

**Arquivo**: `/src/components/police/create-officer-dialog.tsx`

**Descrição**: Dialog para criar novo policial

**Props**:
```typescript
interface CreateOfficerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OfficerData) => Promise<void>;
}
```

**Campos do Formulário**:
```typescript
interface OfficerData {
  username: string;
  email: string;
  name: string;
  department: Department;
  badge: string;
  role: 'OFFICER';
  isActive: boolean;
  mustChangePassword: boolean;
}
```

**Validações**:
- Username único
- Email válido
- Matrícula única
- Departamento válido

**Uso**:
```typescript
<CreateOfficerDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onSubmit={handleCreateOfficer}
/>
```

---

## Componentes UI (Shadcn)

Todos os componentes UI estão em `/src/components/ui/` e são baseados no Shadcn/UI.

### Button

**Arquivo**: `/src/components/ui/button.tsx`

**Variantes**:
- `default` - Botão primário
- `destructive` - Ações destrutivas
- `outline` - Botão com borda
- `secondary` - Botão secundário
- `ghost` - Botão transparente
- `link` - Estilo de link

**Tamanhos**:
- `default` - Tamanho padrão
- `sm` - Pequeno
- `lg` - Grande
- `icon` - Apenas ícone

**Uso**:
```typescript
<Button variant="default" size="lg">
  Clique aqui
</Button>

<Button variant="destructive" size="sm">
  <Trash className="h-4 w-4 mr-2" />
  Deletar
</Button>
```

---

### Card

**Arquivo**: `/src/components/ui/card.tsx`

**Componentes**:
- `Card` - Container principal
- `CardHeader` - Cabeçalho
- `CardTitle` - Título
- `CardDescription` - Descrição
- `CardContent` - Conteúdo
- `CardFooter` - Rodapé

**Uso**:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição do card</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo aqui
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

---

### Dialog

**Arquivo**: `/src/components/ui/dialog.tsx`

**Componentes**:
- `Dialog` - Container
- `DialogTrigger` - Botão trigger
- `DialogContent` - Conteúdo
- `DialogHeader` - Cabeçalho
- `DialogTitle` - Título
- `DialogDescription` - Descrição
- `DialogFooter` - Rodapé
- `DialogClose` - Botão fechar

**Uso**:
```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descrição</DialogDescription>
    </DialogHeader>

    <div>Conteúdo do dialog</div>

    <DialogFooter>
      <Button onClick={handleSubmit}>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Input

**Arquivo**: `/src/components/ui/input.tsx`

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Todas as props nativas de input
}
```

**Uso**:
```typescript
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="seu@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

---

### Badge

**Arquivo**: `/src/components/ui/badge.tsx`

**Variantes**:
- `default` - Badge padrão
- `secondary` - Badge secundário
- `destructive` - Badge destrutivo
- `outline` - Badge com borda
- `success` - Badge de sucesso
- `warning` - Badge de aviso
- `info` - Badge informativo

**Uso**:
```typescript
<Badge variant="success">Ativo</Badge>
<Badge variant="destructive">Cancelado</Badge>
<Badge variant="outline">Pendente</Badge>
```

---

### Table

**Arquivo**: `/src/components/ui/table.tsx`

**Componentes**:
- `Table` - Container
- `TableHeader` - Cabeçalho
- `TableBody` - Corpo
- `TableFooter` - Rodapé
- `TableRow` - Linha
- `TableHead` - Célula do cabeçalho
- `TableCell` - Célula do corpo
- `TableCaption` - Legenda

**Uso**:
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map(user => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### Select

**Arquivo**: `/src/components/ui/select.tsx`

**Componentes**:
- `Select` - Container
- `SelectTrigger` - Botão trigger
- `SelectValue` - Valor selecionado
- `SelectContent` - Dropdown
- `SelectItem` - Item do dropdown
- `SelectGroup` - Grupo de itens
- `SelectLabel` - Label do grupo

**Uso**:
```typescript
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione o status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="PENDING">Pendente</SelectItem>
    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
    <SelectItem value="COMPLETED">Concluído</SelectItem>
  </SelectContent>
</Select>
```

---

### Alert

**Arquivo**: `/src/components/ui/alert.tsx`

**Componentes**:
- `Alert` - Container
- `AlertTitle` - Título
- `AlertDescription` - Descrição

**Variantes**:
- `default` - Alert padrão
- `destructive` - Alert de erro

**Uso**:
```typescript
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Erro</AlertTitle>
  <AlertDescription>
    Ocorreu um erro ao processar sua solicitação.
  </AlertDescription>
</Alert>
```

---

### Toast / Sonner

**Arquivo**: `/src/components/ui/toaster.tsx`, `/src/components/ui/sonner.tsx`

**Hook**: `useToast`

**Uso**:
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Toast de sucesso
toast({
  title: "Sucesso!",
  description: "Operação realizada com sucesso.",
});

// Toast de erro
toast({
  variant: "destructive",
  title: "Erro!",
  description: "Ocorreu um erro.",
});
```

---

### DropdownMenu

**Arquivo**: `/src/components/ui/dropdown-menu.tsx`

**Componentes**:
- `DropdownMenu` - Container
- `DropdownMenuTrigger` - Botão trigger
- `DropdownMenuContent` - Menu
- `DropdownMenuItem` - Item do menu
- `DropdownMenuSeparator` - Separador
- `DropdownMenuLabel` - Label
- `DropdownMenuGroup` - Grupo

**Uso**:
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleEdit}>
      <Edit className="h-4 w-4 mr-2" />
      Editar
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleDelete}>
      <Trash className="h-4 w-4 mr-2" />
      Deletar
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Padrões de Uso

### Formulários

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input {...form.register('name')} />
        {form.formState.errors.name && (
          <span className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </span>
        )}
      </div>

      <Button type="submit">Enviar</Button>
    </form>
  );
}
```

---

### Loading States

```typescript
function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <div>Conteúdo</div>;
}
```

---

### Empty States

```typescript
function MyList({ items }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Nenhum item encontrado
        </h3>
        <p className="text-muted-foreground">
          Adicione seu primeiro item para começar
        </p>
      </div>
    );
  }

  return <DataTable data={items} columns={columns} />;
}
```
