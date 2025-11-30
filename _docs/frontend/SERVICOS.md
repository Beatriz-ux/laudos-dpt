# Documentação de Serviços

## Visão Geral

O sistema possui uma camada de serviços que abstrai a comunicação com o Supabase. Todos os serviços estão localizados em `/src/lib/supabase.ts` e `/src/services/`.

---

## AuthService

**Arquivo**: `/src/lib/supabase.ts`

**Descrição**: Serviço de autenticação

### login()

**Assinatura**:
```typescript
async login(credentials: LoginCredentials): Promise<AuthUser>
```

**Parâmetros**:
```typescript
interface LoginCredentials {
  username: string;      // Username ou email
  password: string;      // Senha
  newPassword?: string;  // Nova senha (primeiro acesso)
}
```

**Retorno**:
```typescript
interface AuthUser {
  user: User;
  token: string;
}
```

**Fluxo**:
1. Autentica com Supabase Auth
2. Se primeiro acesso e tem newPassword:
   - Atualiza senha
   - Define must_change_password = false
3. Busca perfil do usuário
4. Valida se deve trocar senha
5. Atualiza last_login
6. Retorna usuário e token

**Erros**:
- `'MUST_CHANGE_PASSWORD'` - Usuário deve trocar senha
- `'Invalid credentials'` - Credenciais inválidas
- `'User not active'` - Usuário desativado

**Exemplo**:
```typescript
try {
  const { user, token } = await AuthService.login({
    username: 'agent.traffic',
    password: 'senha123',
  });
  console.log('Logado:', user.name);
} catch (error) {
  if (error.message === 'MUST_CHANGE_PASSWORD') {
    // Mostrar campo de nova senha
  }
}
```

---

### logout()

**Assinatura**:
```typescript
async logout(): Promise<void>
```

**Descrição**: Encerra a sessão do usuário

**Fluxo**:
1. Chama supabase.auth.signOut()
2. Remove sessão do localStorage

**Exemplo**:
```typescript
await AuthService.logout();
navigate('/login');
```

---

### getCurrentUser()

**Assinatura**:
```typescript
async getCurrentUser(): Promise<User | null>
```

**Descrição**: Obtém o usuário autenticado atual

**Retorno**: Objeto User ou null se não autenticado

**Fluxo**:
1. Busca usuário do Supabase Auth
2. Se existe, busca perfil completo do banco
3. Retorna usuário com role e departamento

**Exemplo**:
```typescript
const user = await AuthService.getCurrentUser();
if (user) {
  console.log('Usuário:', user.name, user.role);
}
```

---

## ReportService

**Arquivo**: `/src/lib/supabase.ts`

**Descrição**: Serviço de gerenciamento de laudos

### getReports()

**Assinatura**:
```typescript
async getReports(userId?: string): Promise<Report[]>
```

**Parâmetros**:
- `userId` (opcional): ID do usuário para filtrar laudos

**Retorno**: Array de Reports

**Fluxo**:
1. Query no banco de laudos
2. Se userId fornecido, filtra por assigned_to
3. Inclui dados relacionados:
   - Perfil do criador
   - Perfil do atribuído
   - Log de auditoria
   - Fotos do veículo
4. Ordena por created_at DESC
5. Mapeia para formato Report

**Exemplo**:
```typescript
// Todos os laudos
const allReports = await ReportService.getReports();

// Laudos de um policial
const officerReports = await ReportService.getReports(officerId);
```

---

### getReportById()

**Assinatura**:
```typescript
async getReportById(id: string): Promise<Report | null>
```

**Parâmetros**:
- `id`: ID do laudo

**Retorno**: Report ou null se não encontrado

**Exemplo**:
```typescript
const report = await ReportService.getReportById('report-123');
if (report) {
  console.log('Laudo:', report.number);
}
```

---

### createReport()

