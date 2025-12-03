# 2. Escolha de Tecnologias

## 2.1. Visão Geral

O sistema foi construído utilizando um stack moderno de tecnologias web, priorizando:
- **Performance** e velocidade de carregamento
- **Desenvolvimento ágil** e manutenibilidade
- **Experiência do usuário** (UX) fluida
- **Segurança** robusta
- **Escalabilidade** futura
- **Custo-benefício** (preferência por open-source)

## 2.2. Stack Tecnológico Completo

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
├─────────────────────────────────────────────────────────────┤
│ Next.js 14 (App Router)                                     │
│ React 18                                                    │
│ TypeScript 5                                                │
│ Tailwind CSS 3                                              │
│ Shadcn/UI                                                   │
│ Lucide Icons                                                │
│ jsPDF + jsPDF-autotable                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
├─────────────────────────────────────────────────────────────┤
│ Next.js 14 API Routes (Server Actions)                     │
│ Prisma ORM 5                                                │
│ bcryptjs (criptografia)                                     │
│ jose (JWT)                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BANCO DE DADOS                       │
├─────────────────────────────────────────────────────────────┤
│ PostgreSQL 15+                                              │
│ Vercel Postgres (hospedagem)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       INFRAESTRUTURA                        │
├─────────────────────────────────────────────────────────────┤
│ Vercel (hospedagem e deploy)                                │
│ Git/GitHub (controle de versão)                             │
│ Docker (desenvolvimento local - opcional)                   │
└─────────────────────────────────────────────────────────────┘
```

## 2.3. Frontend

### 2.3.1. Next.js 14 (Framework Principal)

**O que é**: Framework React de produção com renderização híbrida (SSR/SSG/CSR)

**Versão**: 14.1.4

**Por que escolhemos**:

✅ **Server Components**:
- Reduz JavaScript enviado ao cliente
- Melhora performance inicial
- Permite acesso direto ao banco no servidor

✅ **App Router**:
- Arquitetura moderna baseada em diretórios
- Layouts aninhados facilitam reutilização
- Loading states e error boundaries automáticos

✅ **API Routes Integradas**:
- Backend e frontend no mesmo projeto
- Facilita desenvolvimento e deploy
- Server Actions eliminam necessidade de criar endpoints manualmente

✅ **Otimizações Automáticas**:
- Code splitting automático
- Otimização de imagens
- Prefetch de rotas

✅ **TypeScript First-Class**:
- Suporte nativo completo
- Type safety end-to-end

**Alternativas consideradas**:
- ❌ **Create React App (CRA)**: Descontinuado, sem SSR
- ❌ **Vite + React**: Mais configuração manual, sem SSR out-of-the-box
- ❌ **Remix**: Menos maduro, comunidade menor

**Comandos principais**:
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Type checking
npm run ts-check
```

---

### 2.3.2. React 18

**O que é**: Biblioteca JavaScript para construção de interfaces

**Versão**: 18.x

**Por que escolhemos**:

✅ **Componentização**:
- UI dividida em componentes reutilizáveis
- Facilita manutenção

✅ **Ecossistema Rico**:
- Maior biblioteca de componentes do mercado
- Comunidade gigantesca

✅ **Concurrent Features**:
- Rendering não-blocante
- Suspense para loading states

✅ **Hooks**:
- Lógica reutilizável sem classes
- Código mais limpo

**Principais Hooks Usados**:
- `useState` - Estado local de componentes
- `useEffect` - Side effects
- `useRouter` - Navegação (Next.js)
- `useTransition` - Transições não-blocantes
- Custom hooks para lógica reutilizável

---

### 2.3.3. TypeScript 5

**O que é**: Superset de JavaScript com tipagem estática

**Versão**: 5.x

**Por que escolhemos**:

✅ **Type Safety**:
- Erros detectados em desenvolvimento
- Auto-complete inteligente
- Refatoração segura

✅ **Documentação Viva**:
- Tipos servem como documentação
- Interfaces explícitas

✅ **Melhor DX (Developer Experience)**:
- IntelliSense poderoso
- Navegação de código facilitada

✅ **Escalabilidade**:
- Código mais confiável
- Menos bugs em produção

