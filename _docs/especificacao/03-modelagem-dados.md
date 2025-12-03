# 3. Modelagem de Dados

## 3.1. Diagrama Entidade-Relacionamento (ER)

```
┌─────────────────┐
│    Profile      │
│─────────────────│
│ PK id           │
│    username     │──┐
│    email        │  │
│    password     │  │
│    name         │  │
│    department   │  │
│    badge        │  │
│    isActive     │  │
│    mustChangePw │  │
│    lastLogin    │  │
└─────────────────┘  │
         │           │
         │ 1      1  │
         │           │
    ┌────┴────┐      │
    │         │      │
    │  1:N    │      │
    │         │      │
┌───▼──────────▼────▼┐
│    UserRole        │
│────────────────────│
│ PK id              │
│ FK userId          │
│    role            │
└────────────────────┘

         │
         │ 1
         │
         │ N
         │
┌────────▼──────────────────┐         ┌──────────────────┐
│        Report             │ 1    N  │  VehiclePhoto    │
│───────────────────────────│◄────────│──────────────────│
│ PK id                     │         │ PK id            │
│    number                 │         │ FK reportId      │
│    status                 │         │    category      │
│    priority               │         │    subtype       │
│ FK createdBy     ────────►│         │    photoData     │
│ FK assignedTo    ────────►│         │    description   │
│    assignedAt             │         └──────────────────┘
│    deadline               │
│    [campos requisição]    │         ┌──────────────────┐
│    [campos veículo]       │ 1    N  │ ReportAuditLog   │
│    [dados originais]      │◄────────│──────────────────│
│    [análise/conclusão]    │         │ PK id            │
│    [localização]          │         │ FK reportId      │
│    createdAt              │         │ FK userId        │
│    updatedAt              │         │    userName      │
└───────────────────────────┘         │    action        │
         │                             │    details       │
         │ 1                           │    timestamp     │
         │                             └──────────────────┘
         │ N
         │
┌────────▼──────────┐
│     Profile       │
│   (creator/       │
│    assignee)      │
└───────────────────┘
```

## 3.2. Tabelas e Campos

### 3.2.1. Profile (Usuários)

Armazena dados dos usuários do sistema (agentes e policiais).

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| username | String | UNIQUE, NOT NULL | Nome de usuário para login |
| email | String | UNIQUE, NOT NULL | Email institucional |
| password | String | NOT NULL | Senha criptografada (bcrypt) |
| name | String | NOT NULL | Nome completo |
| department | Enum | NOT NULL | TRAFFIC, CRIMINAL, ADMINISTRATIVE |
| badge | String | UNIQUE, NOT NULL | Matrícula/Placa funcional |
| isActive | Boolean | DEFAULT true | Se o usuário está ativo |
| mustChangePassword | Boolean | DEFAULT true | Forçar troca de senha |
| lastLogin | DateTime | NULL | Último acesso |
| createdAt | DateTime | DEFAULT now() | Data de criação |
| updatedAt | DateTime | AUTO | Última atualização |

**Índices**:
- PRIMARY KEY (id)
- UNIQUE (username)
- UNIQUE (email)
- UNIQUE (badge)

---

### 3.2.2. UserRole (Papéis)

Define os papéis/permissões de cada usuário.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| userId | String | FK Profile(id), NOT NULL | Referência ao usuário |
| role | Enum | NOT NULL | AGENT ou OFFICER |

**Restrições**:
- UNIQUE (userId, role) - Um usuário não pode ter a mesma role duplicada
- ON DELETE CASCADE - Deleta roles ao deletar usuário

**Índices**:
- PRIMARY KEY (id)
- INDEX (userId)

---

### 3.2.3. Report (Laudos)

Armazena todos os dados de um laudo pericial.

#### Campos de Controle

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| number | String | UNIQUE, NOT NULL | Número do laudo (formato: YYYYMMDD-DEPT-XXXX) |
| status | Enum | DEFAULT PENDING | PENDING, RECEIVED, IN_PROGRESS, COMPLETED, CANCELLED |
| priority | Enum | NOT NULL | HIGH, MEDIUM, LOW |
| createdBy | String | FK Profile(id), NOT NULL | Agente que criou |
| assignedTo | String | FK Profile(id), NULL | Policial atribuído |
| assignedAt | DateTime | NULL | Data/hora de atribuição |
| deadline | DateTime | NULL | Prazo para conclusão |
| createdAt | DateTime | DEFAULT now() | Data de criação |
| updatedAt | DateTime | AUTO | Última atualização |

