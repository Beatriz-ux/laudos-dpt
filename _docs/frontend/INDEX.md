# Índice da Documentação - Sistema de Laudos Policiais

## Documentos Disponíveis

### 1. [README.md](./README.md)
**Visão Geral do Projeto**

Documento principal com informações gerais sobre o projeto, incluindo:
- Visão geral do sistema
- Tecnologias utilizadas
- Estrutura do projeto
- Funcionalidades principais
- Scripts disponíveis
- Variáveis de ambiente
- Como contribuir

**Ideal para**: Primeira leitura, entender o propósito do sistema

---

### 2. [ARQUITETURA.md](./ARQUITETURA.md)
**Arquitetura e Design do Sistema**

Documentação detalhada da arquitetura, incluindo:
- Diagrama de arquitetura
- Camadas da aplicação
- Fluxo de dados
- Padrões de design utilizados
- Segurança (RLS, JWT, RBAC)
- Performance e otimizações
- Escalabilidade
- Deploy

**Ideal para**: Entender como o sistema foi estruturado, decisões arquiteturais

---

### 3. [ROTAS.md](./ROTAS.md)
**Documentação de Rotas**

Todas as rotas do sistema documentadas, incluindo:
- Rotas públicas (/login, /seed-database)
- Rotas protegidas (Agent e Officer)
- Proteção e guardas de rota
- Parâmetros de rota
- Navegação programática
- Layout padrão

**Rotas Principais**:
- Agent: `/agent/dashboard`, `/agent/reports`, `/agent/officers`
- Officer: `/officer/dashboard`, `/officer/reports/received`

**Ideal para**: Entender a navegação do sistema, implementar novas rotas

---

### 4. [COMPONENTES.md](./COMPONENTES.md)
**Documentação de Componentes**

Todos os componentes React documentados, incluindo:

**Componentes Police** (específicos do sistema):
- DashboardLayout
- Sidebar
- DataTable
- MetricCard
- StatusBadge, PriorityBadge, DaysCounter
- SearchFilter
- CreateReportDialog, CreateOfficerDialog

**Componentes UI** (Shadcn/UI):
- Button, Card, Dialog
- Input, Select, Badge
- Table, Alert, Toast
- DropdownMenu
- E muitos outros...

**Ideal para**: Usar componentes existentes, criar novos componentes

---

### 5. [SERVICOS.md](./SERVICOS.md)
**Documentação de Serviços**

Camada de serviços que se comunica com o Supabase:

**Serviços Disponíveis**:
- **AuthService**: Login, logout, getCurrentUser
- **ReportService**: CRUD de laudos, atribuição, cancelamento
- **OfficerService**: Gerenciamento de policiais
- **DashboardService**: Estatísticas
- **SeedService**: Popular banco de dados

**Cada serviço documentado com**:
- Assinatura da função
- Parâmetros
- Retorno
- Fluxo de execução
- Exemplos de uso
- Tratamento de erros

**Ideal para**: Implementar novas funcionalidades, integrar com backend

---

### 6. [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md)
**Estrutura do Banco de Dados**

Documentação completa do PostgreSQL/Supabase:

**Conteúdo**:
- Diagrama ER
- Tabelas detalhadas:
  - profiles (usuários)
  - user_roles (papéis)
  - reports (laudos)
  - report_audit_log (auditoria)
  - vehicle_photos (fotos)
- Políticas RLS
- Funções do banco
- Storage (Supabase)
- Queries comuns
- Otimizações
- Troubleshooting

**Ideal para**: Entender estrutura de dados, criar migrations, otimizar queries

---

## Guias Rápidos

### Para Começar

1. Leia o [README.md](./README.md) para entender o projeto
2. Configure o ambiente seguindo as instruções
3. Execute `npm run dev` para iniciar

### Para Desenvolver

1. Consulte [ROTAS.md](./ROTAS.md) para navegação
2. Use [COMPONENTES.md](./COMPONENTES.md) para componentes
3. Consulte [SERVICOS.md](./SERVICOS.md) para integrações
4. Veja [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md) para dados

### Para Arquitetura

1. Leia [ARQUITETURA.md](./ARQUITETURA.md) completo
2. Entenda os padrões utilizados
3. Consulte decisões de design

---

## Fluxos Principais Documentados

