# Arquitetura do Sistema

## Visão Geral

O sistema segue uma arquitetura cliente-servidor moderna, utilizando React no frontend e Supabase como Backend as a Service (BaaS).

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                     (React + TypeScript)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Pages      │  │  Components  │  │   Contexts   │    │
│  │              │  │              │  │              │    │
│  │ - Agent      │  │ - UI         │  │ - Auth       │    │
│  │ - Officer    │  │ - Police     │  │              │    │
│  │ - Login      │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Services   │  │    Hooks     │  │    Types     │    │
│  │              │  │              │  │              │    │
│  │ - Auth       │  │ - useToast   │  │ - User       │    │
│  │ - Report     │  │ - useMobile  │  │ - Report     │    │
│  │ - Officer    │  │              │  │ - etc        │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         SUPABASE                            │
│                   (Backend as a Service)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │     Auth     │  │   Database   │  │   Storage    │    │
│  │              │  │              │  │              │    │
│  │ - JWT        │  │ - PostgreSQL │  │ - Images     │    │
│  │ - Sessions   │  │ - RLS        │  │ - Files      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ Edge Funcs   │  │  Realtime    │                       │
│  │              │  │              │                       │
│  │ - Seed DB    │  │ - Websocket  │                       │
│  │ - Create Ofc │  │              │                       │
│  └──────────────┘  └──────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Camadas da Aplicação

### 1. Camada de Apresentação (Pages)

**Responsabilidade**: Renderização das páginas e interação com o usuário

**Páginas Principais**:
- `/src/pages/Login.tsx` - Página de login
- `/src/pages/agent/AgentDashboard.tsx` - Dashboard do agente
- `/src/pages/agent/AgentReports.tsx` - Gerenciamento de laudos
- `/src/pages/agent/AgentOfficers.tsx` - Gerenciamento de policiais
- `/src/pages/officer/OfficerDashboard.tsx` - Dashboard do policial
- `/src/pages/officer/OfficerReportsReceived.tsx` - Laudos recebidos
- `/src/pages/SeedDatabase.tsx` - Seeding de dados (dev)
- `/src/pages/NotFound.tsx` - Página 404

### 2. Camada de Componentes

**Responsabilidade**: Componentes reutilizáveis de UI

**Estrutura**:
```
components/
├── ui/                    # Componentes Shadcn/UI
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
└── police/               # Componentes específicos
    ├── dashboard-layout.tsx
    ├── data-table.tsx
    ├── metric-card.tsx
    ├── search-filter.tsx
    ├── sidebar.tsx
    ├── status-badge.tsx
    ├── create-officer-dialog.tsx
    └── create-report-dialog.tsx
```

### 3. Camada de Contexto (Context API)

**Responsabilidade**: Gerenciamento de estado global

**Contextos**:

#### AuthContext (`/src/contexts/auth-context.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
```

**Funções**:
- Gerencia estado de autenticação
- Provê informações do usuário logado
- Controla login/logout
- Mantém sessão persistente

### 4. Camada de Serviços

**Responsabilidade**: Comunicação com o backend

**Serviços Principais**:

#### AuthService (`/src/lib/supabase.ts`)
- `login(credentials)` - Autenticação
- `logout()` - Encerrar sessão
- `getCurrentUser()` - Obter usuário atual

#### ReportService (`/src/lib/supabase.ts`)
- `getReports(userId?)` - Listar laudos
- `getReportById(id)` - Obter laudo específico
- `createReport(data, createdBy)` - Criar laudo
- `updateReport(id, updates, userId)` - Atualizar laudo
- `assignReport(reportId, officerId, agentId)` - Atribuir laudo
- `cancelReport(reportId, agentId, reason)` - Cancelar laudo

#### OfficerService (`/src/lib/supabase.ts`)
- `getOfficers()` - Listar policiais
- `createOfficer(data)` - Criar policial
- `updateOfficer(id, updates)` - Atualizar policial

#### DashboardService (`/src/lib/supabase.ts`)
- `getStats(userId?)` - Obter estatísticas

#### SeedService (`/src/services/seed-service.ts`)
- `seedDatabase()` - Popular banco com dados de teste
- `clearDatabase()` - Limpar dados de teste
- `listUsers()` - Listar usuários

### 5. Camada de Tipos

**Responsabilidade**: Definições TypeScript

**Arquivo**: `/src/types/index.ts`

**Tipos Principais**:
```typescript
// Enums
type ReportStatus = 'PENDING' | 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type UserRole = 'AGENT' | 'OFFICER';
type Department = 'TRAFFIC' | 'CRIMINAL' | 'ADMINISTRATIVE';

