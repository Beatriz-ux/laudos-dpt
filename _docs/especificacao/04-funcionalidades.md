# 4. Funcionalidades Detalhadas

## 4.1. Módulo de Autenticação

### 4.1.1. Login

**Rota**: `/auth/login`
**Acesso**: Público

**Funcionalidade**: Permite que usuários façam login no sistema usando username e senha.

**Campos**:
- Username (obrigatório)
- Senha (obrigatório)
- Nova senha (condicional - quando must_change_password = true)

**Fluxo Normal**:
1. Usuário insere username e senha
2. Sistema valida credenciais
3. Se válido e must_change_password = false:
   - Gera JWT token
   - Redireciona para dashboard apropriado
4. Se válido mas must_change_password = true:
   - Solicita nova senha
   - Usuário define nova senha
   - Sistema atualiza senha e marca must_change_password = false
   - Gera JWT token
   - Redireciona para dashboard

**Validações**:
- Username não pode estar vazio
- Senha não pode estar vazia
- Nova senha deve ter no mínimo 8 caracteres
- Usuário deve estar ativo (isActive = true)

**Mensagens de Erro**:
- "Credenciais inválidas" - Username ou senha incorretos
- "Usuário inativo" - Conta desativada
- "Nova senha deve ter no mínimo 8 caracteres"

**Redirecionamentos**:
- AGENT → `/agent/dashboard`
- OFFICER → `/officer/dashboard`

**Actions**:
- `src/actions/auth/login.ts`

---

### 4.1.2. Logout

**Rota**: `/auth/logout`
**Acesso**: Autenticado

**Funcionalidade**: Encerra sessão do usuário.

**Fluxo**:
1. Remove JWT token do cookie
2. Limpa estado de autenticação
3. Redireciona para `/auth/login`

**Actions**:
- `src/actions/auth/logout.ts`

---

### 4.1.3. Recuperação de Sessão

**Funcionalidade**: Mantém usuário logado entre sessões.

**Fluxo**:
1. Ao carregar aplicação, verifica cookie com JWT
2. Se válido, busca dados do usuário
3. Restaura sessão automaticamente
4. Se inválido ou expirado, redireciona para login

**Actions**:
- `src/actions/auth/get-current-user.ts`

---

## 4.2. Módulo do Agente

### 4.2.1. Dashboard do Agente

**Rota**: `/agent/dashboard`
**Acesso**: AGENT apenas

**Funcionalidade**: Visão geral do departamento com estatísticas e laudos recentes.

**Componentes Exibidos**:

1. **Cards de Estatísticas**:
   - Total de Laudos
   - Laudos Pendentes (PENDING)
   - Laudos em Andamento (IN_PROGRESS)
   - Laudos Concluídos (COMPLETED)

2. **Laudos Recentes**:
   - Tabela com últimos 5 laudos criados
   - Colunas: Número, Status, Prioridade, Placa, Local, Policial, Prazo
   - Ações rápidas: Ver detalhes, Atribuir

3. **Ações Rápidas**:
   - Criar Novo Laudo
   - Ver Todos os Laudos
   - Gerenciar Policiais

**Actions**:
- `src/actions/dashboard/get-stats.ts`
- `src/actions/reports/get-reports.ts`

---

### 4.2.2. Gerenciamento de Laudos

**Rota**: `/agent/reports`
**Acesso**: AGENT apenas

**Funcionalidade**: Listar, buscar, filtrar e gerenciar todos os laudos do sistema.

**Funcionalidades**:

1. **Listagem**:
   - Todos os laudos do sistema
   - Paginação (50 por página)
   - Ordenação por data de criação (mais recentes primeiro)

2. **Busca**:
   - Por número do laudo
   - Por placa do veículo
   - Por chassi
   - Por endereço/local

3. **Filtros**:
   - Por status (PENDING, RECEIVED, IN_PROGRESS, COMPLETED, CANCELLED)
   - Por prioridade (HIGH, MEDIUM, LOW)
   - Por departamento
   - Por período de criação
   - Por policial atribuído

4. **Visualização**:
   - Modo tabela (padrão)
   - Modo cards (grid)