#### Campos de Requisição (preenchidos pelo Agente)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| oficio | String | Número do ofício |
| orgaoRequisitante | String | Delegacia/Órgão que requisitou |
| autoridadeRequisitante | String | Nome da autoridade |
| guiaOficio | String | Número da guia/ofício |
| dataGuiaOficio | DateTime | Data da guia |
| ocorrenciaPolicial | String | Número da ocorrência |
| objetivoPericia | Text | Objetivo do exame pericial |
| preambulo | Text | Texto padrão inicial |
| historico | Text | Histórico do caso |
| placaPortada | String | Placa que o veículo está usando |
| vehicleSpecies | Enum | Espécie do veículo |
| vehicleType | Enum | Tipo do veículo |
| vidro | String | Informações do vidro |
| outrasNumeracoes | Text | Outras numerações relevantes |

#### Campos de Localização

| Campo | Tipo | Descrição |
|-------|------|-----------|
| locationAddress | String | Endereço completo |
| locationCity | String | Cidade |
| locationState | String | UF |
| locationCoordinates | String | JSON com lat/lng |

#### Campos do Veículo (preenchidos por Agente/Policial)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| vehiclePlate | String | Placa do veículo |
| vehicleChassi | String | Número do chassi |
| vehicleVin | String | VIN (Vehicle Identification Number) |
| vehicleMotor | String | Número do motor |
| vehicleSerieMotor | String | Série do motor |
| vehicleColor | String | Cor do veículo |
| vehicleBrand | String | Marca (Toyota, Honda, etc) |
| vehicleModel | String | Modelo (Corolla, Civic, etc) |
| vehicleYear | Integer | Ano de fabricação |
| vehicleCategory | String | Categoria do veículo |
| vehicleIsCloned | Boolean | Se é clone |
| vehicleIsAdulterated | Boolean | Se tem adulterações |
| vehicleLicensedTo | String | Licenciado em nome de |
| vehicleTechnicalCondition | Text | Condições técnicas observadas |

#### Informações Adicionais (Policial)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| glassInfo | Text | Informações sobre vidros |
| plateInfo | Text | Informações sobre placas |
| motorInfo | Text | Informações sobre motor |
| centralEletronicaInfo | Text | Informações da central eletrônica |
| seriesAuxiliares | Text | Séries auxiliares |

#### Dados Originais (quando adulterado)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| originalPlate | String | Placa original do veículo |
| originalBrand | String | Marca original |
| originalModel | String | Modelo original |
| originalSpecies | Enum | Espécie original |
| originalType | Enum | Tipo original |
| originalColor | String | Cor original |
| originalChassi | String | Chassi original |
| originalMotor | String | Motor original |
| originalLicensedTo | String | Proprietário original |
| originalAnalysisDetails | Text | Detalhes da análise de adulteração |

#### Análise e Conclusão

| Campo | Tipo | Descrição |
|-------|------|-----------|
| analysisIsConclusive | Boolean | Se a análise é conclusiva |
| analysisConclusion | Text | Conclusão do laudo |
| analysisJustification | Text | Justificativa (obrigatória se inconclusivo) |
| analysisObservations | Text | Observações adicionais |
| expertSignature | Text | Assinatura digital (base64) |

**Índices**:
- PRIMARY KEY (id)
- UNIQUE (number)
- INDEX (status)
- INDEX (createdBy)
- INDEX (assignedTo)
- INDEX (createdAt)

---

### 3.2.4. ReportAuditLog (Auditoria)

Registra todas as ações realizadas em um laudo.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| reportId | String | FK Report(id), NOT NULL | Laudo referenciado |
| action | String | NOT NULL | CREATED, UPDATED, ASSIGNED, CANCELLED |
| userId | String | FK Profile(id), NOT NULL | Quem fez a ação |
| userName | String | NOT NULL | Nome do usuário (desnormalizado) |
| details | Text | NULL | Detalhes adicionais |
| timestamp | DateTime | DEFAULT now() | Quando ocorreu |

**Restrições**:
- ON DELETE CASCADE (reportId) - Deleta logs ao deletar laudo

**Índices**:
- PRIMARY KEY (id)
- INDEX (reportId)
- INDEX (timestamp)

---

### 3.2.5. VehiclePhoto (Fotos)