### Fluxo de Autenticação
Documentado em: [ARQUITETURA.md](./ARQUITETURA.md#fluxo-de-dados) e [SERVICOS.md](./SERVICOS.md#authservice)

### Fluxo de Criação de Laudo
Documentado em: [ARQUITETURA.md](./ARQUITETURA.md#criação-de-laudo) e [SERVICOS.md](./SERVICOS.md#createreport)

### Fluxo de Atribuição de Laudo
Documentado em: [ARQUITETURA.md](./ARQUITETURA.md#atribuição-de-laudo) e [SERVICOS.md](./SERVICOS.md#assignreport)

---

## Busca Rápida

### Procurando por...

**Autenticação**:
- Como funciona: [ARQUITETURA.md](./ARQUITETURA.md#segurança)
- Login: [SERVICOS.md](./SERVICOS.md#authservice)
- Rota de login: [ROTAS.md](./ROTAS.md#login)

**Laudos**:
- CRUD: [SERVICOS.md](./SERVICOS.md#reportservice)
- Tabela: [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md#reports)
- Rotas: [ROTAS.md](./ROTAS.md#agentreports)

**Componentes**:
- Lista completa: [COMPONENTES.md](./COMPONENTES.md)
- Padrões de uso: [COMPONENTES.md](./COMPONENTES.md#padrões-de-uso)

**Banco de Dados**:
- Estrutura: [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md#tabelas)
- RLS: [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md#políticas-rls)
- Queries: [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md#queries-comuns)

**Roles e Permissões**:
- RBAC: [ARQUITETURA.md](./ARQUITETURA.md#role-based-access-control)
- Proteção de rotas: [ROTAS.md](./ROTAS.md#proteção-de-rotas)
- RLS: [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md#políticas-rls)

---

## Checklist para Novos Desenvolvedores

- [ ] Ler [README.md](./README.md)
- [ ] Configurar ambiente de desenvolvimento
- [ ] Popular banco com `/seed-database`
- [ ] Fazer login de teste
- [ ] Ler [ARQUITETURA.md](./ARQUITETURA.md)
- [ ] Explorar [ROTAS.md](./ROTAS.md)
- [ ] Conhecer [COMPONENTES.md](./COMPONENTES.md)
- [ ] Estudar [SERVICOS.md](./SERVICOS.md)
- [ ] Entender [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md)

---

## Atualizações da Documentação

### Versão 1.0 - 2025-01-29
- Documentação inicial completa
- Todos os módulos principais documentados
- Exemplos de uso adicionados
- Diagramas e fluxos incluídos

---

## Contribuindo com a Documentação

Ao adicionar novas funcionalidades:

1. **Atualize o documento relevante**:
   - Nova rota? → [ROTAS.md](./ROTAS.md)
   - Novo componente? → [COMPONENTES.md](./COMPONENTES.md)
   - Novo serviço? → [SERVICOS.md](./SERVICOS.md)
   - Nova tabela? → [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md)

2. **Mantenha o padrão**:
   - Use exemplos de código
   - Documente parâmetros e retornos
   - Adicione fluxos se necessário

3. **Atualize este índice** se criar novo documento

---

## Ferramentas Úteis

### Para Visualizar Markdown
- VS Code com extensão Markdown Preview
- GitHub (upload dos arquivos)
- Typora, Mark Text, etc.

### Para Gerar Diagramas
- Mermaid (integrado com GitHub/GitLab)
- Draw.io
- PlantUML

### Para Documentar API
- Swagger/OpenAPI
- Postman
- Insomnia

---

## Contato e Suporte

Para dúvidas sobre a documentação ou o projeto:
- Consulte os documentos relevantes primeiro
- Verifique exemplos de código
- Consulte o time de desenvolvimento

---

## Glossário

**AGENT**: Tipo de usuário que cria e gerencia laudos

**OFFICER**: Tipo de usuário que preenche laudos

**RLS**: Row Level Security - segurança a nível de linha no PostgreSQL

**RBAC**: Role-Based Access Control - controle de acesso baseado em papéis

**Edge Functions**: Funções serverless do Supabase

**Supabase**: Backend as a Service usado no projeto

**JWT**: JSON Web Token - usado para autenticação

**Shadcn/UI**: Biblioteca de componentes UI utilizada

---

## Mapa Mental do Sistema

```
Sistema de Laudos Policiais
│
├── Frontend (React + TypeScript)
│   ├── Páginas
│   │   ├── Login
│   │   ├── Agent (Dashboard, Laudos, Policiais)
│   │   └── Officer (Dashboard, Laudos Recebidos)
│   │
│   ├── Componentes
│   │   ├── UI (Shadcn)
│   │   └── Police (Específicos)
│   │
│   └── Serviços
│       ├── Auth
│       ├── Report
│       ├── Officer
│       └── Dashboard
│
├── Backend (Supabase)
│   ├── Auth (JWT)
│   ├── Database (PostgreSQL)
│   │   ├── profiles
│   │   ├── user_roles
│   │   ├── reports
│   │   ├── report_audit_log
│   │   └── vehicle_photos
│   │
│   ├── Storage (Fotos)
│   └── Edge Functions
│       ├── seed-database
│       └── create-officer
│
└── Segurança
    ├── RLS (Row Level Security)
    ├── RBAC (Role-Based Access)
    └── JWT (Authentication)
```

---

**Última Atualização**: 2025-01-29

**Versão**: 1.0
