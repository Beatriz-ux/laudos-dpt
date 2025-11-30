# Documentação de Rotas

## Visão Geral

O sistema utiliza React Router DOM v6.30.1 para gerenciamento de rotas. Todas as rotas são definidas no arquivo `/src/App.tsx`.

## Estrutura de Rotas

```typescript
<Routes>
  {/* Públicas */}
  <Route path="/login" element={<Login />} />
  <Route path="/seed-database" element={<SeedDatabase />} />

  {/* Redirecionamentos */}
  <Route path="/" element={<Navigate to="/dashboard" />} />
  <Route path="/dashboard" element={<DashboardRoute />} />

  {/* Rotas do Agente */}
  <Route path="/agent/dashboard" element={<ProtectedRoute />} />
  <Route path="/agent/reports" element={<ProtectedRoute />} />
  <Route path="/agent/officers" element={<ProtectedRoute />} />

  {/* Rotas do Policial */}
  <Route path="/officer/dashboard" element={<ProtectedRoute />} />
  <Route path="/officer/reports/received" element={<ProtectedRoute />} />

  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Rotas Públicas

### `/login`
**Componente**: `Login.tsx`

**Descrição**: Página de login do sistema

**Acesso**: Público (não autenticado)

**Funcionalidades**:
- Login com username/email e senha
- Troca de senha no primeiro acesso
- Validação de credenciais
- Redirecionamento após login bem-sucedido

**Props**: Nenhuma

**Estado**:
```typescript
{
  username: string;
  password: string;
  newPassword: string;
  showPassword: boolean;
  showNewPassword: boolean;
  mustChangePassword: boolean;
  isSubmitting: boolean;
  error: string;
}
```

**Fluxo**:
1. Usuário insere credenciais
2. Sistema valida
3. Se primeira vez, solicita nova senha
4. Após login, redireciona para `/dashboard`

---

### `/seed-database`
**Componente**: `SeedDatabase.tsx`

**Descrição**: Página para popular o banco com dados de teste

**Acesso**: Público (protegido por senha: `admin@seed2024`)

**Funcionalidades**:
- Popular banco de dados
- Limpar banco de dados
- Visualizar resultado da operação
- Listar usuários criados

**Ações Disponíveis**:
- **Popular Banco**: Cria 3 agentes e 5 policiais
- **Limpar Banco**: Remove todos os usuários de teste

**Usuários Criados**:
```
Agentes:
- agent.traffic (Trânsito)
- agent.criminal (Criminal)
- agent.admin (Administrativo)

Policiais:
- officer.traffic1
- officer.traffic2
- officer.criminal1
- officer.criminal2
- officer.admin
```

**Senha Padrão**: `senha123` (deve ser alterada no primeiro acesso)

---

## Rotas Protegidas

### Proteção de Rotas

Componente `ProtectedRoute`:
```typescript
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;

  return children;
}
```

### Redirecionamento Dinâmico

Componente `DashboardRoute`:
```typescript
function DashboardRoute() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.role === 'AGENT') {
    return <Navigate to="/agent/dashboard" />;
  } else {
    return <Navigate to="/officer/dashboard" />;
  }
}
```

---

## Rotas do Agente (AGENT)

### `/agent/dashboard`
**Componente**: `AgentDashboard.tsx`

**Descrição**: Dashboard principal do agente

**Acesso**: Apenas AGENT

**Funcionalidades**:
- Visualizar estatísticas gerais
- Ver laudos recentes
- Criar novo laudo
- Ações rápidas

**Dados Exibidos**:
```typescript
interface DashboardStats {
  totalReports: number;       // Total de laudos
  pendingReports: number;     // Aguardando atribuição
  inProgressReports: number;  // Em andamento
  completedReports: number;   // Concluídos
  overdueReports: number;     // Atrasados
}
```

**Cards de Estatísticas**:
1. Total de Laudos
2. Pendentes
3. Em Andamento
4. Concluídos

**Seção de Laudos Recentes**:
- 5 laudos mais recentes
- Informações: número, status, prioridade, placa, local, prazo
- Botão "Ver Todos os Laudos"

**Ações Rápidas**:
- Criar Novo Laudo
- Gerenciar Laudos
- Gerenciar Policiais

---

### `/agent/reports`
**Componente**: `AgentReports.tsx`

**Descrição**: Gerenciamento de todos os laudos

**Acesso**: Apenas AGENT

**Funcionalidades**:
- Listar todos os laudos
- Buscar laudos
- Filtrar por status, prioridade, data
- Visualizar detalhes
- Atribuir policial
- Cancelar laudo
- Exportar PDF

**Filtros Disponíveis**:
```typescript
interface FilterOptions {
  status?: ReportStatus;
  priority?: Priority;
  startDate?: string;
  endDate?: string;
}
```

**Busca**:
- Por número do laudo
- Por placa do veículo
- Por chassi
- Por endereço

**Colunas da Tabela**:
1. Número
2. Status
3. Prioridade
4. Placa
5. Local
6. Policial
7. Prazo
8. Criado em
9. Ações

**Ações por Laudo**:
- Ver Detalhes
- Atribuir Policial (se PENDING ou RECEIVED)
- Exportar PDF
- Cancelar Laudo (se não COMPLETED ou CANCELLED)

---

### `/agent/officers`
**Componente**: `AgentOfficers.tsx`

**Descrição**: Gerenciamento de policiais

**Acesso**: Apenas AGENT

**Funcionalidades**:
- Listar todos os policiais
- Buscar policiais
- Criar novo policial
- Editar policial
- Visualizar estatísticas

**Estatísticas**:
- Total de Policiais
- Policiais Ativos
- Departamento Trânsito

**Busca**:
- Por nome
- Por matrícula
- Por email
- Por departamento

**Colunas da Tabela**:
1. Matrícula
2. Nome
3. Email
4. Departamento
5. Status
6. Cadastrado em

**Formulário de Criação**:
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

---

## Rotas do Policial (OFFICER)

### `/officer/dashboard`
**Componente**: `OfficerDashboard.tsx`

**Descrição**: Dashboard do policial

**Acesso**: Apenas OFFICER

**Funcionalidades**:
- Visualizar laudos atribuídos
- Ver estatísticas pessoais
- Iniciar laudos
- Continuar rascunhos

**Dados Exibidos**:
```typescript
interface OfficerStats {
  receivedReports: number;    // Recebidos
  draftReports: number;       // Rascunhos
  completedReports: number;   // Concluídos
  totalReports: number;       // Total
}
```

**Cards de Estatísticas**:
1. Recebidos - Aguardando início
2. Rascunhos - Em andamento
3. Concluídos - Finalizados
4. Total - Meus laudos

**Seções de Laudos**:

**1. Recebidos**:
- Laudos prontos para iniciar
- Status: RECEIVED
- Ação: Iniciar laudo

**2. Rascunhos**:
- Laudos em andamento
- Status: IN_PROGRESS
- Ação: Continuar laudo

**3. Concluídos**:
- Laudos finalizados
- Status: COMPLETED
- Ação: Ver laudo

---

### `/officer/reports/received`
**Componente**: `OfficerReportsReceived.tsx`

**Descrição**: Lista de laudos recebidos

**Acesso**: Apenas OFFICER

**Funcionalidades**:
- Visualizar laudos recebidos
- Buscar laudos
- Filtrar por prioridade e data
- Iniciar laudo
- Ver detalhes

**Filtros**:
- Prioridade
- Data de início
- Data de fim

**Busca**:
- Por número
- Por placa
- Por chassi
- Por endereço

**Colunas da Tabela**:
1. Número
2. Prioridade
3. Placa
4. Local
5. Recebido há
6. Criado em
7. Ações

**Ações**:
- **Iniciar**: Muda status para IN_PROGRESS e abre formulário
- **Ver**: Visualiza detalhes do laudo

**Badge de Contagem**: Mostra quantidade de laudos recebidos

---

## Rota de Erro

### `*` (404)
**Componente**: `NotFound.tsx`

**Descrição**: Página de erro 404

**Acesso**: Público

**Funcionalidades**:
- Exibe mensagem de página não encontrada
- Botão para voltar ao dashboard
- Log de erro no console

---

## Navegação Programática

### Usando navigate

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navegar para rota
navigate('/agent/dashboard');

// Voltar
navigate(-1);

// Substituir histórico
navigate('/login', { replace: true });
```