**Assinatura**:
```typescript
async createReport(
  reportData: CreateReportRequest,
  createdBy: string
): Promise<Report>
```

**Parâmetros**:
```typescript
interface CreateReportRequest {
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
  assignedTo?: string;
}
```

**Fluxo**:
1. Busca perfil do criador
2. Gera número do laudo:
   - Formato: YYYYMMDD-DEPARTMENT-0001
   - Exemplo: 20250129-TRAFFIC-0001
3. Define status:
   - RECEIVED se assignedTo fornecido
   - PENDING caso contrário
4. Insere no banco
5. Cria entrada de auditoria: 'CREATED'
6. Retorna laudo criado

**Exemplo**:
```typescript
const report = await ReportService.createReport({
  priority: 'HIGH',
  location: {
    address: 'Rua Principal, 123',
    city: 'Ilhéus',
    state: 'BA',
  },
  vehicle: {
    plate: 'ABC1D23',
    isCloned: false,
  },
  assignedTo: officerId,
}, agentId);

console.log('Laudo criado:', report.number);
```

---

### updateReport()

**Assinatura**:
```typescript
async updateReport(
  id: string,
  updates: Partial<Report>,
  userId: string
): Promise<Report>
```

**Parâmetros**:
- `id`: ID do laudo
- `updates`: Campos a atualizar
- `userId`: ID do usuário que está atualizando

**Campos Atualizáveis**:
- status
- location (address, city, state, coordinates)
- vehicle (plate, chassis, color, brand, model, year, isCloned)
- analysis (isConclusive, justification, observations)

**Fluxo**:
1. Busca nome do usuário
2. Atualiza campos no banco
3. Cria entrada de auditoria: 'UPDATED'
4. Retorna laudo atualizado

**Exemplo**:
```typescript
await ReportService.updateReport(
  reportId,
  {
    status: 'IN_PROGRESS',
    vehicle: {
      ...report.vehicle,
      chassis: '9BWZZZ377VT004251',
    },
  },
  officerId
);
```

---

### assignReport()

**Assinatura**:
```typescript
async assignReport(
  reportId: string,
  officerId: string,
  agentId: string
): Promise<Report>
```

**Parâmetros**:
- `reportId`: ID do laudo
- `officerId`: ID do policial
- `agentId`: ID do agente que está atribuindo

**Fluxo**:
1. Busca nomes do agente e policial
2. Atualiza laudo:
   - assigned_to = officerId
   - assigned_at = timestamp atual
   - status = 'RECEIVED'
3. Cria entrada de auditoria: 'ASSIGNED'
4. Retorna laudo atualizado

**Exemplo**:
```typescript
await ReportService.assignReport(
  reportId,
  officerId,
  agentId
);

toast({
  title: "Laudo atribuído",
  description: "Policial notificado com sucesso",
});
```

---

### cancelReport()

**Assinatura**:
```typescript
async cancelReport(
  reportId: string,
  agentId: string,
  reason: string
): Promise<Report>
```

**Parâmetros**:
- `reportId`: ID do laudo
- `agentId`: ID do agente
- `reason`: Motivo do cancelamento

**Fluxo**:
1. Busca nome do agente
2. Atualiza status para 'CANCELLED'
3. Cria entrada de auditoria: 'CANCELLED' com motivo
4. Retorna laudo atualizado

**Exemplo**:
```typescript
await ReportService.cancelReport(
  reportId,
  agentId,
  'Veículo não localizado'
);
```

---

## OfficerService

**Arquivo**: `/src/lib/supabase.ts`

**Descrição**: Serviço de gerenciamento de policiais

### getOfficers()

**Assinatura**:
```typescript
async getOfficers(): Promise<User[]>
```

**Retorno**: Array de Users com role OFFICER

**Fluxo**:
1. Query em profiles com join em user_roles
2. Filtra por role = 'OFFICER'
3. Filtra por is_active = true
4. Mapeia para formato User