5. **Ações por Laudo**:
   - Ver detalhes
   - Atribuir/Reatribuir policial
   - Cancelar laudo (com justificativa)
   - Exportar PDF

**Colunas da Tabela**:
| Coluna | Descrição |
|--------|-----------|
| Número | YYYYMMDD-DEPT-XXXX |
| Status | Badge colorido |
| Prioridade | Badge colorido |
| Placa | Placa do veículo |
| Local | Cidade/Endereço |
| Policial | Nome do policial atribuído ou "Não atribuído" |
| Prazo | Dias restantes ou "Vencido" |
| Criado em | Data de criação |
| Ações | Dropdown com opções |

**Actions**:
- `src/actions/reports/get-reports.ts`
- `src/actions/reports/assign-report.ts`
- `src/actions/reports/cancel-report.ts`

---

### 4.2.3. Criar Novo Laudo

**Componente**: `CreateReportDialog`
**Acesso**: AGENT apenas

**Funcionalidade**: Criar novo laudo pericial.

**Formulário - Etapa 1: Requisição**:
- Órgão Requisitante (texto)
- Autoridade Requisitante (texto)
- Guia/Ofício (texto)
- Data Guia/Ofício (date)
- Ocorrência Policial (texto)
- Objetivo da Perícia (textarea, valor padrão sugerido)
- Preâmbulo (textarea, valor padrão sugerido)

**Formulário - Etapa 2: Veículo**:
- Placa Portada (obrigatório, formato ABC1234 ou ABC1D23)
- Marca/Modelo (texto)
- Espécie (select com enum)
- Tipo (select com enum)
- Cor (texto)

**Formulário - Etapa 3: Localização**:
- Endereço (texto)
- Cidade (texto)
- Estado (select com UFs)
- Coordenadas GPS (opcional)

**Formulário - Etapa 4: Atribuição**:
- Prioridade (select: HIGH, MEDIUM, LOW)
- Prazo (date, opcional)
- Policial (select, opcional - pode atribuir depois)

**Validações**:
- Placa é obrigatória e deve estar no formato correto
- Prioridade é obrigatória
- Se policial for selecionado, status inicia como RECEIVED
- Se não, status inicia como PENDING

**Ao Criar**:
1. Gera número único (YYYYMMDD-DEPT-XXXX)
2. Define status (PENDING ou RECEIVED)
3. Salva no banco
4. Cria log de auditoria (CREATED)
5. Se atribuído, cria log (ASSIGNED)
6. Mostra notificação de sucesso
7. Redireciona para lista de laudos ou abre detalhes

**Actions**:
- `src/actions/reports/create-report.ts`

---

### 4.2.4. Detalhes do Laudo (Agente)

**Rota**: `/agent/reports/[id]`
**Acesso**: AGENT apenas

**Funcionalidade**: Visualizar todas as informações de um laudo.

**Seções Exibidas**:

1. **Cabeçalho**:
   - Número do laudo
   - Status atual (badge)
   - Prioridade (badge)
   - Botões: Atribuir, Cancelar, Exportar PDF

2. **Dados da Requisição**:
   - Órgão requisitante
   - Autoridade
   - Guia/Ofício e data
   - Ocorrência policial
   - Objetivo da perícia
   - Preâmbulo
   - Criado por (nome do agente)
   - Criado em (data/hora)

3. **Localização**:
   - Endereço completo
   - Cidade/Estado
   - Coordenadas (se disponível)

4. **Dados do Veículo**:
   - Placa portada
   - Marca/Modelo/Ano
   - Espécie/Tipo
   - Cor
   - Chassi/VIN
   - Motor
   - Condições técnicas
   - Se é adulterado

5. **Fotos** (se preenchido pelo policial):
   - Grid de fotos organizadas por categoria
   - Lightbox para visualização ampliada
   - Numeração sequencial

6. **Dados Originais** (se veículo adulterado):
   - Placa original
   - Marca/Modelo/Espécie/Tipo original
   - Cor/Chassi/Motor original
   - Proprietário original
   - Detalhes da análise de adulteração

7. **Análise e Conclusão**:
   - Se é conclusivo ou inconclusivo
   - Conclusão do laudo
   - Justificativa
   - Observações

