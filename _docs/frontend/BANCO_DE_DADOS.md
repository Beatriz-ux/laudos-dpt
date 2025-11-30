# Documentação do Banco de Dados

## Visão Geral

O sistema utiliza PostgreSQL através do Supabase. O banco possui 5 tabelas principais com relacionamentos bem definidos e Row Level Security (RLS) configurado.

---

## Diagrama ER

```
┌─────────────────────┐
│      profiles       │
│─────────────────────│
│ id (PK)            │◄────┐
│ username           │     │
│ email              │     │
│ name               │     │
│ department         │     │
│ badge              │     │
│ is_active          │     │
│ must_change_pwd    │     │
│ last_login         │     │
│ created_at         │     │
│ updated_at         │     │
└─────────────────────┘     │
         △                  │
         │                  │
         │                  │
┌────────┴────────┐         │
│   user_roles    │         │
│─────────────────│         │
│ id (PK)        │         │
│ user_id (FK)   │         │
│ role           │         │
└─────────────────┘         │
                            │
                            │
┌─────────────────────┐     │
│      reports        │     │
│─────────────────────│     │
│ id (PK)            │     │
│ number (UNIQUE)    │     │
│ status             │     │
│ priority           │     │
│ created_by (FK)    ├─────┘
│ assigned_to (FK)   ├─────┐
│ assigned_at        │     │
│ location_*         │     │
│ vehicle_*          │     │
│ analysis_*         │     │
│ created_at         │     │
│ updated_at         │     │
└─────────────────────┘     │
         △                  │
         │                  │
         ├─────────────┬────┘
         │             │
┌────────┴────────┐   │
│ report_audit_log│   │
│─────────────────│   │
│ id (PK)        │   │
│ report_id (FK) │   │
│ action         │   │
│ user_id (FK)   ├───┘
│ user_name      │
│ timestamp      │
│ details        │
└─────────────────┘
         │
         │
┌────────┴────────┐
│ vehicle_photos  │
│─────────────────│
│ id (PK)        │
│ report_id (FK) │
│ part           │
│ photo_url      │
│ created_at     │
└─────────────────┘
```

---

## Tabelas

### profiles

**Descrição**: Perfis de usuários do sistema

**Campos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | uuid | Sim | ID do usuário (FK para auth.users) |
| username | text | Sim | Nome de usuário único |
| email | text | Sim | Email único |
| name | text | Sim | Nome completo |
| department | enum | Sim | TRAFFIC, CRIMINAL, ADMINISTRATIVE |
| badge | text | Sim | Matrícula/Placa |
| is_active | boolean | Sim | Usuário ativo (padrão: true) |
| must_change_password | boolean | Sim | Deve trocar senha (padrão: true) |
| last_login | timestamptz | Não | Último login |
| created_at | timestamptz | Sim | Data de criação |
| updated_at | timestamptz | Sim | Data de atualização |

**Constraints**:
- PK: id
- UNIQUE: username
- UNIQUE: email
- UNIQUE: badge
- FK: id → auth.users(id)

**Índices**:
- username (para busca rápida)
- email (para busca rápida)
- badge (para busca rápida)

**RLS**:
- SELECT: Apenas próprio perfil ou se for AGENT
- UPDATE: Apenas próprio perfil
- INSERT: Apenas via Edge Function
- DELETE: Negado

**Exemplo**:
```sql
INSERT INTO profiles (
  id,
  username,
  email,
  name,
  department,
  badge,
  is_active,
  must_change_password
) VALUES (
  'uuid-here',
  'officer.traffic',
  'officer.traffic@police.gov',
  'João Silva',
  'TRAFFIC',
  'OFF001',
  true,
  true
);
```

---

### user_roles

**Descrição**: Roles dos usuários

**Campos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | uuid | Sim | ID do registro |
| user_id | uuid | Sim | ID do usuário |
| role | enum | Sim | AGENT ou OFFICER |

**Constraints**:
- PK: id
- FK: user_id → profiles(id) ON DELETE CASCADE
- UNIQUE: (user_id, role)