**Exemplo de Tipagem**:
```typescript
// Tipo de usuário
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  department: Department;
  badge: string;
  isActive: boolean;
}

// Tipo de ação
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

**Configuração (tsconfig.json)**:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### 2.3.4. Tailwind CSS 3

**O que é**: Framework CSS utility-first

**Versão**: 3.3.0

**Por que escolhemos**:

✅ **Produtividade**:
- Estilos diretamente no JSX
- Sem necessidade de criar arquivos CSS
- Protótipo rápido

✅ **Consistência**:
- Sistema de design integrado
- Escala de cores, espaçamentos, tipografia padronizada

✅ **Performance**:
- PurgeCSS automático remove CSS não usado
- Bundle final minúsculo

✅ **Responsividade**:
- Breakpoints mobile-first
- Classes responsivas simples (`sm:`, `md:`, `lg:`)

✅ **Dark Mode**:
- Suporte nativo
- Classes condicionais (`dark:`)

**Exemplo de uso**:
```tsx
<button className="
  px-4 py-2
  bg-blue-600 hover:bg-blue-700
  text-white font-medium
  rounded-lg
  transition-colors
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Salvar
</button>
```

**Breakpoints configurados**:
```javascript
{
  'sm': '640px',  // Tablet pequeno
  'md': '768px',  // Tablet
  'lg': '1024px', // Desktop
  'xl': '1280px', // Desktop large
  '2xl': '1536px' // Desktop XL
}
```

---

### 2.3.5. Shadcn/UI

**O que é**: Coleção de componentes React acessíveis e customizáveis

**Versão**: 3.5.1

**Por que escolhemos**:

✅ **Copy-Paste, não NPM**:
- Componentes copiados para o projeto
- Total controle sobre o código
- Fácil customização

✅ **Baseado em Radix UI**:
- Acessibilidade (a11y) garantida
- Componentes sem estilo (headless)
- WAI-ARIA compliant

✅ **Integração com Tailwind**:
- Estilização consistente
- Tema unificado

✅ **Componentes Usados no Projeto**:
- `Button` - Botões com variantes
- `Card` - Cards de conteúdo
- `Dialog` - Modais
- `Input` - Campos de texto
- `Select` - Dropdowns
- `Table` - Tabelas de dados
- `Badge` - Tags de status
- `Alert` - Mensagens
- `Dropdown Menu` - Menus contextuais

**Exemplo de componente**:
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Novo Laudo</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Criar Novo Laudo</DialogTitle>
      <DialogDescription>
        Preencha os dados básicos do laudo
      </DialogDescription>
    </DialogHeader>
    {/* Formulário */}
  </DialogContent>
</Dialog>
```

---

### 2.3.6. Lucide Icons

**O que é**: Biblioteca de ícones SVG

**Versão**: 0.555.0

**Por que escolhemos**:

✅ **Grande Variedade**:
- Mais de 1000 ícones
- Estilo consistente

✅ **Tree-shakeable**:
- Importa apenas ícones usados
- Bundle pequeno

✅ **Customizável**:
- Tamanho e cor via props
- Aceita classes Tailwind

**Ícones usados**:
```typescript
import {
  FileText,     // Laudos
  Users,        // Policiais
  BarChart3,    // Dashboard
  AlertCircle,  // Alertas
  CheckCircle,  // Sucesso
  Camera,       // Fotos
  Download,     // PDF
  Search,       // Busca
  Filter,       // Filtros
  LogOut        // Sair
} from 'lucide-react';
```

---

### 2.3.7. jsPDF + jsPDF-autotable

**O que é**: Bibliotecas para geração de PDF no cliente

**Versões**:
- jsPDF: 3.0.4
- jsPDF-autotable: 5.0.2

**Por que escolhemos**:

✅ **Geração Client-Side**:
- Não sobrecarrega servidor
- Gera PDF instantaneamente

✅ **Customização Completa**:
- Controle total do layout
- Suporta imagens (fotos do veículo)

✅ **jsPDF-autotable**:
- Facilita criação de tabelas
- Paginação automática
- Headers e footers

