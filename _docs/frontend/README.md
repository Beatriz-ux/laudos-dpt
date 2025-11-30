# Sistema de Laudos Policiais - Documentação

## Visão Geral

Sistema web desenvolvido para gerenciar laudos periciais de veículos pela Polícia Civil. O sistema permite que agentes criem e atribuam laudos, enquanto policiais realizam as perícias e preenchem os laudos.

## Informações do Projeto

- **Nome**: vite_react_shadcn_ts
- **Versão**: 0.0.0
- **Framework**: React 18.3.1 com TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19
- **UI Framework**: Shadcn/ui com Radix UI
- **Backend**: Supabase
- **Estilo**: TailwindCSS 3.4.17

## Tecnologias Principais

### Frontend
- **React** 18.3.1 - Biblioteca UI
- **TypeScript** 5.8.3 - Linguagem de programação
- **React Router DOM** 6.30.1 - Roteamento
- **Vite** 5.4.19 - Build tool e dev server
- **TailwindCSS** 3.4.17 - Framework CSS
- **Shadcn/ui** - Componentes UI (baseados em Radix UI)

### Backend & Database
- **Supabase** 2.86.0 - Backend as a Service
  - Autenticação
  - Banco de dados PostgreSQL
  - Storage
  - Edge Functions
- **TanStack Query** 5.83.0 - Gerenciamento de estado do servidor

### Formulários & Validação
- **React Hook Form** 7.62.0 - Gerenciamento de formulários
- **Zod** 3.25.76 - Validação de schemas
- **@hookform/resolvers** 3.10.0 - Integração React Hook Form + Zod

### UI Components
- **Radix UI** - Componentes primitivos acessíveis
- **Lucide React** 0.462.0 - Ícones
- **date-fns** 3.6.0 - Manipulação de datas
- **Sonner** 1.7.4 - Notificações toast
- **Recharts** 2.15.4 - Gráficos e visualizações

## Estrutura do Projeto

```
laudo-mobile/
├── src/
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes UI (shadcn)
│   │   └── police/       # Componentes específicos do sistema
│   ├── contexts/         # React Contexts
│   ├── hooks/            # Custom Hooks
│   ├── integrations/     # Integrações externas
│   │   └── supabase/    # Cliente e tipos Supabase
│   ├── lib/             # Bibliotecas e utilitários
│   ├── pages/           # Páginas/Rotas
│   │   ├── agent/       # Páginas do Agente
│   │   └── officer/     # Páginas do Policial
│   ├── services/        # Serviços e APIs
│   └── types/           # Definições de tipos TypeScript
├── _docs/               # Documentação do projeto
└── supabase/            # Configurações do Supabase
```

## Funcionalidades Principais

### Para Agentes (AGENT)
- Dashboard com estatísticas gerais
- Criar novos laudos
- Visualizar e gerenciar todos os laudos
- Atribuir laudos a policiais
- Cancelar laudos
- Gerenciar cadastro de policiais
- Exportar laudos em PDF

### Para Policiais (OFFICER)
- Dashboard com laudos atribuídos
- Visualizar laudos recebidos
- Iniciar preenchimento de laudos
- Adicionar fotos das partes do veículo
- Preencher análise e conclusão
- Marcar laudos como concluídos

## Tipos de Usuário

### AGENT (Agente)
- Cria laudos
- Atribui laudos a policiais
- Gerencia o sistema
- Acessa dashboard administrativo

### OFFICER (Policial)
- Recebe laudos atribuídos
- Realiza perícias
- Preenche laudos
- Adiciona fotos e análises

## Status dos Laudos

1. **PENDING** - Aguardando atribuição
2. **RECEIVED** - Recebido pelo policial
3. **IN_PROGRESS** - Em andamento
4. **COMPLETED** - Concluído
5. **CANCELLED** - Cancelado

## Prioridades

- **HIGH** - Alta prioridade
- **MEDIUM** - Média prioridade
- **LOW** - Baixa prioridade

## Departamentos

- **TRAFFIC** - Trânsito
- **CRIMINAL** - Criminal
- **ADMINISTRATIVE** - Administrativo

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Build de desenvolvimento
npm run build:dev

# Lint
npm run lint

# Preview da build
npm run preview
```

## Variáveis de Ambiente

O projeto utiliza variáveis de ambiente do Supabase:
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase

## Autenticação

O sistema usa autenticação do Supabase com:
- Login por email/username e senha
- Sessões persistentes
- Controle de acesso baseado em roles (AGENT/OFFICER)
- Mudança obrigatória de senha no primeiro acesso

## Banco de Dados

### Tabelas Principais

1. **profiles** - Perfis de usuários
2. **user_roles** - Roles dos usuários
3. **reports** - Laudos
4. **report_audit_log** - Log de auditoria
5. **vehicle_photos** - Fotos dos veículos

## Documentação Adicional

- [Arquitetura](./ARQUITETURA.md) - Detalhes da arquitetura do sistema
- [Rotas](./ROTAS.md) - Documentação de todas as rotas
- [Componentes](./COMPONENTES.md) - Componentes React do sistema
- [Serviços](./SERVICOS.md) - Serviços e integrações
- [Banco de Dados](./BANCO_DE_DADOS.md) - Estrutura do banco de dados
- [API](./API.md) - Documentação da API

## Ambiente de Desenvolvimento

### Seed Database

O projeto possui uma página especial para popular o banco com dados de teste:
- Rota: `/seed-database`
- Senha: `admin@seed2024`
- Cria usuários de teste (agentes e policiais)

### Credenciais de Teste

Após popular o banco:
- Username: `agent.traffic`, `officer.traffic`, etc.
- Senha padrão: `senha123`
- Todos devem trocar senha no primeiro acesso

## Contribuindo

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente
4. Execute o projeto: `npm run dev`

## Licença

Projeto privado - UESC TCC