**Enums**:
```sql
CREATE TYPE app_role AS ENUM ('AGENT', 'OFFICER');
```

**RLS**:
- SELECT: Autenticado
- INSERT: Apenas via Edge Function
- UPDATE: Negado
- DELETE: Negado

**Exemplo**:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('uuid-here', 'OFFICER');
```

---

### reports

**Descrição**: Laudos periciais

**Campos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | uuid | Sim | ID do laudo |
| number | text | Sim | Número único (YYYYMMDD-DEPT-0001) |
| status | enum | Sim | Status do laudo |
| priority | enum | Sim | Prioridade (HIGH, MEDIUM, LOW) |
| created_by | uuid | Sim | ID do agente criador |
| assigned_to | uuid | Não | ID do policial atribuído |
| assigned_at | timestamptz | Não | Data de atribuição |
| location_address | text | Não | Endereço |
| location_city | text | Não | Cidade |
| location_state | text | Não | Estado (UF) |
| location_coordinates | text | Não | Coordenadas JSON |
| vehicle_plate | text | Não | Placa do veículo |
| vehicle_chassi | text | Não | Chassi |
| vehicle_motor | text | Não | Número do motor |
| vehicle_brand | text | Não | Marca |
| vehicle_model | text | Não | Modelo |
| vehicle_year | integer | Não | Ano |
| vehicle_color | text | Não | Cor |
| vehicle_is_cloned | boolean | Não | Veículo clonado |
| analysis_is_conclusive | boolean | Não | Análise conclusiva |
| analysis_justification | text | Não | Justificativa |
| analysis_observations | text | Não | Observações |
| created_at | timestamptz | Sim | Data de criação |
| updated_at | timestamptz | Sim | Data de atualização |

**Constraints**:
- PK: id
- UNIQUE: number
- FK: created_by → profiles(id)
- FK: assigned_to → profiles(id)

**Enums**:
```sql
CREATE TYPE report_status AS ENUM (
  'PENDING',
  'RECEIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE priority AS ENUM ('HIGH', 'MEDIUM', 'LOW');

CREATE TYPE department AS ENUM (
  'TRAFFIC',
  'CRIMINAL',
  'ADMINISTRATIVE'
);
```

**Índices**:
- number (UNIQUE)
- status
- created_by
- assigned_to
- created_at DESC

**RLS**:
- SELECT:
  - AGENT: Todos os laudos
  - OFFICER: Apenas laudos atribuídos a si
- INSERT: Apenas AGENT
- UPDATE:
  - AGENT: Todos os campos
  - OFFICER: Apenas laudos próprios e campos específicos
- DELETE: Negado

**Triggers**:
- updated_at atualizado automaticamente

**Exemplo**:
```sql
INSERT INTO reports (
  number,
  status,
  priority,
  created_by,
  location_address,
  location_city,
  location_state,
  vehicle_plate,
  vehicle_is_cloned
) VALUES (
  '20250129-TRAFFIC-0001',
  'PENDING',
  'HIGH',
  'agent-uuid',
  'Rua Principal, 123',
  'Ilhéus',
  'BA',
  'ABC1D23',
  false
);
```

---

### report_audit_log

**Descrição**: Log de auditoria dos laudos

**Campos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | uuid | Sim | ID do log |
| report_id | uuid | Sim | ID do laudo |
| action | text | Sim | Ação realizada |
| user_id | uuid | Sim | ID do usuário |
| user_name | text | Sim | Nome do usuário |
| timestamp | timestamptz | Sim | Data/hora da ação |
| details | text | Não | Detalhes adicionais |

**Constraints**:
- PK: id
- FK: report_id → reports(id) ON DELETE CASCADE
- FK: user_id → profiles(id)

**Índices**:
- report_id
- timestamp DESC

**RLS**:
- SELECT: Se pode ver o laudo
- INSERT: Autenticado
- UPDATE: Negado
- DELETE: Negado

**Ações Comuns**:
- CREATED
- UPDATED
- ASSIGNED
- STATUS_CHANGED
- COMPLETED
- CANCELLED

**Exemplo**:
```sql
INSERT INTO report_audit_log (
  report_id,
  action,
  user_id,
  user_name,
  details
) VALUES (
  'report-uuid',
  'ASSIGNED',
  'agent-uuid',
  'João Silva',
  'Laudo atribuído para Maria Santos'
);
```

---

### vehicle_photos

**Descrição**: Fotos das partes do veículo

**Campos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | uuid | Sim | ID da foto |
| report_id | uuid | Sim | ID do laudo |
| part | text | Sim | Parte do veículo |
| photo_url | text | Sim | URL da foto no Storage |
| created_at | timestamptz | Sim | Data de upload |

**Constraints**:
- PK: id
- FK: report_id → reports(id) ON DELETE CASCADE

**Índices**:
- report_id
- part

**RLS**:
- SELECT: Se pode ver o laudo
- INSERT: Se assigned_to do laudo é o usuário
- UPDATE: Negado
- DELETE: Se assigned_to do laudo é o usuário

**Partes do Veículo**:
- Placa
- Chassi
- Motor
- Vidros
- Etiquetas
- Painel
- Laterais
- Frente
- Traseira
- Rodas

**Exemplo**:
```sql
INSERT INTO vehicle_photos (
  report_id,
  part,
  photo_url
) VALUES (
  'report-uuid',
  'Placa',
  'https://storage.supabase.co/...'
);
```

---

## Funções do Banco

### has_role()

**Descrição**: Verifica se usuário tem determinada role

**Assinatura**:
```sql
has_role(_role app_role, _user_id uuid) RETURNS boolean
```

**Uso**:
```sql
SELECT has_role('AGENT', auth.uid());
```

---

## Views

Não há views customizadas no momento, mas podem ser criadas para:
- Relatórios estatísticos
- Laudos com status e usuários
- Auditoria detalhada

---

## Storage

### Buckets

**reports-photos**:
- Armazena fotos dos veículos
- Organização: `{report_id}/{part}/{filename}`
- Max size: 10MB por arquivo
- Tipos permitidos: image/jpeg, image/png, image/webp

**RLS no Storage**:
- Upload: Se assigned_to do laudo é o usuário
- Download: Se pode ver o laudo
- Delete: Se assigned_to do laudo é o usuário

---

## Migrations

### Estrutura de Migrations

```
supabase/migrations/
├── 20230101000000_initial_schema.sql
├── 20230102000000_add_rls_policies.sql
├── 20230103000000_create_functions.sql
└── 20230104000000_setup_storage.sql
```

### Aplicar Migrations

```bash
# Localmente
supabase migration up

# Produção
supabase db push
```

---

## Seeds

### Seed Data

Arquivo: `supabase/seed.sql`

Contém dados iniciais para desenvolvimento:
- Usuários de teste
- Laudos de exemplo
- Fotos de exemplo (URLs)

**Execução**:
```bash
# Através da Edge Function
POST /functions/v1/seed-database
{
  "action": "seed"
}

# Ou via CLI
supabase db reset
```

---

## Políticas RLS

### Políticas Principais

#### profiles

```sql
-- Ver próprio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Agents veem todos os perfis
CREATE POLICY "Agents can view all profiles"
ON profiles FOR SELECT
USING (has_role('AGENT', auth.uid()));

-- Usuários atualizam próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

#### reports

```sql
-- Agents veem todos os laudos
CREATE POLICY "Agents can view all reports"
ON reports FOR SELECT
USING (has_role('AGENT', auth.uid()));

-- Officers veem laudos atribuídos
CREATE POLICY "Officers can view assigned reports"
ON reports FOR SELECT
USING (
  has_role('OFFICER', auth.uid()) AND
  assigned_to = auth.uid()
);

-- Agents criam laudos
CREATE POLICY "Agents can create reports"
ON reports FOR INSERT
WITH CHECK (has_role('AGENT', auth.uid()));

-- Officers atualizam laudos atribuídos
CREATE POLICY "Officers can update assigned reports"
ON reports FOR UPDATE
USING (
  has_role('OFFICER', auth.uid()) AND
  assigned_to = auth.uid()
);
```

#### report_audit_log

```sql
-- Ver logs dos laudos que pode ver
CREATE POLICY "View audit logs of accessible reports"
ON report_audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE reports.id = report_audit_log.report_id
    -- RLS do reports se aplica aqui
  )
);

-- Qualquer autenticado pode inserir logs
CREATE POLICY "Authenticated users can insert audit logs"
ON report_audit_log FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

#### vehicle_photos

```sql
-- Ver fotos dos laudos que pode ver
CREATE POLICY "View photos of accessible reports"
ON vehicle_photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE reports.id = vehicle_photos.report_id
  )
);