8. **Histórico de Auditoria**:
   - Timeline com todas as ações
   - Quem fez, quando e o quê
   - CREATED, ASSIGNED, UPDATED, CANCELLED

**Ações Disponíveis**:
- **Atribuir/Reatribuir**: Abre dialog para selecionar policial
- **Cancelar**: Abre dialog para inserir motivo
- **Exportar PDF**: Gera PDF oficial do laudo
- **Voltar**: Retorna para lista de laudos

**Actions**:
- `src/actions/reports/get-report-by-id.ts`
- `src/actions/reports/assign-report.ts`
- `src/actions/reports/cancel-report.ts`

---

### 4.2.5. Gerenciar Policiais

**Rota**: `/agent/officers`
**Acesso**: AGENT apenas

**Funcionalidade**: Criar, editar e visualizar policiais.

**Listagem**:
- Todos os policiais cadastrados
- Busca por nome, matrícula, email, departamento
- Filtro por departamento
- Filtro por status (ativo/inativo)

**Colunas**:
| Coluna | Descrição |
|--------|-----------|
| Matrícula | Badge do policial |
| Nome | Nome completo |
| Email | Email institucional |
| Departamento | TRAFFIC, CRIMINAL, ADMINISTRATIVE |
| Status | Ativo/Inativo |
| Laudos | Total de laudos atribuídos |
| Cadastrado em | Data de criação |

**Criar Policial**:
- Dialog com formulário
- Campos: Username, Email, Nome, Departamento, Matrícula
- Sistema gera senha temporária automática
- Policial deve trocar senha no primeiro acesso
- Role OFFICER é atribuída automaticamente

**Editar Policial**:
- Alterar nome, email, departamento, matrícula
- Ativar/Desativar usuário
- Não permite alterar username
- Não permite alterar senha (policial faz isso no perfil)

**Actions**:
- `src/actions/officers/get-officers.ts`
- `src/actions/officers/create-officer.ts`

---

### 4.2.6. Perfil do Agente

**Rota**: `/agent/profile`
**Acesso**: AGENT apenas

**Funcionalidade**: Ver e editar informações pessoais.

**Informações Exibidas**:
- Nome completo
- Username
- Email
- Matrícula
- Departamento
- Último acesso
- Membro desde

**Ações**:
- Alterar senha
- Atualizar email

**Alterar Senha**:
- Senha atual (validação obrigatória)
- Nova senha (mínimo 8 caracteres)
- Confirmar nova senha (deve ser igual)

---

## 4.3. Módulo do Policial

### 4.3.1. Dashboard do Policial

**Rota**: `/officer/dashboard`
**Acesso**: OFFICER apenas

**Funcionalidade**: Visão geral dos laudos atribuídos ao policial.

**Cards de Estatísticas**:
- Laudos Recebidos (RECEIVED) - aguardando início
- Laudos em Andamento (IN_PROGRESS) - rascunhos
- Laudos Concluídos (COMPLETED)
- Total de Laudos Atribuídos

**Seções**:

1. **Laudos Recebidos**:
   - Lista de laudos com status RECEIVED
   - Informações: Número, Prioridade, Placa, Local, Recebido há X dias
   - Ação: Iniciar laudo

2. **Rascunhos**:
   - Lista de laudos com status IN_PROGRESS
   - Informações: Número, Prioridade, Placa, Local, Progresso estimado
   - Ação: Continuar preenchimento

3. **Concluídos Recentemente**:
   - Últimos 5 laudos finalizados
   - Informações: Número, Placa, Concluído em
   - Ação: Visualizar

**Actions**:
- `src/actions/dashboard/get-stats.ts` (com userId)
- `src/actions/reports/get-reports.ts` (com userId)

---

### 4.3.2. Laudos Recebidos

**Rota**: `/officer/reports/received`
**Acesso**: OFFICER apenas

**Funcionalidade**: Listar todos os laudos recebidos (RECEIVED).

**Listagem**:
- Apenas laudos com status RECEIVED atribuídos ao policial logado
- Ordenados por prioridade e data de atribuição