**Exemplo**:
```typescript
const officers = await OfficerService.getOfficers();
console.log(`${officers.length} policiais ativos`);
```

---

### createOfficer()

**Assinatura**:
```typescript
async createOfficer(data: Omit<User, 'id' | 'createdAt'>): Promise<User>
```

**Parâmetros**:
```typescript
{
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

**Fluxo**:
1. Chama Edge Function 'create-officer'
2. Edge Function:
   - Cria usuário no Supabase Auth
   - Cria perfil no banco
   - Cria role OFFICER
   - Define senha padrão
3. Retorna usuário criado

**Exemplo**:
```typescript
const officer = await OfficerService.createOfficer({
  username: 'officer.new',
  email: 'officer.new@police.gov',
  name: 'Novo Policial',
  department: 'TRAFFIC',
  badge: 'OFF999',
  role: 'OFFICER',
  isActive: true,
  mustChangePassword: true,
});

console.log('Policial criado:', officer.name);
```

---

### updateOfficer()

**Assinatura**:
```typescript
async updateOfficer(id: string, updates: Partial<User>): Promise<User>
```

**Parâmetros**:
- `id`: ID do policial
- `updates`: Campos a atualizar

**Campos Atualizáveis**:
- name
- email
- department
- badge
- isActive

**Exemplo**:
```typescript
await OfficerService.updateOfficer(officerId, {
  name: 'Nome Atualizado',
  department: 'CRIMINAL',
  isActive: false,
});
```

---

## DashboardService

**Arquivo**: `/src/lib/supabase.ts`

**Descrição**: Serviço de estatísticas

### getStats()

**Assinatura**:
```typescript
async getStats(userId?: string): Promise<DashboardStats>
```

**Parâmetros**:
- `userId` (opcional): Para estatísticas de um usuário específico

**Retorno**:
```typescript
interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  inProgressReports: number;
  completedReports: number;
  overdueReports: number;
  myReports?: number;  // Se userId fornecido
}
```

**Fluxo**:
1. Conta total de laudos (filtrado por userId se fornecido)
2. Conta laudos por status
3. Calcula laudos atrasados (assigned_at > 3 dias e não COMPLETED)
4. Retorna estatísticas

**Exemplo**:
```typescript
// Estatísticas gerais
const stats = await DashboardService.getStats();

// Estatísticas de um policial
const officerStats = await DashboardService.getStats(officerId);
console.log(`${officerStats.myReports} laudos atribuídos`);
```

---

## SeedService

**Arquivo**: `/src/services/seed-service.ts`

**Descrição**: Serviço para popular banco com dados de teste

### seedDatabase()

**Assinatura**:
```typescript
async seedDatabase(): Promise<SeedResult>
```

**Retorno**:
```typescript
interface SeedResult {
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
  users: Array<{
    username: string;
    email: string;
    role: string;
    status: 'created' | 'exists' | 'error';
  }>;
}
```

**Fluxo**:
1. Chama Edge Function 'seed-database' com action='seed'
2. Edge Function cria:
   - 3 Agentes (traffic, criminal, admin)
   - 5 Policiais (2 traffic, 2 criminal, 1 admin)
   - Senha padrão: 'senha123'
   - Todos com must_change_password = true
3. Retorna resultado detalhado

**Exemplo**:
```typescript
const result = await SeedService.seedDatabase();

console.log(`${result.created} usuários criados`);
console.log(`${result.skipped} já existiam`);
console.log(`${result.errors.length} erros`);