### Usando Link

```typescript
import { Link } from 'react-router-dom';

<Link to="/agent/reports">Ver Laudos</Link>
```

### Redirecionamento

```typescript
import { Navigate } from 'react-router-dom';

<Navigate to="/login" replace />
```

---

## Parâmetros de Rota

### URL Params

```typescript
// Definição
<Route path="/reports/:id" element={<ReportDetail />} />

// Uso no componente
import { useParams } from 'react-router-dom';

const { id } = useParams();
```

### Query Params

```typescript
// URL: /reports?status=PENDING&priority=HIGH

import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const status = searchParams.get('status');
const priority = searchParams.get('priority');
```

---

## Estado de Localização

```typescript
import { useLocation } from 'react-router-dom';

const location = useLocation();

// location.pathname - caminho atual
// location.search - query string
// location.state - estado passado na navegação
```

---

## Guards de Rota

### Verificação de Autenticação

```typescript
if (!user) {
  return <Navigate to="/login" replace />;
}
```

### Verificação de Role

```typescript
if (!allowedRoles.includes(user.role)) {
  return <Navigate to="/dashboard" replace />;
}
```

### Loading State

```typescript
if (isLoading) {
  return <LoadingSpinner />;
}
```

---

## Layout Padrão

### DashboardLayout

Todas as rotas protegidas usam o `DashboardLayout`:

```typescript
<DashboardLayout user={user} onLogout={logout}>
  {/* Conteúdo da página */}
</DashboardLayout>
```

**Componentes do Layout**:
- Sidebar com navegação
- Header com nome do usuário
- Botão de logout
- Área de conteúdo principal

---

## Rotas Futuras (Não Implementadas)

Rotas referenciadas mas não implementadas:

1. `/agent/reports/create` - Criar laudo (form completo)
2. `/agent/reports/:id` - Detalhes do laudo
3. `/officer/reports/:id` - Formulário de preenchimento
4. `/officer/reports/draft` - Lista de rascunhos
5. `/officer/reports/completed` - Lista de concluídos

---

## Breadcrumbs

O sistema não implementa breadcrumbs nativamente, mas pode ser adicionado:

```typescript
import { useLocation } from 'react-router-dom';

function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  return (
    <nav>
      {paths.map((path, index) => (
        <Link key={index} to={`/${paths.slice(0, index + 1).join('/')}`}>
          {path}
        </Link>
      ))}
    </nav>
  );
}
```

---

## Rotas com State

Passando estado entre rotas:

```typescript
// Navegação
navigate('/reports/123', { state: { from: 'dashboard' } });

// Recebendo
const location = useLocation();
const from = location.state?.from;
```

---

## Configuração do Router

```typescript
// src/App.tsx
<BrowserRouter>
  <Routes>
    {/* Rotas aqui */}
  </Routes>
</BrowserRouter>
```

**Tipo de Router**: BrowserRouter (usa History API)

**Base URL**: Raiz do domínio

**Modo**: HTML5 History Mode