**Colunas**:
| Coluna | Descrição |
|--------|-----------|
| Número | YYYYMMDD-DEPT-XXXX |
| Prioridade | Badge HIGH/MEDIUM/LOW |
| Placa | Placa do veículo |
| Local | Cidade/Endereço |
| Recebido há | X dias atrás |
| Criado em | Data de criação |
| Ações | Iniciar, Ver |

**Ação "Iniciar"**:
1. Muda status para IN_PROGRESS
2. Cria log de auditoria
3. Abre formulário de preenchimento

**Actions**:
- `src/actions/reports/get-reports.ts`
- `src/actions/reports/update-report.ts`

---

### 4.3.3. Laudos em Andamento

**Rota**: `/officer/reports/in-progress`
**Acesso**: OFFICER apenas

**Funcionalidade**: Listar laudos em andamento (rascunhos).

**Similar a "Laudos Recebidos"**, mas:
- Filtra por status IN_PROGRESS
- Ação principal é "Continuar"
- Mostra progresso estimado (baseado em campos preenchidos)

**Actions**:
- `src/actions/reports/get-reports.ts`

---

### 4.3.4. Laudos Concluídos

**Rota**: `/officer/reports/completed`
**Acesso**: OFFICER apenas

**Funcionalidade**: Listar laudos finalizados.

**Similar aos anteriores**, mas:
- Filtra por status COMPLETED
- Modo visualização apenas (read-only)
- Ação principal é "Ver"
- Pode exportar PDF

**Actions**:
- `src/actions/reports/get-reports.ts`

---

### 4.3.5. Preencher Laudo (Mobile-First)

**Rota**: `/officer/reports/[id]`
**Acesso**: OFFICER apenas (somente laudos atribuídos a si)

**Funcionalidade**: Formulário completo para preencher dados do laudo no local da perícia.

**Interface Responsiva**:
- Layout otimizado para celular
- Tabs para organizar seções
- Salva automaticamente rascunho
- Botões grandes para fácil toque
- Captura de fotos via câmera do celular

**Abas/Seções**:

#### 1. Dados do Veículo
**Campos**:
- Placa (pré-preenchido pelo agente)
- Chassi (texto)
- VIN (texto)
- Marca (texto)
- Modelo (texto)
- Ano (número)
- Categoria (texto)
- Cor (texto)
- Série do Motor (texto)
- Licenciado em nome de (texto)
- Condições Técnicas (textarea)
- Veículo adulterado? (checkbox)

**Comportamento**:
- Se marcar "adulterado", habilita abas de Evidências e Dados Originais
- Salva automaticamente a cada campo preenchido (debounce de 2s)

#### 2. Fotos
**Categorias de Fotos**:
1. Fotos do Veículo (geral)
2. Fotos da Placa
3. Fotos dos Vidros
4. Fotos do Chassi
5. Fotos do Motor
6. Fotos das Etiquetas
7. Fotos da Plaqueta do Ano
8. Fotos da Central Eletrônica
9. Fotos das Séries Auxiliares

**Funcionalidade**:
- Botão "Tirar/Adicionar Foto" por categoria
- Abre câmera do celular diretamente (`<input capture="environment">`)
- Permite selecionar da galeria também
- Preview das fotos adicionadas
- Botão para remover foto (X vermelho)
- Grid 2 colunas no mobile, 4 no desktop
- Fotos são convertidas para base64 e salvas imediatamente

**Validações**:
- Máximo 5MB por foto
- Formatos: JPEG, PNG, WEBP
- Compressão automática se exceder 5MB

#### 3. Evidências (Condicional)
**Aparece apenas se vehicleIsAdulterated = true**

**Tipos de Evidências**:
1. Chassi Adulterado
2. Motor Adulterado
3. Vidros Adulterados
4. Placas Adulteradas
5. Etiquetas Adulteradas
6. Plaqueta do Ano Adulterada
7. Central Eletrônica Adulterada
8. Séries Auxiliares Adulteradas

**Funcionalidade**:
- Similar à aba de Fotos
- Cada tipo de evidência tem sua própria seção
- Fotos são categorizadas como "evidence" com subtype específico

#### 4. Dados Originais (Condicional)
**Aparece apenas se vehicleIsAdulterated = true**