**Exemplo de uso**:
```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const doc = new jsPDF();

// Cabeçalho oficial
doc.setFontSize(14);
doc.text('GOVERNO DO ESTADO DA BAHIA', 105, 20, { align: 'center' });
doc.text('SECRETARIA DA SEGURANÇA PÚBLICA', 105, 27, { align: 'center' });

// Título do laudo
doc.setFontSize(16);
doc.setFont(undefined, 'bold');
doc.text(`LAUDO DE EXAME PERICIAL Nº ${report.number}`, 105, 45, { align: 'center' });

// Tabela com dados
autoTable(doc, {
  head: [['Campo', 'Valor']],
  body: [
    ['Placa', report.vehicle?.plate],
    ['Marca/Modelo', `${report.vehicle?.brand} ${report.vehicle?.model}`],
    ['Cor', report.vehicle?.color],
  ],
  startY: 55,
});

// Fotos (2 por página)
report.photos.forEach((photo, index) => {
  if (index % 2 === 0 && index > 0) {
    doc.addPage();
  }
  doc.addImage(photo.photoData, 'JPEG', 15, yPosition, 180, 120);
  doc.text(`Foto ${index + 1}: ${photo.category}`, 15, yPosition + 125);
});

// Salvar
doc.save(`laudo-${report.number}.pdf`);
```

---

## 2.4. Backend

### 2.4.1. Next.js API Routes / Server Actions

**O que é**: Endpoints serverless integrados ao Next.js

**Por que escolhemos**:

✅ **Simplicidade**:
- Mesmo repositório que frontend
- Deploy unificado
- Sem necessidade de servidor separado

✅ **Server Actions (Next.js 14)**:
- Funções assíncronas que rodam no servidor
- Eliminam necessidade de criar rotas manualmente
- Type-safe end-to-end

✅ **Serverless**:
- Escalabilidade automática
- Paga apenas pelo uso
- Sem gerenciamento de servidor

**Estrutura de Actions**:
```
src/actions/
├── auth/
│   ├── login.ts
│   ├── logout.ts
│   └── get-current-user.ts
├── reports/
│   ├── create-report.ts
│   ├── get-reports.ts
│   ├── get-report-by-id.ts
│   ├── update-report.ts
│   ├── assign-report.ts
│   └── cancel-report.ts
├── officers/
│   ├── get-officers.ts
│   └── create-officer.ts
└── dashboard/
    └── get-stats.ts
```

**Exemplo de Server Action**:
```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/modules/auth';

export async function getReports(userId?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Não autenticado' };
  }

  const where = user.role === 'OFFICER' && userId
    ? { assignedTo: userId }
    : {};

  const reports = await prisma.report.findMany({
    where,
    include: {
      creator: true,
      assignee: true,
      photos: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return { success: true, data: reports };
}
```

---

### 2.4.2. Prisma ORM 5

**O que é**: ORM (Object-Relational Mapping) moderno para TypeScript

**Versão**: 5.12.1

**Por que escolhemos**:

✅ **Type Safety**:
- Tipos gerados automaticamente do schema
- Auto-complete para queries
- Erros de compilação ao invés de runtime

✅ **Developer Experience**:
- Prisma Studio (GUI do banco)
- Migrations automáticas
- Seeding facilitado

✅ **Performance**:
- Queries otimizadas
- Connection pooling
- Lazy loading e eager loading

✅ **Multiplataforma**:
- Funciona com PostgreSQL, MySQL, SQLite, MongoDB
- Fácil migração entre bancos

**Schema Prisma (schema.prisma)**:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}

model Profile {
  id                   String    @id @default(cuid())
  username             String    @unique
  email                String    @unique
  password             String
  name                 String
  department           Department
  badge                String    @unique
  isActive             Boolean   @default(true)
  mustChangePassword   Boolean   @default(true)

  roles                UserRole[]
  createdReports       Report[]  @relation("ReportCreator")
  assignedReports      Report[]  @relation("ReportAssignee")

  @@map("profiles")
}