Armazena fotos do veículo em base64.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| reportId | String | FK Report(id), NOT NULL | Laudo referenciado |
| category | String | NOT NULL | vehicle, plate, glass, chassi, motor, tag, year_plate, central, auxiliary, evidence |
| subtype | String | NULL | Para evidências: tipo específico de adulteração |
| photoData | Text | NOT NULL | Imagem em base64 |
| description | Text | NULL | Descrição da foto |
| createdAt | DateTime | DEFAULT now() | Data do upload |

**Restrições**:
- ON DELETE CASCADE (reportId) - Deleta fotos ao deletar laudo

**Índices**:
- PRIMARY KEY (id)
- INDEX (reportId)

---

## 3.3. Enums

### 3.3.1. AppRole

```prisma
enum AppRole {
  AGENT    // Agente que gerencia laudos
  OFFICER  // Policial que executa laudos
}
```

### 3.3.2. Department

```prisma
enum Department {
  TRAFFIC          // Trânsito
  CRIMINAL         // Criminal
  ADMINISTRATIVE   // Administrativo
}
```

### 3.3.3. ReportStatus

```prisma
enum ReportStatus {
  PENDING       // Aguardando atribuição
  RECEIVED      // Atribuído a um policial
  IN_PROGRESS   // Policial iniciou trabalho
  COMPLETED     // Laudo finalizado
  CANCELLED     // Laudo cancelado
}
```

**Transições válidas**:
```
PENDING → RECEIVED → IN_PROGRESS → COMPLETED
PENDING → CANCELLED
RECEIVED → CANCELLED
IN_PROGRESS → CANCELLED
```

### 3.3.4. Priority

```prisma
enum Priority {
  HIGH     // Alta prioridade
  MEDIUM   // Média prioridade
  LOW      // Baixa prioridade
}
```

### 3.3.5. VehicleSpecies (Espécie)

```prisma
enum VehicleSpecies {
  PASSAGEIRO
  CARGA
  MISTO
  COMPETICAO
  COLECAO
  TRACAO
  ESPECIAL
  LOCOMOCAO
  ENSINO
  AUTORIDADE
  VISITANTE
}
```

### 3.3.6. VehicleType (Tipo)

```prisma
enum VehicleType {
  AUTOMOVEL
  CAMIONETA
  CAMIONETA_MISTA
  CAMINHAO
  CAMINHAO_TRATOR
  UTILITARIO
  MICROONIBUS
  ONIBUS
  REBOQUE
  SEMI_REBOQUE
  MOTOCICLETA
  MOTONETA
  CICLOMOTOR
  TRICICLO
  QUADRICICLO
  BICICLETA_MOTORIZADA
  ESPECIAL
  SIDE_CAR
  CHASSI_PLATAFORMA
  TRATOR_RODAS
  TRATOR_ESTEIRAS
  TRATOR_MISTO
  MAQUINA_TERRAPLANAGEM
  MAQUINA_AGRICOLA
}
```

---

## 3.4. Relacionamentos

### Profile ↔ UserRole (1:N)
- Um usuário pode ter múltiplas roles (embora o sistema use apenas uma por usuário atualmente)
- Cascade delete: Deleta roles ao deletar usuário

### Profile ↔ Report (1:N) - Creator
- Um agente pode criar múltiplos laudos
- Um laudo é criado por apenas um agente
- Não há cascade: Laudos permanecem se agente for deletado

### Profile ↔ Report (1:N) - Assignee
- Um policial pode ter múltiplos laudos atribuídos
- Um laudo é atribuído a no máximo um policial
- Não há cascade: Laudos permanecem se policial for deletado

### Report ↔ VehiclePhoto (1:N)
- Um laudo pode ter múltiplas fotos
- Uma foto pertence a apenas um laudo
- Cascade delete: Fotos são deletadas ao deletar laudo

### Report ↔ ReportAuditLog (1:N)
- Um laudo tem múltiplos logs de auditoria
- Um log pertence a apenas um laudo
- Cascade delete: Logs são deletados ao deletar laudo

### Profile ↔ ReportAuditLog (1:N)
- Um usuário pode ter múltiplas entradas de log
- Um log é criado por apenas um usuário
- Não há cascade: Logs permanecem se usuário for deletado (campo userName preserva o nome)

---

## 3.5. Regras de Integridade

### Unicidade
- `Profile.username` - Único no sistema
- `Profile.email` - Único no sistema
- `Profile.badge` - Único no sistema
- `Report.number` - Único no sistema
- `(UserRole.userId, UserRole.role)` - Combinação única