**Campos**:
- Placa Original
- Marca/Modelo Original
- Espécie Original (enum)
- Tipo Original (enum)
- Cor Original
- Chassi Original
- Motor Original
- Licenciado em Nome de (proprietário original)
- Detalhes da Análise (textarea - comparação entre adulterado e original)

**Comportamento**:
- Campos obrigatórios se adulteração for detectada
- Validação impede finalizar sem preencher

#### 5. Informações Adicionais
**Campos**:
- Informações dos Vidros (textarea)
- Informações das Placas (textarea)
- Informações do Motor (textarea)
- Central Eletrônica (textarea)
- Séries Auxiliares (textarea)

**Comportamento**:
- Todos opcionais
- Complementam as fotos

#### 6. Análise e Conclusão
**Campos**:
- Conclusão (textarea, obrigatório) - Texto da conclusão do laudo
- Tipo de Conclusão (radio, obrigatório):
  - Conclusivo
  - Inconclusivo
- Justificativa (textarea, obrigatório se inconclusivo)
- Observações (textarea, opcional)

**Validações**:
- Conclusão é obrigatória
- Tipo de conclusão é obrigatório
- Se inconclusivo, justificativa é obrigatória

**Botões de Ação**:
- **Salvar Rascunho** (sempre disponível):
  - Salva dados atuais
  - Mantém status IN_PROGRESS
  - Mostra mensagem "Rascunho salvo"

- **Finalizar Laudo** (disponível apenas se campos obrigatórios preenchidos):
  - Valida todos os campos obrigatórios
  - Muda status para COMPLETED
  - Cria log de auditoria
  - Mostra dialog de confirmação
  - Redireciona para lista de concluídos

**Auto-save**:
- Sistema salva automaticamente a cada 30 segundos
- Salva ao mudar de aba
- Salva ao adicionar/remover foto
- Indicador visual "Salvando..." / "Salvo"

**Actions**:
- `src/actions/reports/get-report-by-id.ts`
- `src/actions/reports/update-report.ts`

---

### 4.3.6. Perfil do Policial

**Rota**: `/officer/profile`
**Acesso**: OFFICER apenas

**Similar ao perfil do agente**, com funcionalidades:
- Ver informações pessoais
- Alterar senha
- Atualizar email
- Ver estatísticas pessoais (laudos concluídos, em andamento, etc)

---

## 4.4. Funcionalidades Transversais

### 4.4.1. Geração de PDF

**Função**: `src/lib/pdf-generator.ts`

**Funcionalidade**: Gerar PDF oficial do laudo pericial.

**Estrutura do PDF**:

1. **Cabeçalho**:
   - GOVERNO DO ESTADO DA BAHIA
   - SECRETARIA DA SEGURANÇA PÚBLICA
   - DEPARTAMENTO DE POLÍCIA TÉCNICA
   - DIRETORIA DO INTERIOR
   - COORDENADORIA DE POLÍCIA TÉCNICA DE ILHÉUS

2. **Título**:
   - LAUDO DE EXAME PERICIAL Nº [NÚMERO]

3. **Seção 1: Requisição**:
   - Órgão requisitante
   - Autoridade
   - Guia/Ofício
   - Data
   - Ocorrência

4. **Seção 2: Objetivo da Perícia**:
   - Texto do objetivo

5. **Seção 3: Preâmbulo**:
   - Texto padrão

6. **Seção 4: Dados do Veículo**:
   - Tabela com todos os dados coletados

7. **Seção 5: Localização**:
   - Endereço onde o veículo foi periciado

8. **Seção 6: Informações Técnicas**:
   - Vidros, placas, motor, etc

9. **Seção 7: Dados Originais** (se adulterado):
   - Tabela comparativa

10. **Seção 8: Fotos**:
    - Máximo 2 fotos por página
    - Numeradas sequencialmente (Foto 1, Foto 2, ...)
    - Categoria de cada foto

11. **Seção 9: Análise e Conclusão**:
    - Conclusão do laudo
    - Se conclusivo ou inconclusivo
    - Justificativa
    - Observações

12. **Assinatura**:
    - Nome do perito
    - Matrícula
    - Local e data
    - Espaço para assinatura física (opcional)

13. **Rodapé** (todas as páginas):
    - Número da página
    - Total de páginas
    - Número do laudo