result.users.forEach(user => {
  console.log(`${user.username} - ${user.status}`);
});
```

---

### clearDatabase()

**Assinatura**:
```typescript
async clearDatabase(): Promise<ClearResult>
```

**Retorno**:
```typescript
interface ClearResult {
  success: boolean;
  deleted: number;
  errors: string[];
}
```

**Fluxo**:
1. Chama Edge Function 'seed-database' com action='clear'
2. Edge Function remove todos os usuários de teste
3. Retorna quantidade de usuários removidos

**Exemplo**:
```typescript
const result = await SeedService.clearDatabase();
console.log(`${result.deleted} usuários removidos`);
```

---

### listUsers()

**Assinatura**:
```typescript
async listUsers(): Promise<UserListItem[]>
```

**Retorno**:
```typescript
interface UserListItem {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  department: string;
  badge: string;
  isActive: boolean;
}
```

**Fluxo**:
1. Chama Edge Function 'seed-database' com action='list'
2. Retorna lista completa de usuários

**Exemplo**:
```typescript
const users = await SeedService.listUsers();
console.log(`${users.length} usuários no sistema`);
```

---

### isAvailable()

**Assinatura**:
```typescript
async isAvailable(): Promise<boolean>
```

**Descrição**: Verifica se a Edge Function está disponível

**Fluxo**:
1. Tenta chamar listUsers()
2. Se sucesso, retorna true
3. Se erro, retorna false

**Exemplo**:
```typescript
const available = await SeedService.isAvailable();
if (!available) {
  console.error('Edge Function não disponível');
}
```

---

## Mock API Service

**Arquivo**: `/src/services/mock-api.ts`

**Descrição**: Versão mock dos serviços (não usada em produção)

**Nota**: Este arquivo contém implementações mock de todos os serviços usando localStorage. Foi usado durante o desenvolvimento antes da integração com Supabase.

**Funcionalidades**:
- Simula delay de rede
- Armazena dados no localStorage
- Gera IDs e números de laudo
- Mantém log de auditoria

**Uso**: Não é mais usado, mas pode ser útil para desenvolvimento offline.

---

## Integração com Supabase

### Cliente Supabase

**Arquivo**: `/src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
```

### Tipos do Banco

**Arquivo**: `/src/integrations/supabase/types.ts`

Contém todas as definições de tipos TypeScript geradas automaticamente do schema do Supabase.

---

## Tratamento de Erros

### Padrão de Erro

Todos os serviços seguem o padrão:

```typescript
try {
  const result = await Service.method();
  return result;
} catch (error: any) {
  throw new Error(error.message || 'Erro genérico');
}
```

### Uso nos Componentes

```typescript
try {
  await ReportService.createReport(data, userId);
  toast({
    title: "Sucesso",
    description: "Laudo criado com sucesso",
  });
} catch (error: any) {
  toast({
    variant: "destructive",
    title: "Erro",
    description: error.message,
  });
}
```

---

## Edge Functions

### Funções Disponíveis

1. **seed-database**
   - Ações: seed, clear, list
   - Uso: Popular/limpar banco de dados

2. **create-officer**
   - Cria usuário com role OFFICER
   - Requer credenciais admin

### Chamada de Edge Function

```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { ...params },
});

if (error) throw new Error(error.message);
return data;
```

---

## Boas Práticas

### 1. Sempre use os Services

❌ **Errado**:
```typescript
const { data } = await supabase.from('reports').select();
```

✅ **Correto**:
```typescript
const reports = await ReportService.getReports();
```

### 2. Trate erros apropriadamente

```typescript
try {
  const result = await Service.method();
  // Sucesso
} catch (error) {
  // Trate o erro
  console.error(error);
  toast({ variant: "destructive", title: "Erro" });
}
```

### 3. Use TypeScript

```typescript
// Tipos ajudam a evitar erros
const report: Report = await ReportService.getReportById(id);
```

### 4. Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);

try {
  setIsLoading(true);
  await Service.method();
} finally {
  setIsLoading(false);
}
```

### 5. Otimistic Updates

```typescript
// Atualiza UI antes da resposta
setReports(prev => [...prev, newReport]);

try {
  await ReportService.createReport(data);
} catch (error) {
  // Reverte em caso de erro
  setReports(prev => prev.filter(r => r.id !== newReport.id));
}
```