model Report {
  id          String        @id @default(cuid())
  number      String        @unique
  status      ReportStatus  @default(PENDING)
  priority    Priority
  createdBy   String
  assignedTo  String?

  creator     Profile       @relation("ReportCreator", fields: [createdBy], references: [id])
  assignee    Profile?      @relation("ReportAssignee", fields: [assignedTo], references: [id])
  photos      VehiclePhoto[]
  auditLogs   ReportAuditLog[]

  @@map("reports")
}
```

**Comandos Prisma**:
```bash
# Gerar client
npx prisma generate

# Criar migration
npx prisma migrate dev --name add_new_field

# Aplicar migrations
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Seed database
npm run seed
```

**Exemplo de query**:
```typescript
// Buscar laudo com relações
const report = await prisma.report.findUnique({
  where: { id: reportId },
  include: {
    creator: true,
    assignee: true,
    photos: true,
    auditLogs: {
      orderBy: { timestamp: 'asc' },
    },
  },
});

// Criar laudo
const newReport = await prisma.report.create({
  data: {
    number: generateReportNumber(),
    status: 'PENDING',
    priority: 'MEDIUM',
    createdBy: userId,
    vehiclePlate: 'ABC1234',
  },
});
```

---

### 2.4.3. bcryptjs

**O que é**: Biblioteca para hash de senhas

**Versão**: 3.0.3 (mais 5.1.1 do bcrypt nativo)

**Por que escolhemos**:

✅ **Segurança**:
- Hash one-way (irreversível)
- Salt automático
- Resistente a rainbow tables

✅ **Padrão da Indústria**:
- Amplamente usado e testado
- Recomendado por OWASP

✅ **Ajustável**:
- Rounds configuráveis (trabalho computacional)
- Mais rounds = mais seguro mas mais lento

**Uso**:
```typescript
import bcrypt from 'bcryptjs';

// Hash de senha ao criar usuário
const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds

// Verificar senha no login
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Configuração de Segurança**:
- **Rounds**: 10 (equilíbrio segurança/performance)
- **Salt**: Automático e único por senha
- **Tempo de hash**: ~100ms

---

### 2.4.4. jose (JWT)

**O que é**: Biblioteca para trabalhar com JWT (JSON Web Tokens)

**Versão**: 5.2.4

**Por que escolhemos**:

✅ **Moderno**:
- Suporta algoritmos recentes
- TypeScript first-class
- Web standards compliant

✅ **Seguro**:
- Suporte a múltiplos algoritmos (HS256, RS256, etc)
- Validação rigorosa de tokens

✅ **Leve**:
- Sem dependências
- Bundle pequeno

**Uso no sistema**:
```typescript
import { SignJWT, jwtVerify } from 'jose';

// Criar token ao fazer login
const token = await new SignJWT({ userId: user.id, role: user.role })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .setIssuedAt()
  .sign(secret);

// Verificar token em requisições
const { payload } = await jwtVerify(token, secret);
const userId = payload.userId;
```

**Payload do JWT**:
```json
{
  "userId": "clx123...",
  "role": "AGENT",
  "iat": 1704067200,
  "exp": 1704672000
}
```

---

## 2.5. Banco de Dados

### 2.5.1. PostgreSQL 15+

**O que é**: Sistema de gerenciamento de banco de dados relacional open-source

**Versão**: 15+

**Por que escolhemos**:

✅ **Robusto e Confiável**:
- ACID compliant
- Transações seguras
- Integridade referencial

✅ **Performance**:
- Índices avançados (B-tree, Hash, GiST, GIN)
- Queries complexas otimizadas
- Connection pooling

✅ **Funcionalidades Avançadas**:
- JSON/JSONB nativo
- Full-text search
- Enums customizados
- Triggers e stored procedures

✅ **Open Source**:
- Gratuito
- Comunidade ativa
- Documentação excelente

**Estrutura do Banco**:
- **5 tabelas principais**:
  1. `profiles` - Usuários do sistema
  2. `user_roles` - Papéis dos usuários
  3. `reports` - Laudos
  4. `report_audit_log` - Auditoria
  5. `vehicle_photos` - Fotos dos veículos

- **Enums**:
  - `AppRole` (AGENT, OFFICER)
  - `Department` (TRAFFIC, CRIMINAL, ADMINISTRATIVE)
  - `ReportStatus` (PENDING, RECEIVED, IN_PROGRESS, COMPLETED, CANCELLED)
  - `Priority` (HIGH, MEDIUM, LOW)
  - `VehicleSpecies` (11 valores)
  - `VehicleType` (21 valores)