-- Officer atribuído pode inserir fotos
CREATE POLICY "Assigned officer can insert photos"
ON vehicle_photos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM reports
    WHERE reports.id = vehicle_photos.report_id
    AND reports.assigned_to = auth.uid()
  )
);
```

---

## Queries Comuns

### Buscar laudos com usuários

```sql
SELECT
  r.*,
  creator.name as creator_name,
  assigned.name as assigned_name
FROM reports r
LEFT JOIN profiles creator ON r.created_by = creator.id
LEFT JOIN profiles assigned ON r.assigned_to = assigned.id
WHERE r.status = 'PENDING'
ORDER BY r.created_at DESC;
```

### Estatísticas de laudos

```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
  COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
  COUNT(*) as total
FROM reports
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
```

### Laudos atrasados

```sql
SELECT
  r.*,
  EXTRACT(DAY FROM NOW() - r.assigned_at) as days_assigned
FROM reports r
WHERE
  r.assigned_at IS NOT NULL
  AND r.status NOT IN ('COMPLETED', 'CANCELLED')
  AND r.assigned_at < NOW() - INTERVAL '3 days'
ORDER BY days_assigned DESC;
```

### Auditoria completa de um laudo

```sql
SELECT
  al.*,
  p.name as user_name,
  p.badge as user_badge
