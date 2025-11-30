# Sistema de Laudos Policiais - Documentação Backend Completa

> **Objetivo:** Esta documentação fornece uma especificação completa do backend para reimplementação em qualquer linguagem/framework. Todas as regras de negócio, estruturas de dados, permissões e fluxos estão documentados de forma precisa.

---

## 📋 Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Arquitetura](#2-arquitetura)
3. [Tipos Enumerados (Enums)](#3-tipos-enumerados-enums)
4. [Esquema do Banco de Dados](#4-esquema-do-banco-de-dados)
5. [Relacionamentos Entre Tabelas](#5-relacionamentos-entre-tabelas)
6. [Funções do Banco de Dados](#6-funções-do-banco-de-dados)
7. [Triggers](#7-triggers)
8. [Row Level Security (RLS)](#8-row-level-security-rls)
9. [Regras de Negócio](#9-regras-de-negócio)
10. [Endpoints/Serviços](#10-endpointsserviços)
11. [Edge Functions](#11-edge-functions)
12. [Fluxos de Trabalho](#12-fluxos-de-trabalho)
13. [Validações](#13-validações)
14. [Auditoria](#14-auditoria)

---

## 1. Visão Geral do Sistema

### Propósito
Sistema de gerenciamento de laudos policiais para a Polícia Civil da Bahia, permitindo que **Agentes** criem e gerenciem laudos de veículos, e **Policiais** (Officers) executem a vistoria e análise dos veículos.

### Atores do Sistema

#### 1.1. AGENT (Agente)
- **Responsabilidade:** Criar, gerenciar e atribuir laudos
- **Permissões:**
  - Criar novos laudos
  - Visualizar todos os laudos
  - Atribuir laudos a policiais
  - Cancelar laudos
  - Gerenciar policiais (criar, editar)
  - Gerenciar roles de usuários

#### 1.2. OFFICER (Policial)
- **Responsabilidade:** Executar vistoria e análise de veículos
- **Permissões:**
  - Visualizar apenas laudos atribuídos a ele
  - Atualizar laudos atribuídos a ele
  - Fazer upload de fotos dos veículos
  - Preencher análise e conclusão

### Fluxo Básico
```
1. Agente cria laudo → status: PENDING
2. Agente atribui laudo a Policial → status: RECEIVED
3. Policial inicia trabalho → status: IN_PROGRESS
4. Policial preenche dados, fotos e análise → status: IN_PROGRESS
5. Policial finaliza laudo → status: COMPLETED
```

---

## 2. Arquitetura

### 2.1. Camadas do Sistema

```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  - Interface web para Agentes       │
│  - Interface web para Policiais     │
└──────────────┬──────────────────────┘
               │
               │ HTTP/REST
               │
┌──────────────▼──────────────────────┐
│      Supabase Backend               │
│  ┌───────────────────────────────┐  │
│  │   Authentication (Auth)       │  │
│  │   - Email/Password            │  │
│  │   - Session Management        │  │
│  └───────────────────────────────┘  │
│                                      │
│  ┌───────────────────────────────┐  │
│  │   Database (PostgreSQL)       │  │
│  │   - Tabelas                   │  │
│  │   - RLS Policies              │  │
│  │   - Functions & Triggers      │  │
│  └───────────────────────────────┘  │
│                                      │
│  ┌───────────────────────────────┐  │
│  │   Edge Functions              │  │
│  │   - create-officer            │  │
│  │   - seed-database             │  │
│  └───────────────────────────────┘  │
│                                      │
│  ┌───────────────────────────────┐  │
│  │   Storage (Arquivos)          │  │
│  │   - Fotos dos veículos        │  │
│  └───────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 2.2. Tecnologias Utilizadas
- **Autenticação:** Supabase Auth (baseado em GoTrue)
- **Banco de Dados:** PostgreSQL 15+
- **Row Level Security:** Políticas RLS do PostgreSQL
- **Storage:** Supabase Storage (S3-compatible)
- **Edge Functions:** Deno (TypeScript runtime)

---

## 3. Tipos Enumerados (Enums)

### 3.1. `app_role`
Papéis dos usuários no sistema.

```sql
CREATE TYPE app_role AS ENUM ('AGENT', 'OFFICER');
```

**Valores:**
- `AGENT` - Agente que gerencia laudos
- `OFFICER` - Policial que executa laudos

---

### 3.2. `department`
Departamentos da Polícia Civil.

```sql
CREATE TYPE department AS ENUM ('TRAFFIC', 'CRIMINAL', 'ADMINISTRATIVE');
```

**Valores:**
- `TRAFFIC` - Departamento de Trânsito
- `CRIMINAL` - Departamento Criminal
- `ADMINISTRATIVE` - Departamento Administrativo

---

### 3.3. `report_status`
Status do laudo ao longo do ciclo de vida.

```sql
CREATE TYPE report_status AS ENUM (
  'PENDING',      -- Criado, aguardando atribuição
  'RECEIVED',     -- Atribuído a um policial
  'IN_PROGRESS',  -- Policial iniciou trabalho
  'COMPLETED',    -- Laudo finalizado
  'CANCELLED'     -- Laudo cancelado
);
```

**Transições Válidas:**
```
PENDING → RECEIVED → IN_PROGRESS → COMPLETED
PENDING → CANCELLED
RECEIVED → CANCELLED
IN_PROGRESS → CANCELLED
```

---

### 3.4. `priority`
Prioridade do laudo.

```sql
CREATE TYPE priority AS ENUM ('HIGH', 'MEDIUM', 'LOW');
```

**Valores:**
- `HIGH` - Alta prioridade
- `MEDIUM` - Média prioridade
- `LOW` - Baixa prioridade

---

## 4. Esquema do Banco de Dados

### 4.1. Tabela: `auth.users`
**Sistema:** Gerenciada pelo Supabase Auth
**Descrição:** Armazena credenciais de autenticação dos usuários.

**Campos Relevantes:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do usuário (PK) |
| `email` | TEXT | Email do usuário (usado como username no login) |
| `encrypted_password` | TEXT | Senha criptografada |
| `email_confirmed_at` | TIMESTAMP | Data de confirmação do email |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

**Nota:** Esta tabela não é modificada diretamente. Use a API Admin do Supabase Auth.

---

### 4.2. Tabela: `profiles`
**Descrição:** Perfil detalhado de cada usuário do sistema.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  department department NOT NULL,
  badge TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Campos:**

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, FK → auth.users(id) | ID do usuário (mesmo da tabela auth) |
| `username` | TEXT | UNIQUE, NOT NULL | Nome de usuário único (usado no login) |
| `email` | TEXT | NOT NULL | Email do usuário |
| `name` | TEXT | NOT NULL | Nome completo do usuário |
| `department` | ENUM | NOT NULL | Departamento ao qual pertence |
| `badge` | TEXT | NOT NULL | Matrícula/identificação funcional |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Se o usuário está ativo |
| `must_change_password` | BOOLEAN | NOT NULL, DEFAULT true | Se deve trocar senha no próximo login |
| `last_login` | TIMESTAMP | NULLABLE | Data do último login |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT now() | Data de última atualização |

**Índices:**
- Primary Key: `id`
- Unique: `username`

**Triggers:**
- `set_profiles_updated_at` - Atualiza `updated_at` automaticamente

**Cascade:**
- ON DELETE CASCADE - Quando auth.users é deletado, profile também é deletado

---

### 4.3. Tabela: `user_roles`
**Descrição:** Armazena os papéis (roles) dos usuários. Separada de `profiles` por questões de segurança.

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
```

**Campos:**

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | ID único da role |
| `user_id` | UUID | FK → profiles(id), NOT NULL | ID do usuário |
| `role` | ENUM | NOT NULL | Papel do usuário (AGENT ou OFFICER) |

**Restrições:**
- UNIQUE (user_id, role) - Um usuário não pode ter a mesma role duplicada
- ON DELETE CASCADE - Quando profile é deletado, roles também são deletadas

**Nota:** Atualmente o sistema não suporta múltiplas roles por usuário, mas a estrutura permite isso.

---

### 4.4. Tabela: `reports`
**Descrição:** Armazena os laudos de veículos.

```sql
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT UNIQUE NOT NULL,
  status report_status NOT NULL DEFAULT 'PENDING',
  priority priority NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE,

  -- Localização
  location_address TEXT,
  location_city TEXT,
  location_state TEXT,
  location_coordinates TEXT,  -- JSON string: {"lat": 0, "lng": 0}

  -- Dados do veículo
  vehicle_plate TEXT,
  vehicle_chassi TEXT,
  vehicle_motor TEXT,
  vehicle_color TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_is_cloned BOOLEAN DEFAULT false,

  -- Análise
  analysis_is_conclusive BOOLEAN,
  analysis_justification TEXT,
  analysis_observations TEXT,

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Campos:**

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY | ID único do laudo |
| `number` | TEXT | UNIQUE, NOT NULL | Número do laudo (formato: YYYYMMDD-DEPT-0001) |
| `status` | ENUM | NOT NULL, DEFAULT 'PENDING' | Status atual do laudo |
| `priority` | ENUM | NOT NULL | Prioridade do laudo |
| `created_by` | UUID | FK → profiles(id), NOT NULL | ID do agente que criou |
| `assigned_to` | UUID | FK → profiles(id), NULLABLE | ID do policial atribuído |
| `assigned_at` | TIMESTAMP | NULLABLE | Data/hora de atribuição |

**Localização:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `location_address` | TEXT | Endereço completo |
| `location_city` | TEXT | Cidade |
| `location_state` | TEXT | Estado (UF) |
| `location_coordinates` | TEXT | Coordenadas GPS (JSON string) |

**Dados do Veículo:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `vehicle_plate` | TEXT | Placa do veículo |
| `vehicle_chassi` | TEXT | Número do chassi |
| `vehicle_motor` | TEXT | Número do motor |
| `vehicle_color` | TEXT | Cor do veículo |
| `vehicle_brand` | TEXT | Marca do veículo |
| `vehicle_model` | TEXT | Modelo do veículo |
| `vehicle_year` | INTEGER | Ano do veículo |
| `vehicle_is_cloned` | BOOLEAN | Se o veículo é clonado |

**Análise:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `analysis_is_conclusive` | BOOLEAN | Se a análise é conclusiva |
| `analysis_justification` | TEXT | Justificativa (obrigatória se não conclusiva) |
| `analysis_observations` | TEXT | Observações gerais |

**Metadados:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de última atualização |

**Índices:**
- Primary Key: `id`
- Unique: `number`
- Foreign Keys: `created_by`, `assigned_to`

**Triggers:**
- `set_reports_updated_at` - Atualiza `updated_at` automaticamente

---

### 4.5. Tabela: `report_audit_log`
**Descrição:** Log de auditoria de todas as ações realizadas em um laudo.

```sql
CREATE TABLE public.report_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  user_name TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Campos:**

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY | ID único do log |
| `report_id` | UUID | FK → reports(id), NOT NULL | ID do laudo |
| `action` | TEXT | NOT NULL | Ação realizada (CREATED, UPDATED, ASSIGNED, CANCELLED) |
| `user_id` | UUID | FK → profiles(id), NOT NULL | ID do usuário que realizou a ação |
| `user_name` | TEXT | NOT NULL | Nome do usuário (desnormalizado para histórico) |
| `details` | TEXT | NULLABLE | Detalhes adicionais da ação |
| `timestamp` | TIMESTAMP | NOT NULL, DEFAULT now() | Data/hora da ação |

**Ações Comuns:**
- `CREATED` - Laudo criado
- `UPDATED` - Laudo atualizado
- `ASSIGNED` - Laudo atribuído a um policial
- `CANCELLED` - Laudo cancelado

**Cascade:**
- ON DELETE CASCADE - Quando report é deletado, logs também são deletados

---

### 4.6. Tabela: `vehicle_photos`
**Descrição:** Armazena URLs das fotos das partes do veículo.

```sql
CREATE TABLE public.vehicle_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  part TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Campos:**

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY | ID único da foto |
| `report_id` | UUID | FK → reports(id), NOT NULL | ID do laudo |
| `part` | TEXT | NOT NULL | Parte do veículo fotografada |
| `photo_url` | TEXT | NOT NULL | URL da foto no storage |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | Data do upload |

**Partes do Veículo (valores esperados para `part`):**
- `Placa`
- `Chassi`
- `Motor`
- `Vidros`
- `Etiquetas`
- `Painel`
- `Laterais`
- `Frente`
- `Traseira`
- `Rodas`

**Cascade:**
- ON DELETE CASCADE - Quando report é deletado, fotos também são deletadas

---

## 5. Relacionamentos Entre Tabelas

### Diagrama de Relacionamentos

```
auth.users (1) ──────┐
                     │ ON DELETE CASCADE
                     ▼
                profiles (1) ─────────┐
                     │                │
                     │                │
           ┌─────────┼────────────────┘
           │         │
           │         │ ON DELETE CASCADE
           │         ▼
           │    user_roles (N)
           │
           │
           │ created_by / assigned_to
           │
           ├──────────────────────► reports (N)
           │                           │
           │                           │ ON DELETE CASCADE
           │                           │
           │                           ├────► report_audit_log (N)
           │                           │
           │                           └────► vehicle_photos (N)
           │
           │ user_id (audit log)
           └──────────────────────► report_audit_log (N)
```

### Relacionamentos Detalhados

#### 5.1. auth.users → profiles (1:1)
- **Tipo:** One-to-One obrigatório
- **Chave:** profiles.id = auth.users.id
- **Cascade:** ON DELETE CASCADE
- **Descrição:** Cada usuário autenticado tem exatamente um perfil

#### 5.2. profiles → user_roles (1:N)
- **Tipo:** One-to-Many
- **Chave:** user_roles.user_id = profiles.id
- **Cascade:** ON DELETE CASCADE
- **Descrição:** Um perfil pode ter múltiplas roles (embora atualmente só use uma)

#### 5.3. profiles → reports (created_by) (1:N)
- **Tipo:** One-to-Many obrigatório
- **Chave:** reports.created_by = profiles.id
- **Cascade:** Nenhum (não deleta profile se houver reports)
- **Descrição:** Um agente pode criar múltiplos laudos

#### 5.4. profiles → reports (assigned_to) (1:N)
- **Tipo:** One-to-Many opcional
- **Chave:** reports.assigned_to = profiles.id
- **Cascade:** Nenhum
- **Descrição:** Um policial pode ter múltiplos laudos atribuídos

#### 5.5. reports → report_audit_log (1:N)
- **Tipo:** One-to-Many obrigatório
- **Chave:** report_audit_log.report_id = reports.id
- **Cascade:** ON DELETE CASCADE
- **Descrição:** Um laudo tem múltiplos logs de auditoria

#### 5.6. reports → vehicle_photos (1:N)
- **Tipo:** One-to-Many
- **Chave:** vehicle_photos.report_id = reports.id
- **Cascade:** ON DELETE CASCADE
- **Descrição:** Um laudo tem múltiplas fotos do veículo

#### 5.7. profiles → report_audit_log (1:N)
- **Tipo:** One-to-Many obrigatório
- **Chave:** report_audit_log.user_id = profiles.id
- **Cascade:** Nenhum
- **Descrição:** Um usuário pode ter múltiplas ações registradas nos logs

---

## 6. Funções do Banco de Dados

### 6.1. Função: `has_role`

**Descrição:** Verifica se um usuário tem uma role específica.

**Assinatura:**
```sql
public.has_role(_user_id UUID, _role app_role) RETURNS BOOLEAN
```

**Implementação:**
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

**Parâmetros:**
- `_user_id` (UUID) - ID do usuário a verificar
- `_role` (app_role) - Role a verificar ('AGENT' ou 'OFFICER')

**Retorno:**
- `true` - Se o usuário tem a role especificada
- `false` - Se o usuário não tem a role

**Características:**
- `STABLE` - Não modifica o banco, pode ser otimizada
- `SECURITY DEFINER` - Executa com privilégios do criador da função, evitando recursão de RLS
- `SET search_path = public` - Fixa o schema para segurança

**Uso:**
- Usada nas políticas RLS para verificar permissões
- Pode ser usada em queries para filtrar dados baseado em roles

**Exemplo:**
```sql
SELECT public.has_role('user-uuid-here', 'AGENT');  -- Retorna true/false
```

---

### 6.2. Função: `handle_updated_at`

**Descrição:** Atualiza automaticamente o campo `updated_at` quando uma linha é modificada.

**Assinatura:**
```sql
public.handle_updated_at() RETURNS TRIGGER
```

**Implementação:**
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

**Características:**
- `TRIGGER` - Executada automaticamente em eventos de UPDATE
- `SECURITY DEFINER` - Executa com privilégios do criador
- `SET search_path = public` - Fixa o schema para segurança

**Uso:**
- Usada em triggers `BEFORE UPDATE` nas tabelas `profiles` e `reports`
- Garante que `updated_at` sempre reflita a última modificação

---

## 7. Triggers

### 7.1. Trigger: `set_profiles_updated_at`

**Descrição:** Atualiza `updated_at` na tabela `profiles` automaticamente.

```sql
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**Quando Dispara:**
- BEFORE UPDATE - Antes de qualquer UPDATE na tabela profiles

**Comportamento:**
- Para cada linha atualizada (`FOR EACH ROW`)
- Chama `handle_updated_at()` que seta `NEW.updated_at = now()`

---

### 7.2. Trigger: `set_reports_updated_at`

**Descrição:** Atualiza `updated_at` na tabela `reports` automaticamente.

```sql
CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**Quando Dispara:**
- BEFORE UPDATE - Antes de qualquer UPDATE na tabela reports

**Comportamento:**
- Para cada linha atualizada (`FOR EACH ROW`)
- Chama `handle_updated_at()` que seta `NEW.updated_at = now()`

---

## 8. Row Level Security (RLS)

### Conceito
Row Level Security (RLS) é um mecanismo de segurança do PostgreSQL que filtra linhas retornadas por queries baseado no usuário que executa a query. No Supabase, o RLS é fundamental para garantir que usuários só acessem dados permitidos.

### Contexto de Execução
- `auth.uid()` - Retorna o UUID do usuário autenticado na sessão
- `auth.role()` - Retorna a role do PostgreSQL (sempre 'authenticated' para usuários logados)

---

### 8.1. Políticas RLS - Tabela: `profiles`

#### Policy: "Users can view all profiles"
```sql
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
```

**Tipo:** SELECT (leitura)
**Quem:** Todos os usuários autenticados
**Condição:** Nenhuma (todos podem ver todos os perfis)
**Justificativa:** Necessário para listar policiais, ver dados de criadores de laudos, etc.

---

#### Policy: "Users can update their own profile"
```sql
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

**Tipo:** UPDATE (atualização)
**Quem:** Todos os usuários autenticados
**Condição:** Apenas seu próprio perfil (`auth.uid() = id`)
**Justificativa:** Usuário pode atualizar seus próprios dados (ex: trocar senha, atualizar last_login)

---

### 8.2. Políticas RLS - Tabela: `user_roles`

#### Policy: "Users can view all roles"
```sql
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);
```

**Tipo:** SELECT (leitura)
**Quem:** Todos os usuários autenticados
**Condição:** Nenhuma (todos podem ver todas as roles)
**Justificativa:** Necessário para verificar permissões de outros usuários

---

#### Policy: "Only agents can manage roles"
```sql
CREATE POLICY "Only agents can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'AGENT'));
```

**Tipo:** ALL (INSERT, UPDATE, DELETE)
**Quem:** Apenas AGENTS
**Condição:** `public.has_role(auth.uid(), 'AGENT')` retorna true
**Justificativa:** Apenas agentes podem criar, modificar ou deletar roles

---

### 8.3. Políticas RLS - Tabela: `reports`

#### Policy: "Agents can view all reports"
```sql
CREATE POLICY "Agents can view all reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'AGENT'));
```

**Tipo:** SELECT (leitura)
**Quem:** Apenas AGENTS
**Condição:** Usuário deve ter role AGENT
**Justificativa:** Agentes precisam ver todos os laudos para gerenciar

---

#### Policy: "Officers can view their assigned reports"
```sql
CREATE POLICY "Officers can view their assigned reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'OFFICER')
    AND assigned_to = auth.uid()
  );
```

**Tipo:** SELECT (leitura)
**Quem:** Apenas OFFICERS
**Condição:**
- Usuário deve ter role OFFICER
- E o laudo deve estar atribuído a ele (`assigned_to = auth.uid()`)

**Justificativa:** Policiais só podem ver laudos atribuídos a eles

---

#### Policy: "Agents can create reports"
```sql
CREATE POLICY "Agents can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'AGENT'));
```

**Tipo:** INSERT (criação)
**Quem:** Apenas AGENTS
**Condição:** Usuário deve ter role AGENT
**Justificativa:** Apenas agentes podem criar novos laudos

---

#### Policy: "Agents can update any report"
```sql
CREATE POLICY "Agents can update any report"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'AGENT'));
```

**Tipo:** UPDATE (atualização)
**Quem:** Apenas AGENTS
**Condição:** Usuário deve ter role AGENT
**Justificativa:** Agentes podem editar qualquer laudo

---

#### Policy: "Officers can update their assigned reports"
```sql
CREATE POLICY "Officers can update their assigned reports"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'OFFICER')
    AND assigned_to = auth.uid()
  );
```

**Tipo:** UPDATE (atualização)
**Quem:** Apenas OFFICERS
**Condição:**
- Usuário deve ter role OFFICER
- E o laudo deve estar atribuído a ele

**Justificativa:** Policiais só podem editar laudos atribuídos a eles

---

### 8.4. Políticas RLS - Tabela: `report_audit_log`

#### Policy: "Users can view audit logs for accessible reports"
```sql
CREATE POLICY "Users can view audit logs for accessible reports"
  ON public.report_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_audit_log.report_id
    )
  );
```

**Tipo:** SELECT (leitura)
**Quem:** Todos os usuários autenticados
**Condição:** Usuário tem acesso ao laudo relacionado (verificado pelas policies de `reports`)
**Justificativa:** Se você pode ver o laudo, pode ver o histórico dele

**Como funciona:**
1. Usuário tenta acessar audit log
2. RLS verifica se ele tem acesso ao report relacionado
3. Se as policies de reports permitirem, o audit log é liberado
4. Isso cria uma cadeia de permissões automática

---

#### Policy: "Authenticated users can insert audit logs"
```sql
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.report_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

**Tipo:** INSERT (criação)
**Quem:** Todos os usuários autenticados
**Condição:** `user_id` do log deve ser o próprio usuário
**Justificativa:** Usuários podem criar logs, mas apenas em seu próprio nome

---

### 8.5. Políticas RLS - Tabela: `vehicle_photos`

#### Policy: "Users can view photos for accessible reports"
```sql
CREATE POLICY "Users can view photos for accessible reports"
  ON public.vehicle_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = vehicle_photos.report_id
    )
  );
```

**Tipo:** SELECT (leitura)
**Quem:** Todos os usuários autenticados
**Condição:** Usuário tem acesso ao laudo relacionado
**Justificativa:** Mesma lógica do audit log - se pode ver o laudo, pode ver as fotos

---

#### Policy: "Officers can manage photos for their reports"
```sql
CREATE POLICY "Officers can manage photos for their reports"
  ON public.vehicle_photos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = vehicle_photos.report_id
      AND reports.assigned_to = auth.uid()
    )
  );
```

**Tipo:** ALL (INSERT, UPDATE, DELETE)
**Quem:** Policiais com acesso ao laudo
**Condição:**
- Existe um laudo com esse report_id
- E o laudo está atribuído ao usuário atual

**Justificativa:** Policiais podem fazer upload, atualizar e deletar fotos de seus laudos

**Nota:** Agentes NÃO precisam de policy explícita aqui pois eles atualizam fotos através de updates no report, não diretamente na tabela de fotos.

---

## 9. Regras de Negócio

### 9.1. Criação de Usuários

#### Regra: Senha Temporária
- **Descrição:** Ao criar um usuário, sempre definir `must_change_password = true`
- **Implementação:** Edge Function `create-officer`
- **Senha Padrão:** `temporaryPassword123` (ou `senha123` no seed)
- **Validação:** Login verifica `must_change_password` e exige troca

#### Regra: Unicidade de Username
- **Descrição:** Cada username deve ser único no sistema
- **Implementação:** Constraint UNIQUE na tabela `profiles.username`
- **Comportamento:** Erro ao tentar criar usuário com username duplicado

#### Regra: Email como Credencial de Auth
- **Descrição:** O campo `email` é usado na autenticação do Supabase Auth
- **Implementação:**
  - `username` é usado no frontend como campo de login
  - Mas o backend converte para `email` ao chamar `signInWithPassword()`
- **Código:** `src/lib/supabase.ts:14-17`

---

### 9.2. Autenticação e Login

#### Regra: Login com Username
- **Descrição:** Usuário faz login com username, mas o sistema usa email internamente
- **Fluxo:**
  ```
  1. Frontend recebe: { username: 'agent.traffic', password: 'senha' }
  2. Backend chama Auth: signInWithPassword({ email: username, password })
  3. Supabase Auth valida credenciais
  4. Retorna sessão + token
  ```

#### Regra: Troca Obrigatória de Senha
- **Descrição:** Se `must_change_password = true`, usuário deve trocar senha antes de acessar o sistema
- **Fluxo:**
  ```
  1. Login com credenciais antigas
  2. Se must_change_password = true, retorna erro 'MUST_CHANGE_PASSWORD'
  3. Frontend mostra campo de nova senha
  4. Usuário submete com newPassword
  5. Backend atualiza senha e seta must_change_password = false
  6. Login é concluído
  ```
- **Código:** `src/lib/supabase.ts:49-52`

#### Regra: Atualização de Last Login
- **Descrição:** Toda vez que um usuário faz login com sucesso, atualizar `last_login`
- **Implementação:** `src/lib/supabase.ts:54-58`

---

### 9.3. Numeração de Laudos

#### Regra: Formato do Número
- **Formato:** `YYYYMMDD-DEPARTMENT-XXXX`
- **Exemplo:** `20241130-TRAFFIC-0001`
- **Componentes:**
  - `YYYYMMDD` - Data de criação
  - `DEPARTMENT` - Departamento do criador (TRAFFIC, CRIMINAL, ADMINISTRATIVE)
  - `XXXX` - Sequencial do dia (4 dígitos com zero à esquerda)

#### Regra: Sequencial por Departamento
- **Descrição:** A cada dia, cada departamento tem seu próprio contador começando em 0001
- **Implementação:**
  ```typescript
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');  // '20241130'
  const { count } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .like('number', `${date}-${creator.department}%`);

  const sequence = String((count || 0) + 1).padStart(4, '0');  // '0001', '0002', ...
  const reportNumber = `${date}-${creator.department}-${sequence}`;
  ```
- **Código:** `src/lib/supabase.ts:239-247`

#### Regra: Unicidade do Número
- **Descrição:** Cada número de laudo é único no sistema
- **Implementação:** Constraint UNIQUE na tabela `reports.number`

---

### 9.4. Status de Laudos

#### Regra: Status Inicial
- **Descrição:** Ao criar um laudo:
  - Se `assignedTo` é fornecido → status = `RECEIVED`
  - Se `assignedTo` é null → status = `PENDING`
- **Código:** `src/lib/supabase.ts:254`

#### Regra: Transições de Status
**Permitidas:**
```
PENDING → RECEIVED (quando atribuído)
RECEIVED → IN_PROGRESS (quando policial inicia)
IN_PROGRESS → COMPLETED (quando finalizado)

PENDING → CANCELLED (cancelamento)
RECEIVED → CANCELLED (cancelamento)
IN_PROGRESS → CANCELLED (cancelamento)
```

**Não Permitidas:**
```
COMPLETED → qualquer outro status (laudo finalizado não pode voltar)
CANCELLED → qualquer outro status (laudo cancelado não pode voltar)
```

#### Regra: Status e Assigned To
- **Descrição:** Se `status = RECEIVED, IN_PROGRESS ou COMPLETED`, então `assigned_to` NÃO pode ser NULL
- **Implementação:** Validação na aplicação (não há constraint no DB)

---

### 9.5. Atribuição de Laudos

#### Regra: Apenas Agentes Atribuem
- **Descrição:** Apenas usuários com role AGENT podem atribuir laudos
- **Implementação:** Policy RLS `"Agents can update any report"`

#### Regra: Atribuição Completa
- **Descrição:** Ao atribuir um laudo, deve-se:
  1. Setar `assigned_to` = ID do policial
  2. Setar `assigned_at` = timestamp atual
  3. Mudar `status` para `RECEIVED`
  4. Criar log de auditoria
- **Código:** `src/lib/supabase.ts:335-368`

#### Regra: Reatribuição
- **Descrição:** Um laudo pode ser reatribuído para outro policial
- **Comportamento:**
  - Sobrescreve `assigned_to`
  - Atualiza `assigned_at`
  - Cria novo log de auditoria

---

### 9.6. Auditoria

#### Regra: Auditoria Obrigatória
- **Descrição:** Toda ação importante em um laudo deve gerar log de auditoria
- **Ações Auditadas:**
  - `CREATED` - Laudo criado
  - `UPDATED` - Laudo atualizado
  - `ASSIGNED` - Laudo atribuído
  - `CANCELLED` - Laudo cancelado

#### Regra: Dados do Log
- **Campos Obrigatórios:**
  - `report_id` - ID do laudo
  - `action` - Ação realizada
  - `user_id` - ID do usuário
  - `user_name` - Nome do usuário (desnormalizado)
  - `timestamp` - Data/hora (automático)
- **Campo Opcional:**
  - `details` - Detalhes adicionais da ação

#### Regra: Desnormalização do Nome
- **Descrição:** O campo `user_name` é desnormalizado propositalmente
- **Justificativa:** Preservar histórico mesmo se o nome do usuário mudar no profile
- **Implementação:** Busca o nome do profile no momento da criação do log

---

### 9.7. Fotos de Veículos

#### Regra: Partes Obrigatórias
- **Descrição:** Sistema espera fotos de 10 partes específicas do veículo
- **Partes:**
  1. Placa
  2. Chassi
  3. Motor
  4. Vidros
  5. Etiquetas
  6. Painel
  7. Laterais
  8. Frente
  9. Traseira
  10. Rodas

**Nota:** A obrigatoriedade é validada no frontend, não há constraint no DB.

#### Regra: Validação de Fotos
- **Tamanho Máximo:** 10MB por foto
- **Formatos Aceitos:** JPEG, PNG, WEBP
- **Implementação:** Validação no frontend antes do upload

---

### 9.8. Análise de Veículos

#### Regra: Análise Conclusiva
- **Descrição:** O policial deve indicar se a análise é conclusiva
- **Campo:** `analysis_is_conclusive` (boolean)

#### Regra: Justificativa Obrigatória
- **Descrição:** Se análise NÃO é conclusiva (`analysis_is_conclusive = false`), o campo `analysis_justification` é OBRIGATÓRIO
- **Implementação:** Validação no frontend

#### Regra: Observações Opcionais
- **Descrição:** Campo `analysis_observations` é sempre opcional
- **Uso:** Informações adicionais relevantes

---

### 9.9. Relatórios Atrasados

#### Regra: Definição de Atraso
- **Descrição:** Um laudo é considerado atrasado se:
  - `assigned_at` < 3 dias atrás
  - E `status` ≠ `COMPLETED`
- **Implementação:** `src/lib/supabase.ts:489-496`

#### Regra: Contagem de Atrasados
- **Query:**
  ```typescript
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { count: overdue } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .lt('assigned_at', threeDaysAgo.toISOString())
    .neq('status', 'COMPLETED');
  ```

---

### 9.10. Permissões Resumidas

| Ação | AGENT | OFFICER |
|------|-------|---------|
| Criar laudo | ✅ | ❌ |
| Ver todos os laudos | ✅ | ❌ (só os seus) |
| Ver laudos atribuídos a ele | N/A | ✅ |
| Atribuir laudo | ✅ | ❌ |
| Editar qualquer laudo | ✅ | ❌ (só os seus) |
| Editar laudo atribuído a ele | N/A | ✅ |
| Cancelar laudo | ✅ | ❌ |
| Upload de fotos | ✅ | ✅ (só em seus laudos) |
| Ver audit log | ✅ | ✅ (dos laudos acessíveis) |
| Criar usuário | ✅ | ❌ |
| Editar usuário | ✅ | ❌ |
| Gerenciar roles | ✅ | ❌ |

---

## 10. Endpoints/Serviços

### Conceito
No Supabase, não há "endpoints REST" tradicionais. O acesso aos dados é feito através da biblioteca `supabase-js` que faz queries diretamente no banco via PostgREST. As regras de negócio ficam na aplicação (frontend/serviços) e as permissões são garantidas pelo RLS.

### 10.1. AuthService

#### `login(credentials)`
**Descrição:** Autentica usuário no sistema.

**Parâmetros:**
```typescript
{
  username: string,      // Username do usuário
  password: string,      // Senha atual
  newPassword?: string   // Nova senha (se must_change_password)
}
```

**Fluxo:**
1. Tenta autenticar com `signInWithPassword(email: username, password)`
2. Se falha e `newPassword` foi fornecido:
   - Atualiza senha com `updateUser({ password: newPassword })`
   - Seta `must_change_password = false`
3. Busca dados do perfil e roles
4. Verifica `must_change_password`:
   - Se true e sem `newPassword` → lança erro `MUST_CHANGE_PASSWORD`
5. Atualiza `last_login`
6. Retorna usuário completo + token

**Retorno:**
```typescript
{
  user: User,
  token: string
}
```

**Códigos de Erro:**
- `MUST_CHANGE_PASSWORD` - Precisa trocar senha
- Erros do Supabase Auth (invalid credentials, etc)

---

#### `logout()`
**Descrição:** Desloga usuário do sistema.

**Fluxo:**
1. Chama `supabase.auth.signOut()`
2. Limpa sessão local

**Retorno:** void

---

#### `getCurrentUser()`
**Descrição:** Retorna usuário autenticado atual.

**Fluxo:**
1. Busca usuário da sessão com `getUser()`
2. Se não autenticado → retorna null
3. Busca perfil e roles do banco
4. Retorna usuário completo

**Retorno:** `User | null`

---

### 10.2. ReportService

#### `getReports(userId?)`
**Descrição:** Lista laudos. Se `userId` fornecido, filtra por atribuição.

**Parâmetros:**
- `userId` (opcional) - UUID do policial

**Fluxo:**
1. Query na tabela `reports` com joins:
   - `profiles` (created_by e assigned_to)
   - `report_audit_log`
   - `vehicle_photos`
2. Se `userId` fornecido → filtra `assigned_to = userId`
3. Ordena por `created_at DESC`
4. RLS filtra automaticamente baseado na role:
   - AGENT → vê todos
   - OFFICER → vê apenas atribuídos a ele

**Retorno:** `Report[]`

---

#### `getReportById(id)`
**Descrição:** Busca um laudo específico por ID.

**Parâmetros:**
- `id` - UUID do laudo

**Fluxo:**
1. Query com joins (audit log, fotos)
2. RLS valida acesso automaticamente

**Retorno:** `Report | null`

---

#### `createReport(reportData, createdBy)`
**Descrição:** Cria um novo laudo.

**Parâmetros:**
```typescript
{
  priority: Priority,
  location: {
    address: string,
    city: string,
    state: string
  },
  vehicle: {
    plate: string,
    isCloned?: boolean
  },
  assignedTo?: string  // UUID do policial
}
```

**Fluxo:**
1. Busca departamento do criador
2. Gera número do laudo (data + dept + sequencial)
3. Define status:
   - Se `assignedTo` → `RECEIVED`
   - Senão → `PENDING`
4. Insere no banco
5. Cria log de auditoria `CREATED`
6. Retorna laudo completo

**Retorno:** `Report`

**Permissão:** Apenas AGENTS (via RLS)

---

#### `updateReport(id, updates, userId)`
**Descrição:** Atualiza um laudo existente.

**Parâmetros:**
- `id` - UUID do laudo
- `updates` - Objeto com campos a atualizar (partial)
- `userId` - UUID do usuário que está atualizando

**Fluxo:**
1. Busca nome do usuário
2. Monta objeto de atualização (mapeia campos)
3. Atualiza no banco
4. Cria log de auditoria `UPDATED`
5. Retorna laudo atualizado

**Retorno:** `Report`

**Permissão:**
- AGENTS → qualquer laudo
- OFFICERS → apenas seus laudos
(via RLS)

---

#### `assignReport(reportId, officerId, agentId)`
**Descrição:** Atribui um laudo a um policial.

**Parâmetros:**
- `reportId` - UUID do laudo
- `officerId` - UUID do policial que receberá
- `agentId` - UUID do agente fazendo a atribuição

**Fluxo:**
1. Busca nomes do agente e policial
2. Atualiza laudo:
   - `assigned_to = officerId`
   - `assigned_at = now()`
   - `status = RECEIVED`
3. Cria log de auditoria `ASSIGNED`
4. Retorna laudo atualizado

**Retorno:** `Report`

**Permissão:** Apenas AGENTS (validado na aplicação)

---

#### `cancelReport(reportId, agentId, reason)`
**Descrição:** Cancela um laudo.

**Parâmetros:**
- `reportId` - UUID do laudo
- `agentId` - UUID do agente cancelando
- `reason` - Motivo do cancelamento

**Fluxo:**
1. Busca nome do agente
2. Atualiza `status = CANCELLED`
3. Cria log de auditoria `CANCELLED` com motivo
4. Retorna laudo atualizado

**Retorno:** `Report`

**Permissão:** Apenas AGENTS (validado na aplicação)

---

### 10.3. OfficerService

#### `getOfficers()`
**Descrição:** Lista todos os policiais ativos.

**Fluxo:**
1. Query em `profiles` com join em `user_roles`
2. Filtra `user_roles.role = OFFICER`
3. Filtra `is_active = true`

**Retorno:** `User[]`

**Permissão:** Qualquer usuário autenticado (via RLS)

---

#### `createOfficer(data)`
**Descrição:** Cria um novo policial.

**Parâmetros:**
```typescript
{
  username: string,
  email: string,
  name: string,
  department: Department,
  badge: string,
  role: UserRole,
  isActive: boolean,
  mustChangePassword: boolean
}
```

**Fluxo:**
1. Chama Edge Function `create-officer`
2. Edge Function:
   - Cria user no Auth
   - Cria profile
   - Cria role
   - Rollback se qualquer etapa falhar

**Retorno:** `User`

**Permissão:** Apenas AGENTS (validado na Edge Function)

---

#### `updateOfficer(id, updates)`
**Descrição:** Atualiza dados de um policial.

**Parâmetros:**
- `id` - UUID do policial
- `updates` - Campos a atualizar (name, email, department, badge, isActive)

**Fluxo:**
1. Atualiza na tabela `profiles`
2. Retorna perfil atualizado com roles

**Retorno:** `User`

**Permissão:** Apenas AGENTS (via RLS + validação de aplicação)

---

### 10.4. DashboardService

#### `getStats(userId?)`
**Descrição:** Retorna estatísticas de laudos.

**Parâmetros:**
- `userId` (opcional) - Se fornecido, estatísticas do policial específico

**Fluxo:**
1. Conta total de reports (filtrado por userId se fornecido)
2. Conta por status (PENDING, IN_PROGRESS, COMPLETED)
3. Conta atrasados (assigned_at < 3 dias e não COMPLETED)
4. Retorna objeto com estatísticas

**Retorno:**
```typescript
{
  totalReports: number,
  pendingReports: number,
  inProgressReports: number,
  completedReports: number,
  overdueReports: number,
  myReports?: number  // se userId fornecido
}
```

**Permissão:** Qualquer usuário autenticado

---

## 11. Edge Functions

### Conceito
Edge Functions são funções serverless que rodam no edge (próximo ao usuário) usando Deno. Têm acesso completo ao banco via SERVICE_ROLE_KEY e podem executar operações administrativas.

---

### 11.1. Edge Function: `create-officer`

**Arquivo:** `supabase/functions/create-officer/index.ts`

**Descrição:** Cria um novo usuário (officer ou agent) no sistema.

**Método:** POST

**Corpo da Requisição:**
```json
{
  "username": "officer.traffic1",
  "email": "officer.traffic1@policia.ba.gov.br",
  "name": "Roberto Ferreira Lima",
  "department": "TRAFFIC",
  "badge": "OFF-TRA-101",
  "role": "OFFICER",
  "isActive": true,
  "mustChangePassword": true
}
```

**Fluxo:**
1. Valida CORS (OPTIONS request)
2. Cria cliente Supabase com SERVICE_ROLE_KEY
3. Cria usuário no Auth:
   - Email fornecido
   - Senha temporária: `temporaryPassword123`
   - Email confirmado automaticamente
   - Metadata: name, username
4. Cria profile:
   - ID = ID do auth user
   - Todos os campos fornecidos
5. Se profile falha:
   - Deleta auth user (rollback)
   - Retorna erro
6. Cria role:
   - Associa user_id com role
7. Se role falha:
   - Deleta auth user e profile (rollback)
   - Retorna erro
8. Retorna usuário criado com sucesso

**Resposta de Sucesso:**
```json
{
  "id": "uuid",
  "username": "officer.traffic1",
  "email": "officer.traffic1@policia.ba.gov.br",
  "name": "Roberto Ferreira Lima",
  "role": "OFFICER",
  "department": "TRAFFIC",
  "badge": "OFF-TRA-101",
  "isActive": true,
  "mustChangePassword": true,
  "createdAt": "2024-11-30T12:00:00Z"
}
```

**Resposta de Erro:**
```json
{
  "error": "mensagem de erro"
}
```

**Status Codes:**
- 200 - Sucesso
- 400 - Erro de validação ou criação

**Segurança:**
- Acesso via SERVICE_ROLE_KEY (bypass RLS)
- CORS configurado para aceitar qualquer origem (development)
- Rollback automático em caso de falha

---

### 11.2. Edge Function: `seed-database`

**Arquivo:** `supabase/functions/seed-database/index.ts`

**Descrição:** Popula ou limpa o banco de dados com usuários de teste.

**Método:** POST

**Corpo da Requisição:**
```json
{
  "action": "seed" | "clear" | "list"
}
```

**Ações:**

#### Action: `seed`
- **Descrição:** Cria 8 usuários de teste (3 agents + 5 officers)
- **Comportamento:**
  - Verifica se usuário já existe (by email)
  - Se existe → pula (skipped)
  - Se não existe → cria (created)
  - Em caso de erro → registra e continua (error)
- **Resposta:**
  ```json
  {
    "success": true,
    "created": 8,
    "skipped": 0,
    "errors": [],
    "users": [
      {
        "username": "agent.traffic",
        "email": "agent.traffic@policia.ba.gov.br",
        "role": "AGENT",
        "status": "created"
      },
      ...
    ]
  }
  ```

#### Action: `clear`
- **Descrição:** Remove TODOS os usuários do banco
- **Comportamento:**
  - Lista todos os profiles
  - Para cada um, deleta o auth user (cascade deleta profile e roles)
- **Resposta:**
  ```json
  {
    "success": true,
    "deleted": 8,
    "errors": []
  }
  ```

#### Action: `list`
- **Descrição:** Lista todos os usuários do banco
- **Resposta:**
  ```json
  [
    {
      "id": "uuid",
      "username": "agent.traffic",
      "email": "agent.traffic@policia.ba.gov.br",
      "name": "Carlos Silva Santos",
      "role": "AGENT",
      "department": "TRAFFIC",
      "badge": "AGENT-TRA-001",
      "isActive": true
    },
    ...
  ]
  ```

**Status Codes:**
- 200 - Sucesso
- 400 - Erro de validação ou action inválida

**Usuários Criados:**
Ver seção [Regras de Negócio - Seed Database](#seed-database-users) para lista completa.

---

## 12. Fluxos de Trabalho

### 12.1. Fluxo Completo: Criar e Executar Laudo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. AGENTE CRIA LAUDO                                                        │
└─────────────────────────────────────────────────────────────────────────────┘

1.1. Agente faz login
     ├─> AuthService.login(username, password)
     └─> Retorna User com role=AGENT

1.2. Agente acessa dashboard
     ├─> DashboardService.getStats()
     └─> Mostra estatísticas gerais

1.3. Agente clica "Novo Laudo"
     └─> Abre formulário

1.4. Agente preenche dados básicos:
     ├─> Prioridade (HIGH, MEDIUM, LOW)
     ├─> Localização (endereço, cidade, estado)
     ├─> Dados iniciais do veículo (placa)
     └─> Opcionalmente: atribuir a um policial

1.5. Agente submete formulário
     ├─> ReportService.createReport(data, agentId)
     ├─> Backend gera número: "20241130-TRAFFIC-0001"
     ├─> Status: PENDING (ou RECEIVED se atribuído)
     ├─> Cria audit log: CREATED
     └─> Retorna laudo criado

┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. AGENTE ATRIBUI LAUDO (se não atribuiu na criação)                       │
└─────────────────────────────────────────────────────────────────────────────┘

2.1. Agente acessa lista de laudos
     ├─> ReportService.getReports()
     └─> Mostra todos os laudos (RLS: agente vê todos)

2.2. Agente seleciona laudo PENDING
     └─> Abre detalhes

2.3. Agente clica "Atribuir"
     └─> Mostra lista de policiais

2.4. Agente seleciona policial
     ├─> OfficerService.getOfficers()
     └─> Lista policiais ativos

2.5. Agente confirma atribuição
     ├─> ReportService.assignReport(reportId, officerId, agentId)
     ├─> Atualiza:
     │   ├─> assigned_to = officerId
     │   ├─> assigned_at = now()
     │   └─> status = RECEIVED
     ├─> Cria audit log: ASSIGNED
     └─> Notifica policial (opcional)

┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. POLICIAL EXECUTA LAUDO                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

3.1. Policial faz login
     ├─> AuthService.login(username, password)
     └─> Retorna User com role=OFFICER

3.2. Policial acessa dashboard
     ├─> DashboardService.getStats(userId)
     └─> Mostra estatísticas pessoais

3.3. Policial acessa "Laudos Recebidos"
     ├─> ReportService.getReports(userId)
     └─> Mostra apenas laudos atribuídos a ele (RLS)

3.4. Policial seleciona laudo RECEIVED
     └─> Abre detalhes

3.5. Policial clica "Iniciar Trabalho"
     ├─> ReportService.updateReport(id, { status: 'IN_PROGRESS' }, userId)
     ├─> Atualiza status = IN_PROGRESS
     ├─> Cria audit log: UPDATED
     └─> Retorna laudo atualizado

3.6. Policial vai para local indicado
     └─> Usa endereço do laudo

3.7. Policial preenche dados do veículo:
     ├─> Chassi
     ├─> Motor
     ├─> Cor
     ├─> Marca/Modelo/Ano
     └─> Se é clonado

     ├─> ReportService.updateReport(id, { vehicle: {...} }, userId)
     └─> Salva periodicamente

3.8. Policial faz fotos das 10 partes:
     ├─> Para cada parte:
     │   ├─> Tira foto
     │   ├─> Upload para Storage
     │   └─> Insere em vehicle_photos (report_id, part, photo_url)
     └─> RLS: policial pode inserir fotos de seus laudos

3.9. Policial preenche análise:
     ├─> Análise é conclusiva? (sim/não)
     ├─> Se não: justificativa (obrigatória)
     └─> Observações (opcional)

3.10. Policial finaliza laudo:
      ├─> ReportService.updateReport(id, {
      │     status: 'COMPLETED',
      │     analysis: {...}
      │   }, userId)
      ├─> Atualiza status = COMPLETED
      ├─> Cria audit log: UPDATED
      └─> Retorna laudo completo

┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. AGENTE VISUALIZA LAUDO FINALIZADO                                        │
└─────────────────────────────────────────────────────────────────────────────┘

4.1. Agente acessa lista de laudos
     ├─> ReportService.getReports()
     └─> Filtra status = COMPLETED

4.2. Agente seleciona laudo
     ├─> ReportService.getReportById(id)
     └─> Vê todos os detalhes:
         ├─> Dados do veículo
         ├─> Fotos
         ├─> Análise
         └─> Histórico (audit log)
```

---

### 12.2. Fluxo: Primeiro Login (Troca de Senha)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PRIMEIRO LOGIN COM TROCA DE SENHA OBRIGATÓRIA                              │
└─────────────────────────────────────────────────────────────────────────────┘

1. Usuário acessa tela de login

2. Usuário insere credenciais:
   ├─> Username: "officer.traffic1"
   └─> Password: "senha123" (senha temporária)

3. Usuário clica "Entrar"
   └─> Frontend chama: AuthService.login({ username, password })

4. Backend tenta autenticar:
   ├─> supabase.auth.signInWithPassword({ email: username, password })
   └─> Sucesso (credenciais válidas)

5. Backend busca profile:
   └─> SELECT * FROM profiles WHERE id = auth.uid()

6. Backend verifica must_change_password:
   ├─> profile.must_change_password = true
   └─> Lança erro: 'MUST_CHANGE_PASSWORD'

7. Frontend captura erro:
   ├─> Detecta 'MUST_CHANGE_PASSWORD'
   └─> Mostra campo "Nova Senha"

8. Usuário insere nova senha:
   └─> newPassword: "minhaSenhaSegura123"

9. Usuário clica "Alterar Senha"
   └─> Frontend chama: AuthService.login({
         username,
         password: "senha123",
         newPassword: "minhaSenhaSegura123"
       })

10. Backend tenta autenticar novamente:
    └─> Sucesso (mesmas credenciais)

11. Backend detecta newPassword:
    ├─> Chama: supabase.auth.updateUser({ password: newPassword })
    └─> Senha alterada no Auth

12. Backend atualiza profile:
    ├─> UPDATE profiles SET must_change_password = false
    └─> Usuário não precisará trocar senha no próximo login

13. Backend continua login normal:
    ├─> Busca profile e roles
    ├─> Atualiza last_login
    └─> Retorna user + token

14. Frontend redireciona:
    ├─> Se AGENT → /agent/dashboard
    └─> Se OFFICER → /officer/dashboard
```

---

### 12.3. Fluxo: Cancelamento de Laudo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CANCELAMENTO DE LAUDO POR AGENTE                                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. Agente acessa lista de laudos
   └─> ReportService.getReports()

2. Agente seleciona laudo a cancelar
   └─> Laudo pode estar em qualquer status exceto COMPLETED ou CANCELLED

3. Agente clica "Cancelar Laudo"
   └─> Abre modal de confirmação

4. Agente insere motivo do cancelamento:
   └─> Exemplo: "Veículo não encontrado no local indicado"

5. Agente confirma cancelamento:
   └─> ReportService.cancelReport(reportId, agentId, reason)

6. Backend processa:
   ├─> Busca nome do agente
   ├─> Atualiza: status = CANCELLED
   ├─> Cria audit log:
   │   ├─> action: CANCELLED
   │   └─> details: "Laudo cancelado: {reason}"
   └─> Retorna laudo cancelado

7. Frontend atualiza UI:
   └─> Laudo aparece como cancelado na lista

8. Policial (se atribuído) vê status:
   └─> Laudo não aparece mais como pendente
```

---

## 13. Validações

### 13.1. Validações de Frontend

Estas validações são feitas no frontend ANTES de enviar dados ao backend.

#### Placa de Veículo
```typescript
PLATE_PATTERN = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/

Exemplos válidos:
- ABC1234 (padrão antigo)
- ABC1D23 (padrão Mercosul)

Exemplos inválidos:
- abc1234 (minúsculas)
- AB1234 (apenas 2 letras)
- ABCD123 (4 letras)
```

#### Chassi
```typescript
MIN_LENGTH = 17

Regra:
- Mínimo 17 caracteres
- Alfanumérico
```

#### Fotos
```typescript
MAX_FILE_SIZE = 10 * 1024 * 1024  // 10MB
ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
MIN_PHOTOS_PER_PART = 1
MAX_PHOTOS_PER_PART = 5

Regras:
- Cada parte do veículo deve ter pelo menos 1 foto
- Cada parte pode ter no máximo 5 fotos
- Cada foto deve ter no máximo 10MB
- Apenas formatos JPEG, PNG e WEBP
```

#### Análise Não Conclusiva
```typescript
if (analysis_is_conclusive === false) {
  // analysis_justification é OBRIGATÓRIO
  if (!analysis_justification || analysis_justification.trim() === '') {
    throw new Error('Justificativa é obrigatória quando análise não é conclusiva');
  }
}
```

#### Senha
```typescript
// Primeira troca de senha
MIN_PASSWORD_LENGTH = 8

Regras:
- Mínimo 8 caracteres
- Sem outras restrições específicas (depende do Supabase Auth)
```

---

### 13.2. Validações de Banco de Dados

#### Constraints

**profiles.username**
```sql
UNIQUE CONSTRAINT
- Não pode haver dois usuários com mesmo username
```

**reports.number**
```sql
UNIQUE CONSTRAINT
- Não pode haver dois laudos com mesmo número
```

**user_roles (user_id, role)**
```sql
UNIQUE CONSTRAINT
- Um usuário não pode ter a mesma role duplicada
```

#### Foreign Keys
Todas as FKs têm validação automática:
- Não pode inserir report com `created_by` inexistente
- Não pode inserir report com `assigned_to` inexistente
- Não pode inserir audit log com `report_id` inexistente
- etc.

---

### 13.3. Validações de Negócio (Backend)

#### Verificação de Role
```typescript
// Antes de operações restritas
const isAgent = await has_role(userId, 'AGENT');
if (!isAgent) {
  throw new Error('Apenas agentes podem realizar esta operação');
}
```

#### Status Transition Validation
```typescript
// Exemplo: Não pode voltar de COMPLETED
if (currentStatus === 'COMPLETED' && newStatus !== 'COMPLETED') {
  throw new Error('Laudo finalizado não pode ter status alterado');
}

// Exemplo: CANCELLED é final
if (currentStatus === 'CANCELLED') {
  throw new Error('Laudo cancelado não pode ser modificado');
}
```

#### Assigned To Validation
```typescript
// Se status é RECEIVED, IN_PROGRESS ou COMPLETED, assigned_to é obrigatório
if (['RECEIVED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
  if (!assigned_to) {
    throw new Error('Laudo neste status deve estar atribuído a um policial');
  }
}
```

---

## 14. Auditoria

### 14.1. Tabela de Auditoria

**Tabela:** `report_audit_log`

**Propósito:** Registrar todas as ações importantes realizadas em laudos.

**Campos:**
- `id` - ID único do log
- `report_id` - ID do laudo
- `action` - Tipo de ação
- `user_id` - Quem fez
- `user_name` - Nome de quem fez (desnormalizado)
- `details` - Detalhes opcionais
- `timestamp` - Quando foi feito (automático)

---

### 14.2. Ações Auditadas

#### CREATED
- **Quando:** Laudo é criado
- **Quem:** Agente criador
- **Details:** "Laudo criado"

#### UPDATED
- **Quando:** Qualquer campo do laudo é atualizado
- **Quem:** Usuário que atualizou
- **Details:** "Laudo atualizado"

**Nota:** Não registra quais campos foram alterados (pode ser melhorado).

#### ASSIGNED
- **Quando:** Laudo é atribuído a um policial
- **Quem:** Agente que atribuiu
- **Details:** "Laudo atribuído para {nome_do_policial}"

#### CANCELLED
- **Quando:** Laudo é cancelado
- **Quem:** Agente que cancelou
- **Details:** "Laudo cancelado: {motivo}"

---

### 14.3. Como Consultar Audit Trail

**Query Básica:**
```sql
SELECT
  al.action,
  al.user_name,
  al.details,
  al.timestamp
FROM report_audit_log al
WHERE al.report_id = 'uuid-do-laudo'
ORDER BY al.timestamp ASC;
```

**Via Serviço (Frontend):**
```typescript
const report = await ReportService.getReportById(id);
console.log(report.auditLog);  // Array de AuditEntry
```

**Exemplo de Resultado:**
```json
[
  {
    "id": "log-1",
    "action": "CREATED",
    "userId": "agent-uuid",
    "userName": "Carlos Silva Santos",
    "timestamp": "2024-11-30T10:00:00Z",
    "details": "Laudo criado"
  },
  {
    "id": "log-2",
    "action": "ASSIGNED",
    "userId": "agent-uuid",
    "userName": "Carlos Silva Santos",
    "timestamp": "2024-11-30T10:05:00Z",
    "details": "Laudo atribuído para Roberto Ferreira Lima"
  },
  {
    "id": "log-3",
    "action": "UPDATED",
    "userId": "officer-uuid",
    "userName": "Roberto Ferreira Lima",
    "timestamp": "2024-11-30T14:30:00Z",
    "details": "Laudo atualizado"
  },
  {
    "id": "log-4",
    "action": "UPDATED",
    "userId": "officer-uuid",
    "userName": "Roberto Ferreira Lima",
    "timestamp": "2024-11-30T16:00:00Z",
    "details": "Laudo atualizado"
  }
]
```

---

## 📚 Apêndices

### A. Seed Database Users

Usuários criados pela Edge Function `seed-database`:

**Agentes:**
| Username | Email | Nome | Departamento | Badge | Senha |
|----------|-------|------|--------------|-------|-------|
| agent.traffic | agent.traffic@policia.ba.gov.br | Carlos Silva Santos | TRAFFIC | AGENT-TRA-001 | senha123 |
| agent.criminal | agent.criminal@policia.ba.gov.br | Maria Oliveira Costa | CRIMINAL | AGENT-CRI-001 | senha123 |
| agent.admin | agent.admin@policia.ba.gov.br | João Pedro Almeida | ADMINISTRATIVE | AGENT-ADM-001 | senha123 |

**Policiais:**
| Username | Email | Nome | Departamento | Badge | Senha |
|----------|-------|------|--------------|-------|-------|
| officer.traffic1 | officer.traffic1@policia.ba.gov.br | Roberto Ferreira Lima | TRAFFIC | OFF-TRA-101 | senha123 |
| officer.traffic2 | officer.traffic2@policia.ba.gov.br | Ana Paula Souza | TRAFFIC | OFF-TRA-102 | senha123 |
| officer.criminal1 | officer.criminal1@policia.ba.gov.br | Fernando Santos Rocha | CRIMINAL | OFF-CRI-101 | senha123 |
| officer.criminal2 | officer.criminal2@policia.ba.gov.br | Juliana Martins Pereira | CRIMINAL | OFF-CRI-102 | senha123 |
| officer.admin1 | officer.admin1@policia.ba.gov.br | Patricia Ribeiro Dias | ADMINISTRATIVE | OFF-ADM-101 | senha123 |

---

### B. Extensões do PostgreSQL Necessárias

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- Para uuid_generate_v4()
```

---

### C. Índices Recomendados (Não Implementados)

Para melhor performance em queries comuns:

```sql
-- Index para buscar laudos por policial
CREATE INDEX idx_reports_assigned_to ON public.reports(assigned_to)
WHERE assigned_to IS NOT NULL;

-- Index para buscar laudos por status
CREATE INDEX idx_reports_status ON public.reports(status);

-- Index para buscar laudos por data de criação
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);

-- Index para buscar laudos atrasados
CREATE INDEX idx_reports_assigned_at ON public.reports(assigned_at)
WHERE status != 'COMPLETED';

-- Index para audit logs por report
CREATE INDEX idx_audit_log_report_id ON public.report_audit_log(report_id);

-- Index para fotos por report
CREATE INDEX idx_vehicle_photos_report_id ON public.vehicle_photos(report_id);
```

---

### D. Melhorias Futuras Sugeridas

1. **Audit Log Detalhado**
   - Adicionar campos `old_value` e `new_value` no audit log
   - Registrar exatamente quais campos foram alterados

2. **Soft Delete**
   - Ao invés de deletar laudos, marcar como deletados
   - Adicionar campo `deleted_at`

3. **Notificações**
   - Notificar policial quando laudo é atribuído
   - Notificar agente quando laudo é finalizado

4. **Relatórios Estatísticos**
   - Dashboard com gráficos
   - Relatórios por período
   - Exportação para PDF

5. **Upload de Arquivos Adicional**
   - Permitir anexar documentos (PDFs, etc)
   - Não apenas fotos

6. **Versionamento de Laudos**
   - Manter histórico completo de todas as versões do laudo

7. **Permissões Granulares**
   - Níveis de acesso mais refinados
   - Agentes supervisores vs. agentes comuns

8. **Multi-tenancy**
   - Suporte para múltiplas unidades/delegacias

---

## 🏁 Conclusão

Esta documentação fornece uma especificação completa do backend do Sistema de Laudos Policiais. Use-a como referência para reimplementar o sistema em qualquer linguagem ou framework, mantendo a mesma lógica de negócio e estrutura de dados.

**Pontos Críticos de Atenção:**
1. ✅ Implemente TODAS as políticas RLS - são fundamentais para segurança
2. ✅ Mantenha a função `has_role()` como SECURITY DEFINER
3. ✅ Sempre crie audit logs para ações importantes
4. ✅ Valide transições de status
5. ✅ Implemente rollback em operações transacionais (ex: criar usuário)
6. ✅ Desnormalize `user_name` nos audit logs para preservar histórico

**Contato:**
Para dúvidas ou esclarecimentos sobre esta documentação, consulte os arquivos fonte do projeto.

---

**Última Atualização:** 2024-11-30
**Versão:** 1.0
**Autor:** Documentação gerada via análise do código Supabase