---

### 2.5.2. Vercel Postgres

**O que é**: Banco PostgreSQL gerenciado pela Vercel

**Por que escolhemos**:

✅ **Integração Perfeita**:
- Mesmo provedor do frontend
- Deploy unificado
- Variáveis de ambiente automáticas

✅ **Gerenciamento Zero**:
- Backups automáticos
- Escalabilidade automática
- Monitoramento incluído

✅ **Performance**:
- Edge locations próximas
- Connection pooling incluso
- Low latency

✅ **Custo-benefício**:
- Free tier generoso
- Paga apenas pelo uso
- Sem servidor para gerenciar

**Conexão**:
```typescript
// Via Prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}

// Variáveis de ambiente (Vercel)
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..." // Para migrations
```

---

## 2.6. Infraestrutura e DevOps

### 2.6.1. Vercel (Hospedagem)

**O que é**: Plataforma de hospedagem para aplicações web modernas

**Por que escolhemos**:

✅ **Otimizado para Next.js**:
- Criadores do Next.js
- Deploy otimizado automaticamente
- Edge functions

✅ **CI/CD Automático**:
- Deploy a cada push no GitHub
- Preview deployments para PRs
- Rollback fácil

✅ **Performance**:
- Edge Network global
- CDN integrado
- Caching inteligente

✅ **Developer Experience**:
- Setup em minutos
- Logs em tempo real
- Métricas de performance

**Processo de Deploy**:
```
1. Push para GitHub
   ↓
2. Vercel detecta mudanças
   ↓
3. Build automático
   ↓
4. Deploy para produção
   ↓
5. URL atualizada
```

---

### 2.6.2. Git / GitHub

**O que é**: Sistema de controle de versão distribuído

**Por que escolhemos**:

✅ **Padrão da Indústria**:
- Usado mundialmente
- Integração com todas as ferramentas

✅ **Colaboração**:
- Pull requests
- Code review
- Issues tracking

✅ **Histórico Completo**:
- Rastreamento de mudanças
- Rollback fácil
- Branches para features

**Estrutura de Branches**:
```
main
  ├── develop
  │   ├── feature/user-authentication
  │   ├── feature/report-crud
  │   └── feature/photo-upload
  └── hotfix/security-patch
```

---

### 2.6.3. Docker (Desenvolvimento)

**O que é**: Plataforma de containerização

**Por que incluímos**:

✅ **Ambiente Consistente**:
- Mesmo ambiente em todos os devs
- Evita "funciona na minha máquina"

✅ **PostgreSQL Local**:
- Banco de dados para desenvolvimento
- Sem instalação manual

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: laudos_dpt
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Comandos**:
```bash
# Subir banco local
npm run compose:up

# Ou manualmente
docker compose up -d
```

---

## 2.7. Ferramentas de Desenvolvimento

### 2.7.1. ESLint

**O que é**: Linter para JavaScript/TypeScript

**Configuração**: `eslint-config-next` (padrão Next.js)

**Benefícios**:
- Detecta erros comuns
- Garante consistência de código
- Melhor qualidade

```bash
npm run lint
```

---

### 2.7.2. TypeScript Compiler

**O que é**: Compilador e type checker

**Uso**:
```bash
npm run ts-check
```

**Benefícios**:
- Valida tipos em toda aplicação
- Detecta erros antes de rodar
- CI/CD pode falhar em erros de tipo

---

### 2.7.3. Prisma Studio

**O que é**: GUI para visualizar e editar dados do banco

**Uso**:
```bash
npm run prisma:studio
```

**Benefícios**:
- Visualização de dados
- Edição manual de registros
- Debug facilitado

---

## 2.8. Dependências Completas