FROM report_audit_log al
JOIN profiles p ON al.user_id = p.id
WHERE al.report_id = 'report-uuid'
ORDER BY al.timestamp ASC;
```

---

## Backup e Restore

### Backup

```bash
# Via Supabase Dashboard
# Settings > Database > Backups

# Via pg_dump (se acesso direto)
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

### Restore

```bash
# Via Supabase Dashboard
# Settings > Database > Restore

# Via psql
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

---

## Otimizações

### Índices Recomendados

```sql
-- Busca por número do laudo
CREATE INDEX idx_reports_number ON reports(number);

-- Filtro por status
CREATE INDEX idx_reports_status ON reports(status);

-- Laudos de um usuário
CREATE INDEX idx_reports_assigned_to ON reports(assigned_to);

-- Ordenação por data
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Auditoria por laudo
CREATE INDEX idx_audit_report_id ON report_audit_log(report_id);

-- Fotos por laudo
CREATE INDEX idx_photos_report_id ON vehicle_photos(report_id);
```

### Vacuum e Analyze

Supabase executa automaticamente, mas pode ser forçado:

```sql
VACUUM ANALYZE reports;
VACUUM ANALYZE profiles;
```

---

## Monitoramento

### Query Performance

```sql
-- Queries mais lentas
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Uso de Índices

```sql
-- Índices não utilizados
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### Tamanho das Tabelas

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;
```

---

## Troubleshooting

### RLS Bloqueando Queries

```sql
-- Desabilitar RLS (apenas dev!)
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'reports';
```

### Conexões Abertas

```sql
-- Ver conexões ativas
SELECT * FROM pg_stat_activity
WHERE state = 'active';

-- Matar conexão
SELECT pg_terminate_backend(pid);
```

### Locks

```sql
-- Ver locks
SELECT * FROM pg_locks
WHERE NOT granted;
```