// Interfaces
interface User { ... }
interface Report { ... }
interface VehiclePart { ... }
interface Photo { ... }
interface AuditEntry { ... }
interface DashboardStats { ... }
```

## Fluxo de Dados

### Autenticação

```
1. Usuário insere credenciais
   ↓
2. Login.tsx chama AuthContext.login()
   ↓
3. AuthContext chama AuthService.login()
   ↓
4. AuthService faz chamada ao Supabase
   ↓
5. Supabase valida e retorna sessão + JWT
   ↓
6. AuthContext atualiza estado global
   ↓
7. React Router redireciona para dashboard
```

### Criação de Laudo

```
1. Agente clica em "Novo Laudo"
   ↓
2. CreateReportDialog abre formulário
   ↓
3. Agente preenche dados e submete
   ↓
4. AgentDashboard chama ReportService.createReport()
   ↓
5. ReportService faz chamada ao Supabase
   ↓
6. Supabase:
   - Gera número do laudo
   - Insere no banco
   - Cria entrada de auditoria
   ↓
7. Retorna laudo criado
   ↓
8. UI atualiza e mostra notificação
```

### Atribuição de Laudo

```
1. Agente seleciona laudo e policial
   ↓
2. AgentReports chama ReportService.assignReport()
   ↓
3. ReportService atualiza no Supabase:
   - assigned_to = officerId
   - status = 'RECEIVED'
   - assigned_at = timestamp
   ↓
4. Cria log de auditoria
   ↓
5. Policial vê laudo em seu dashboard
```

## Padrões de Design

### 1. Compound Components

Utilizado nos componentes de Card, Dialog, etc.

```typescript
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

### 2. Custom Hooks

Hooks customizados para lógica reutilizável:

```typescript
// useAuth - Hook de autenticação
const { user, login, logout, isAuthenticated } = useAuth();

// useToast - Hook de notificações
const { toast } = useToast();
```

### 3. Protected Routes

Componente de proteção de rotas:

```typescript
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;

  return children;
}
```

### 4. Service Layer Pattern

Abstração da comunicação com o backend:

```typescript
// Ao invés de:
const { data } = await supabase.from('reports').select();

// Usamos:
const reports = await ReportService.getReports();
```

## Segurança

### Row Level Security (RLS)

Supabase implementa RLS no banco de dados:
- Usuários só veem seus próprios dados
- Agentes têm acesso a todos os laudos
- Policiais só veem laudos atribuídos a eles

### JWT Authentication

- Tokens JWT armazenados no localStorage
- Renovação automática de tokens
- Expiração de sessão após inatividade

### Role-Based Access Control (RBAC)

- Rotas protegidas por role
- Componentes condicionalmente renderizados
- Validação de permissões no backend

## Performance

### Code Splitting

Vite automaticamente faz code splitting:
- Páginas carregadas sob demanda
- Componentes grandes separados
- Bibliotecas externas em chunks separados

### Lazy Loading

```typescript
// Exemplo de lazy loading de imagens
<img
  loading="lazy"
  src={photo.url}
  alt={photo.filename}
/>
```

### React Query (TanStack Query)

Gerenciamento de cache e estado do servidor:
- Cache automático de dados
- Refetch inteligente
- Otimistic updates

## Escalabilidade

### Supabase Edge Functions

Funções serverless para operações pesadas:
- `seed-database` - Popular banco de dados
- `create-officer` - Criar usuários

### Database Indexes

Índices no PostgreSQL para queries rápidas:
- Índice em `reports.number`
- Índice em `reports.status`
- Índice em `profiles.username`

### Paginação

Implementação de paginação em listas grandes:
- DataTable com paginação
- Lazy loading de resultados
- Filtros server-side

## Manutenibilidade

### TypeScript

- Type safety em toda aplicação
- Interfaces bem definidas
- Detecção de erros em compile-time

### Componentização

- Componentes pequenos e focados
- Reutilização de código
- Fácil manutenção

### Documentação

- Comentários em código crítico
- Documentação de tipos
- README e docs detalhadas

## Deploy

### Build Production

```bash
npm run build
```

Gera otimizado em `/dist`:
- Minificação de código
- Tree shaking
- Asset optimization

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Hospedagem Sugerida

- **Frontend**: Vercel, Netlify
- **Backend**: Supabase (já configurado)
- **CDN**: Cloudflare (opcional)