### Production Dependencies (package.json)
```json
{
  "dependencies": {
    "@prisma/client": "^5.12.1",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@vercel/postgres": "^0.8.0",
    "bcrypt": "^5.1.1",
    "bcryptjs": "^3.0.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "jose": "^5.2.4",
    "jspdf": "^3.0.4",
    "jspdf-autotable": "^5.0.2",
    "lucide-react": "^0.555.0",
    "next": "14.1.4",
    "react": "^18",
    "react-dom": "^18",
    "react-toastify": "^10.0.5",
    "tailwind-merge": "^3.4.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.4",
    "postcss": "^8",
    "prisma": "^5.12.1",
    "shadcn": "^3.5.1",
    "tailwindcss": "^3.3.0",
    "tsx": "^4.7.1",
    "typescript": "^5"
  }
}
```

---

## 2.9. Comparação com Alternativas

### Frontend Framework

| Critério | Next.js 14 ✅ | Create React App | Vite + React | Remix |
|----------|--------------|------------------|--------------|--------|
| SSR | ✅ Sim | ❌ Não | ❌ Não | ✅ Sim |
| API Routes | ✅ Sim | ❌ Não | ❌ Não | ✅ Sim |
| File-based Routing | ✅ Sim | ❌ Não | ❌ Não | ✅ Sim |
| Server Components | ✅ Sim | ❌ Não | ❌ Não | ❌ Não |
| Maturidade | ✅ Alta | ⚠️ Descontinuado | ✅ Alta | ⚠️ Média |
| Comunidade | ✅ Enorme | ⚠️ Declinando | ✅ Crescendo | ⚠️ Pequena |

**Vencedor**: Next.js 14

---

### ORM

| Critério | Prisma ✅ | TypeORM | Sequelize |
|----------|----------|---------|-----------|
| Type Safety | ✅ Excelente | ⚠️ Boa | ❌ Fraca |
| DX | ✅ Excelente | ⚠️ Boa | ⚠️ Regular |
| Migrations | ✅ Automáticas | ⚠️ Manuais | ⚠️ Manuais |
| Performance | ✅ Otimizada | ✅ Otimizada | ⚠️ Regular |
| Comunidade | ✅ Crescendo | ✅ Grande | ⚠️ Declinando |

**Vencedor**: Prisma

---

### CSS Framework

| Critério | Tailwind CSS ✅ | Bootstrap | Material-UI | Styled Components |
|----------|----------------|-----------|-------------|-------------------|
| Produtividade | ✅ Alta | ⚠️ Média | ⚠️ Média | ⚠️ Baixa |
| Bundle Size | ✅ Pequeno | ⚠️ Grande | ⚠️ Grande | ✅ Pequeno |
| Customização | ✅ Total | ⚠️ Limitada | ⚠️ Média | ✅ Total |
| Curva de Aprendizado | ⚠️ Média | ✅ Baixa | ⚠️ Alta | ⚠️ Média |

**Vencedor**: Tailwind CSS

---

## 2.10. Requisitos de Sistema

### Para Desenvolvimento

**Hardware Mínimo**:
- CPU: 2 cores
- RAM: 4GB
- Disco: 2GB livres
- Internet: Conexão estável

**Software**:
- Node.js 18.17 ou superior
- npm ou yarn ou pnpm
- Git
- VS Code (recomendado) ou outro editor

---

### Para Produção (Vercel)

**Limites do Free Tier**:
- Banda: 100GB/mês
- Builds: Ilimitados
- Serverless Functions: 100GB-Hours
- Edge Middleware: 1 milhão de invocações

**Limites do Banco (Vercel Postgres)**:
- Armazenamento: 256MB
- Conexões: 60 simultâneas
- Queries: Ilimitadas

---

## 2.11. Justificativa Final

A escolha do stack tecnológico foi baseada em:

1. **Performance**: Next.js 14 com Server Components oferece a melhor performance possível
2. **Developer Experience**: TypeScript + Prisma + Tailwind = Produtividade máxima
3. **Escalabilidade**: Arquitetura serverless escala automaticamente
4. **Custo**: Stack completamente gratuito/open-source
5. **Manutenibilidade**: Código limpo, tipado e bem documentado
6. **Comunidade**: Todas as tecnologias têm comunidades ativas e documentação rica
7. **Futuro**: Stack moderno preparado para evoluir

---

**Próximo**: [03. Arquitetura Técnica](./03-arquitetura.md)
