# Checklist de Implementação - Backend Sistema de Laudos

> **Guia passo-a-passo** para reimplementar o backend do Sistema de Laudos Policiais em qualquer linguagem/framework.

---

## 📋 Pré-requisitos

- [ ] Escolher linguagem de programação (Python, Node.js, Java, C#, Go, etc)
- [ ] Escolher framework web (FastAPI, Express, Spring Boot, ASP.NET Core, Gin, etc)
- [ ] Escolher banco de dados (PostgreSQL recomendado)
- [ ] Escolher ORM/Query Builder (opcional mas recomendado)
- [ ] Configurar ambiente de desenvolvimento

---

## 🗃️ Fase 1: Estrutura do Banco de Dados

### 1.1. Criar Tipos Enumerados

- [ ] Criar enum `app_role` com valores: AGENT, OFFICER
- [ ] Criar enum `department` com valores: TRAFFIC, CRIMINAL, ADMINISTRATIVE
- [ ] Criar enum `report_status` com valores: PENDING, RECEIVED, IN_PROGRESS, COMPLETED, CANCELLED
- [ ] Criar enum `priority` com valores: HIGH, MEDIUM, LOW

**Referência:** `BACKEND-DOCUMENTATION.md` seção 3

---

### 1.2. Criar Tabelas Principais

- [ ] Criar tabela `auth_users` (ou usar sistema de auth existente)
  - [ ] Campo `id` (UUID, PK)
  - [ ] Campo `email` (TEXT, UNIQUE)
  - [ ] Campo `encrypted_password` (TEXT)
  - [ ] Campo `email_confirmed_at` (TIMESTAMP)
  - [ ] Campos de auditoria (created_at, updated_at)

- [ ] Criar tabela `profiles`
  - [ ] Campo `id` (UUID, PK, FK → auth_users)
  - [ ] Campo `username` (TEXT, UNIQUE, NOT NULL)
  - [ ] Campo `email` (TEXT, NOT NULL)
  - [ ] Campo `name` (TEXT, NOT NULL)
  - [ ] Campo `department` (ENUM, NOT NULL)
  - [ ] Campo `badge` (TEXT, NOT NULL)
  - [ ] Campo `is_active` (BOOLEAN, DEFAULT true)
  - [ ] Campo `must_change_password` (BOOLEAN, DEFAULT true)
  - [ ] Campo `last_login` (TIMESTAMP, NULLABLE)
  - [ ] Campos de auditoria (created_at, updated_at)
  - [ ] Constraint: FK id → auth_users(id) ON DELETE CASCADE

- [ ] Criar tabela `user_roles`
  - [ ] Campo `id` (UUID, PK)
  - [ ] Campo `user_id` (UUID, FK → profiles, NOT NULL)
  - [ ] Campo `role` (ENUM, NOT NULL)
  - [ ] Constraint: UNIQUE (user_id, role)
  - [ ] Constraint: FK user_id → profiles(id) ON DELETE CASCADE

- [ ] Criar tabela `reports`
  - [ ] Campo `id` (UUID, PK)
  - [ ] Campo `number` (TEXT, UNIQUE, NOT NULL)
  - [ ] Campo `status` (ENUM, DEFAULT 'PENDING')
  - [ ] Campo `priority` (ENUM, NOT NULL)
  - [ ] Campo `created_by` (UUID, FK → profiles, NOT NULL)
  - [ ] Campo `assigned_to` (UUID, FK → profiles, NULLABLE)
  - [ ] Campo `assigned_at` (TIMESTAMP, NULLABLE)
  - [ ] Campos de localização (location_*)
  - [ ] Campos de veículo (vehicle_*)
  - [ ] Campos de análise (analysis_*)
  - [ ] Campos de auditoria (created_at, updated_at)

- [ ] Criar tabela `report_audit_log`
  - [ ] Campo `id` (UUID, PK)
  - [ ] Campo `report_id` (UUID, FK → reports, NOT NULL)
  - [ ] Campo `action` (TEXT, NOT NULL)
  - [ ] Campo `user_id` (UUID, FK → profiles, NOT NULL)
  - [ ] Campo `user_name` (TEXT, NOT NULL)
  - [ ] Campo `details` (TEXT, NULLABLE)
  - [ ] Campo `timestamp` (TIMESTAMP, DEFAULT now())
  - [ ] Constraint: FK report_id → reports(id) ON DELETE CASCADE

- [ ] Criar tabela `vehicle_photos`
  - [ ] Campo `id` (UUID, PK)
  - [ ] Campo `report_id` (UUID, FK → reports, NOT NULL)
  - [ ] Campo `part` (TEXT, NOT NULL)
  - [ ] Campo `photo_url` (TEXT, NOT NULL)
  - [ ] Campo `created_at` (TIMESTAMP, DEFAULT now())
  - [ ] Constraint: FK report_id → reports(id) ON DELETE CASCADE

**Referência:** `BACKEND-DOCUMENTATION.md` seção 4

---

### 1.3. Criar Índices (Opcional mas Recomendado)

- [ ] Criar índice em `reports.assigned_to`
- [ ] Criar índice em `reports.status`
- [ ] Criar índice em `reports.created_at`
- [ ] Criar índice em `report_audit_log.report_id`
- [ ] Criar índice em `vehicle_photos.report_id`

**Referência:** `BACKEND-DOCUMENTATION.md` Apêndice C

---

### 1.4. Criar Funções do Banco

- [ ] Criar função `has_role(user_id UUID, role ENUM)` → BOOLEAN
  - [ ] Implementar verificação na tabela user_roles
  - [ ] Retornar true se usuário tem a role, false caso contrário

- [ ] Criar função `handle_updated_at()` → TRIGGER
  - [ ] Setar NEW.updated_at = now()
  - [ ] Retornar NEW

**Referência:** `BACKEND-DOCUMENTATION.md` seção 6

---

### 1.5. Criar Triggers

- [ ] Criar trigger `set_profiles_updated_at` BEFORE UPDATE ON profiles
  - [ ] Executar função `handle_updated_at()`

- [ ] Criar trigger `set_reports_updated_at` BEFORE UPDATE ON reports
  - [ ] Executar função `handle_updated_at()`

**Referência:** `BACKEND-DOCUMENTATION.md` seção 7

---

## 🔒 Fase 2: Sistema de Autenticação

### 2.1. Implementar Autenticação Base

- [ ] Escolher estratégia de autenticação (JWT, Session, OAuth)
- [ ] Implementar endpoint de registro (se aplicável)
- [ ] Implementar endpoint de login
  - [ ] Aceitar `username` e `password`
  - [ ] Validar credenciais contra `auth_users.email` e `encrypted_password`
  - [ ] Buscar dados do `profiles` e `user_roles`
  - [ ] Verificar `must_change_password`
  - [ ] Atualizar `last_login`
  - [ ] Retornar token + dados do usuário

- [ ] Implementar endpoint de logout
- [ ] Implementar middleware de autenticação
  - [ ] Verificar token/sessão
  - [ ] Injetar dados do usuário na requisição

**Referência:** `BACKEND-DOCUMENTATION.md` seções 9.2 e 10.1

---

### 2.2. Implementar Troca de Senha Obrigatória

- [ ] No login, verificar `must_change_password`
- [ ] Se true e `newPassword` não fornecido:
  - [ ] Retornar erro especial (ex: `MUST_CHANGE_PASSWORD`)
- [ ] Se true e `newPassword` fornecido:
  - [ ] Atualizar senha no auth
  - [ ] Setar `must_change_password = false`
  - [ ] Continuar login normal

**Referência:** `BACKEND-DOCUMENTATION.md` seção 9.2

---

### 2.3. Implementar Função has_role na Aplicação

- [ ] Criar função helper `hasRole(userId, role)` → boolean
- [ ] Usar em middleware de autorização
- [ ] Usar em queries para filtrar dados

**Referência:** `BACKEND-DIAGRAMS.md` seção 6.1

---

## 🛡️ Fase 3: Permissões e Autorização

### 3.1. Implementar Permissões de Profiles

- [ ] **SELECT:** Qualquer usuário autenticado pode ler todos os profiles
- [ ] **UPDATE:** Usuário só pode atualizar seu próprio profile

---

### 3.2. Implementar Permissões de User Roles

- [ ] **SELECT:** Qualquer usuário autenticado pode ler todas as roles
- [ ] **INSERT/UPDATE/DELETE:** Apenas AGENTS podem gerenciar roles

---

### 3.3. Implementar Permissões de Reports

- [ ] **SELECT:**
  - [ ] AGENTS podem ver TODOS os laudos
  - [ ] OFFICERS podem ver apenas laudos atribuídos a eles

- [ ] **INSERT:**
  - [ ] Apenas AGENTS podem criar laudos

- [ ] **UPDATE:**
  - [ ] AGENTS podem atualizar QUALQUER laudo
  - [ ] OFFICERS podem atualizar apenas laudos atribuídos a eles

- [ ] **DELETE:** (Opcional - atualmente não implementado)
  - [ ] Apenas AGENTS podem deletar laudos

---

### 3.4. Implementar Permissões de Audit Log

- [ ] **SELECT:**
  - [ ] Usuário pode ver audit logs de laudos aos quais tem acesso

- [ ] **INSERT:**
  - [ ] Qualquer usuário autenticado pode criar logs (com seu próprio user_id)

---

### 3.5. Implementar Permissões de Vehicle Photos

- [ ] **SELECT:**
  - [ ] Usuário pode ver fotos de laudos aos quais tem acesso

- [ ] **INSERT/UPDATE/DELETE:**
  - [ ] Usuário pode gerenciar fotos de laudos atribuídos a ele

**Referência:** `BACKEND-DOCUMENTATION.md` seções 8 e 9.10

---

## 🔧 Fase 4: Regras de Negócio

### 4.1. Implementar Numeração de Laudos

- [ ] Criar função `generateReportNumber(department)`
  - [ ] Formato: `YYYYMMDD-DEPARTMENT-XXXX`
  - [ ] Buscar contador do dia para o departamento
  - [ ] Gerar sequencial com zero à esquerda (4 dígitos)
  - [ ] Retornar número único

**Referência:** `BACKEND-DOCUMENTATION.md` seção 9.3 e `BACKEND-DIAGRAMS.md` seção 6.2

---

### 4.2. Implementar Lógica de Status

- [ ] Ao criar laudo:
  - [ ] Se `assigned_to` fornecido → status = `RECEIVED`
  - [ ] Se `assigned_to` null → status = `PENDING`

- [ ] Validar transições de status:
  - [ ] Permitir: PENDING → RECEIVED
  - [ ] Permitir: RECEIVED → IN_PROGRESS
  - [ ] Permitir: IN_PROGRESS → COMPLETED
  - [ ] Permitir: PENDING/RECEIVED/IN_PROGRESS → CANCELLED
  - [ ] Bloquear: COMPLETED → qualquer outro
  - [ ] Bloquear: CANCELLED → qualquer outro

**Referência:** `BACKEND-DOCUMENTATION.md` seção 9.4

---

### 4.3. Implementar Auditoria Automática

- [ ] Criar função helper `createAuditLog(report_id, action, user_id, user_name, details?)`
- [ ] Chamar após cada operação importante:
  - [ ] Criar laudo → action: `CREATED`
  - [ ] Atualizar laudo → action: `UPDATED`
  - [ ] Atribuir laudo → action: `ASSIGNED`
  - [ ] Cancelar laudo → action: `CANCELLED`

**Referência:** `BACKEND-DOCUMENTATION.md` seções 9.6 e 14

---

### 4.4. Implementar Validações

- [ ] Validar formato de placa: `/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/`
- [ ] Validar tamanho mínimo de chassi: 17 caracteres
- [ ] Validar análise não conclusiva → justificativa obrigatória
- [ ] Validar tamanho de foto: máximo 10MB
- [ ] Validar formato de foto: JPEG, PNG, WEBP

**Referência:** `BACKEND-DOCUMENTATION.md` seção 13

---

## 📊 Fase 5: Endpoints/APIs

### 5.1. Auth Endpoints

- [ ] `POST /auth/login`
  - [ ] Body: `{ username, password, newPassword? }`
  - [ ] Retorna: `{ user, token }`

- [ ] `POST /auth/logout`
  - [ ] Invalida token/sessão

- [ ] `GET /auth/me`
  - [ ] Retorna dados do usuário autenticado

**Referência:** `BACKEND-DOCUMENTATION.md` seção 10.1

---

### 5.2. Report Endpoints

- [ ] `GET /reports`
  - [ ] Query param: `userId?` (opcional, para filtrar)
  - [ ] Retorna: lista de laudos (filtrada por permissão)

- [ ] `GET /reports/:id`
  - [ ] Retorna: laudo específico (se tiver permissão)

- [ ] `POST /reports`
  - [ ] Body: `CreateReportRequest`
  - [ ] Permissão: apenas AGENTS
  - [ ] Gera número automaticamente
  - [ ] Cria audit log
  - [ ] Retorna: laudo criado

- [ ] `PATCH /reports/:id`
  - [ ] Body: campos a atualizar (partial)
  - [ ] Permissão: AGENTS (qualquer) ou OFFICER (se atribuído a ele)
  - [ ] Cria audit log
  - [ ] Retorna: laudo atualizado

- [ ] `POST /reports/:id/assign`
  - [ ] Body: `{ officerId }`
  - [ ] Permissão: apenas AGENTS
  - [ ] Atualiza assigned_to, assigned_at, status
  - [ ] Cria audit log `ASSIGNED`
  - [ ] Retorna: laudo atualizado

- [ ] `POST /reports/:id/cancel`
  - [ ] Body: `{ reason }`
  - [ ] Permissão: apenas AGENTS
  - [ ] Atualiza status para CANCELLED
  - [ ] Cria audit log `CANCELLED`
  - [ ] Retorna: laudo atualizado

**Referência:** `BACKEND-DOCUMENTATION.md` seção 10.2

---

### 5.3. Officer Endpoints

- [ ] `GET /officers`
  - [ ] Retorna: lista de policiais ativos

- [ ] `POST /officers`
  - [ ] Body: dados do policial
  - [ ] Permissão: apenas AGENTS
  - [ ] Cria auth user + profile + role
  - [ ] Rollback se falhar
  - [ ] Retorna: policial criado

- [ ] `PATCH /officers/:id`
  - [ ] Body: campos a atualizar
  - [ ] Permissão: apenas AGENTS
  - [ ] Retorna: policial atualizado

**Referência:** `BACKEND-DOCUMENTATION.md` seção 10.3

---

### 5.4. Dashboard Endpoints

- [ ] `GET /dashboard/stats`
  - [ ] Query param: `userId?` (opcional)
  - [ ] Retorna: estatísticas agregadas
    - [ ] Total de laudos
    - [ ] Laudos por status
    - [ ] Laudos atrasados (> 3 dias)

**Referência:** `BACKEND-DOCUMENTATION.md` seção 10.4

---

### 5.5. Photo Endpoints (Opcional)

- [ ] `POST /reports/:reportId/photos`
  - [ ] Upload de foto
  - [ ] Salvar em storage
  - [ ] Inserir em vehicle_photos
  - [ ] Permissão: OFFICER (se laudo atribuído a ele)

- [ ] `DELETE /reports/:reportId/photos/:photoId`
  - [ ] Deletar do storage
  - [ ] Deletar de vehicle_photos
  - [ ] Permissão: OFFICER (se laudo atribuído a ele)

---

## 🧪 Fase 6: Testes

### 6.1. Testes Unitários

- [ ] Testar função `hasRole()`
- [ ] Testar função `generateReportNumber()`
- [ ] Testar validações (placa, chassi, etc)
- [ ] Testar lógica de status

---

### 6.2. Testes de Integração

- [ ] Testar fluxo completo de login
- [ ] Testar fluxo de troca de senha
- [ ] Testar criação de laudo
- [ ] Testar atribuição de laudo
- [ ] Testar atualização de laudo
- [ ] Testar cancelamento de laudo
- [ ] Testar criação de usuário

---

### 6.3. Testes de Permissão

- [ ] Testar que AGENT vê todos os laudos
- [ ] Testar que OFFICER vê apenas seus laudos
- [ ] Testar que apenas AGENT pode criar laudo
- [ ] Testar que OFFICER não pode atualizar laudo de outro
- [ ] Testar que apenas AGENT pode cancelar laudo

**Referência:** `BACKEND-DIAGRAMS.md` seção 7

---

## 📚 Fase 7: Documentação e Deploy

### 7.1. Documentação da API

- [ ] Documentar todos os endpoints
- [ ] Incluir exemplos de requisição/resposta
- [ ] Documentar códigos de erro
- [ ] Gerar documentação interativa (Swagger/OpenAPI)

---

### 7.2. Configuração de Ambiente

- [ ] Criar arquivo de configuração (.env ou similar)
- [ ] Documentar variáveis de ambiente necessárias:
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET (ou similar)
  - [ ] STORAGE_CONFIG (se usar storage externo)
  - [ ] PORT
  - [ ] etc.

---

### 7.3. Deploy

- [ ] Configurar CI/CD
- [ ] Configurar migrations automáticas
- [ ] Configurar backup de banco de dados
- [ ] Configurar monitoramento (logs, métricas)
- [ ] Configurar alertas de erro

---

## ✅ Checklist de Validação Final

Antes de considerar a implementação completa, verifique:

- [ ] ✅ Todas as tabelas estão criadas com relacionamentos corretos
- [ ] ✅ Todos os enums estão definidos
- [ ] ✅ Triggers de updated_at funcionam
- [ ] ✅ Função has_role funciona corretamente
- [ ] ✅ Sistema de autenticação funciona (login/logout)
- [ ] ✅ Troca de senha obrigatória funciona
- [ ] ✅ Permissões de AGENT estão corretas
- [ ] ✅ Permissões de OFFICER estão corretas
- [ ] ✅ Numeração de laudos é única e sequencial
- [ ] ✅ Status de laudos é validado corretamente
- [ ] ✅ Audit logs são criados automaticamente
- [ ] ✅ Validações de dados funcionam
- [ ] ✅ Endpoints de reports funcionam
- [ ] ✅ Endpoints de officers funcionam
- [ ] ✅ Dashboard retorna estatísticas corretas
- [ ] ✅ Upload de fotos funciona (se implementado)
- [ ] ✅ Todos os testes passam
- [ ] ✅ Documentação da API está completa
- [ ] ✅ Sistema está deployado e acessível

---

## 📖 Recursos Adicionais

### Arquivos de Referência

1. **BACKEND-DOCUMENTATION.md** - Documentação completa do backend
2. **BACKEND-DIAGRAMS.md** - Diagramas e exemplos de código
3. **README-SEED.md** - Como popular banco de dados

### Exemplo de Stack Tecnológica

**Option 1: Python**
- Framework: FastAPI
- ORM: SQLAlchemy
- Auth: python-jose + passlib
- Migrations: Alembic

**Option 2: Node.js**
- Framework: Express.js ou Fastify
- ORM: Prisma ou TypeORM
- Auth: jsonwebtoken + bcrypt
- Migrations: Prisma Migrate ou TypeORM migrations

**Option 3: Java**
- Framework: Spring Boot
- ORM: JPA/Hibernate
- Auth: Spring Security + JWT
- Migrations: Flyway ou Liquibase

**Option 4: C#**
- Framework: ASP.NET Core
- ORM: Entity Framework Core
- Auth: ASP.NET Core Identity + JWT
- Migrations: EF Core Migrations

---

## 🆘 Solução de Problemas

### Problema: Permissões não funcionam

**Solução:**
1. Verificar se função `hasRole()` está implementada corretamente
2. Verificar se middleware de autenticação injeta dados do usuário
3. Verificar se user_id está correto nas queries

---

### Problema: Números de laudo duplicados

**Solução:**
1. Adicionar constraint UNIQUE em reports.number
2. Usar transação ao gerar número + inserir laudo
3. Tratar erro de duplicação com retry

---

### Problema: Audit logs não são criados

**Solução:**
1. Verificar se função `createAuditLog()` está sendo chamada
2. Verificar se não há erros silenciosos
3. Adicionar logs para debug

---

### Problema: Triggers não executam

**Solução:**
1. Verificar se triggers foram criados no banco
2. Verificar se função trigger retorna NEW
3. Verificar se trigger é BEFORE UPDATE

---

**Boa sorte na implementação! 🚀**