### Obrigatoriedade
- Todos os campos marcados como NOT NULL são obrigatórios
- `Report.assignedTo` é NULL quando status é PENDING
- `Report.assignedAt` é preenchido quando laudo é atribuído

### Validações de Negócio
- Status COMPLETED requer que `analysisConclusion` e `analysisIsConclusive` estejam preenchidos
- Se `analysisIsConclusive = false`, então `analysisJustification` é obrigatório
- Se `vehicleIsAdulterated = true`, campos `original*` devem ser preenchidos

### Desnormalização Intencional
- `ReportAuditLog.userName` é desnormalizado (cópia do nome no momento da ação)
- Justificativa: Preservar histórico mesmo se o nome do usuário mudar

---

## 3.6. Armazenamento de Fotos

### Estratégia: Base64 no Banco

**Por que base64 ao invés de storage externo (S3, etc)?**

✅ **Vantagens**:
1. **Simplicidade**: Sem necessidade de serviço adicional
2. **Transações Atômicas**: Foto e laudo na mesma transação
3. **Backup Unificado**: Backup do banco inclui fotos
4. **Sem URLs Quebradas**: Não há risco de link para foto quebrar
5. **Custo Zero**: Sem custo de storage externo

⚠️ **Desvantagens**:
1. **Tamanho do Banco**: Fotos aumentam tamanho do banco
2. **Performance**: Queries trazem fotos (mitigado com select específico)
3. **Limite de Tamanho**: Base64 aumenta tamanho em ~33%

**Mitigações**:
- Limitar tamanho de foto a 5MB no upload
- Comprimir imagens no frontend antes de salvar
- Usar select específico quando não precisar de fotos

**Exemplo de query otimizada**:
```typescript
// Sem fotos (mais rápido)
const reports = await prisma.report.findMany({
  select: {
    id: true,
    number: true,
    status: true,
    // ... outros campos
    // photos: false (não seleciona)
  }
});

// Com fotos (quando necessário)
const report = await prisma.report.findUnique({
  where: { id },
  include: { photos: true }
});
```

---

## 3.7. Índices e Performance

### Índices Criados
1. **Chaves Primárias**: Automáticas para todas as tabelas
2. **Unique Constraints**: username, email, badge, report.number
3. **Foreign Keys**: Automáticas para todas as FKs

### Índices Sugeridos (Futuros)
```sql
-- Busca de laudos por status
CREATE INDEX idx_reports_status ON reports(status);

-- Busca de laudos por data
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Busca de laudos atribuídos a um policial
CREATE INDEX idx_reports_assigned_to ON reports(assigned_to)
WHERE assigned_to IS NOT NULL;

-- Logs de auditoria por laudo
CREATE INDEX idx_audit_report_id ON report_audit_log(report_id);

-- Fotos por laudo
CREATE INDEX idx_photos_report_id ON vehicle_photos(report_id);
```

---

## 3.8. Estimativas de Volume

### Dados Estimados (1 ano de operação)

| Tabela | Registros Estimados | Tamanho Médio | Total Estimado |
|--------|---------------------|---------------|----------------|
| Profile | 50 usuários | 1KB | 50KB |
| UserRole | 50 roles | 0.5KB | 25KB |
| Report | 5000 laudos | 10KB (sem fotos) | 50MB |
| ReportAuditLog | 25000 logs | 0.5KB | 12.5MB |
| VehiclePhoto | 50000 fotos | 500KB (base64) | 25GB |

**Total Estimado**: ~25GB em 1 ano

**Considerações**:
- Vercel Postgres Free Tier: 256MB (insuficiente)
- Necessário plano pago ou otimizar armazenamento de fotos
- Alternativa: Migrar fotos para S3 no futuro

---

## 3.9. Migrations

### Gerenciamento com Prisma

```bash
# Criar migration
npx prisma migrate dev --name add_new_field

# Aplicar em produção
npx prisma migrate deploy

# Reset (desenvolvimento)
npx prisma migrate reset
```

### Histórico de Migrations

1. **init**: Criação inicial das tabelas
2. **add_vehicle_fields**: Adição de campos do veículo
3. **add_original_data**: Dados originais para veículos adulterados
4. **add_photo_description**: Descrição nas fotos

---

**Próximo**: [04. Funcionalidades Detalhadas](./04-funcionalidades.md)