**Formato**:
- Tamanho: A4 (210mm x 297mm)
- Orientação: Retrato
- Margens: 20mm
- Fonte: Times New Roman (títulos) e Arial (conteúdo)

**Uso**:
```typescript
import { generateReportPDF } from '@/lib/pdf-generator';

await generateReportPDF({
  report: reportData,
  expertName: officer.name,
  expertBadge: officer.badge,
});
```

---

### 4.4.2. Auditoria (Audit Trail)

**Tabela**: `report_audit_log`

**Funcionalidade**: Registrar todas as ações em um laudo.

**Ações Auditadas**:

| Ação | Quando | Quem | Detalhes |
|------|--------|------|----------|
| CREATED | Laudo criado | Agente | "Laudo criado" |
| ASSIGNED | Laudo atribuído | Agente | "Atribuído para [Nome do Policial]" |
| UPDATED | Laudo atualizado | Agente ou Policial | "Laudo atualizado" |
| CANCELLED | Laudo cancelado | Agente | "Cancelado: [Motivo]" |

**Visualização**:
- Timeline na página de detalhes do laudo
- Ordem cronológica (mais antigo no topo)
- Ícone por tipo de ação
- Nome do usuário que fez
- Data/hora exata
- Detalhes da ação

**Exemplo**:
```
📝 CREATED
   Por: Carlos Silva Santos
   Em: 30/11/2024 10:30
   Laudo criado

👤 ASSIGNED
   Por: Carlos Silva Santos
   Em: 30/11/2024 10:35
   Atribuído para Roberto Ferreira Lima

✏️ UPDATED
   Por: Roberto Ferreira Lima
   Em: 30/11/2024 14:20
   Laudo atualizado

✅ UPDATED
   Por: Roberto Ferreira Lima
   Em: 30/11/2024 16:00
   Laudo finalizado
```

---

### 4.4.3. Busca Global

**Componente**: `SearchFilter`

**Funcionalidade**: Buscar laudos por múltiplos critérios.

**Campos de Busca**:
- Texto livre (busca em número, placa, chassi, endereço)
- Status (multi-select)
- Prioridade (multi-select)
- Departamento (select)
- Período de criação (date range)
- Período de conclusão (date range)
- Policial atribuído (select)

**Comportamento**:
- Busca debounced (300ms)
- Filtros aplicados em tempo real
- Indicador de filtros ativos
- Botão "Limpar filtros"

---

### 4.4.4. Notificações Toast

**Biblioteca**: `react-toastify`

**Tipos de Notificações**:

1. **Sucesso** (verde):
   - "Laudo criado com sucesso"
   - "Laudo atribuído"
   - "Rascunho salvo"
   - "Laudo finalizado"
   - "PDF gerado com sucesso"

2. **Erro** (vermelho):
   - "Erro ao criar laudo"
   - "Erro ao salvar"
   - "Credenciais inválidas"

3. **Aviso** (amarelo):
   - "Campos obrigatórios não preenchidos"
   - "Sessão expirando em breve"

4. **Info** (azul):
   - "Salvando rascunho..."
   - "Gerando PDF..."

**Configuração**:
- Posição: top-right
- Auto-dismiss: 3 segundos (sucesso), 5 segundos (erro)
- Progress bar
- Close button

---

## 4.5. Validações por Módulo

### Validações de Criação de Laudo

| Campo | Validação |
|-------|-----------|
| Placa | Obrigatório, formato ABC1234 ou ABC1D23 |
| Prioridade | Obrigatório |
| Órgão Requisitante | Opcional |
| Data Guia | Data válida, não pode ser futura |

### Validações de Preenchimento (Policial)

| Campo | Validação |
|-------|-----------|
| Chassi | Mínimo 17 caracteres |
| Ano | Entre 1900 e ano atual + 1 |
| Fotos | Máximo 5MB por foto, formatos JPEG/PNG/WEBP |
| Conclusão | Obrigatório para finalizar |
| Tipo de Conclusão | Obrigatório para finalizar |
| Justificativa | Obrigatório se inconclusivo |

---

**Próximo**: [05. Fluxogramas e Diagramas](./05-fluxogramas.md)
