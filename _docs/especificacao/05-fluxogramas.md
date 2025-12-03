# 5. Fluxogramas e Diagramas de Processos

## 5.1. Fluxo Completo do Sistema

```
┌────────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO DE UM LAUDO                      │
└────────────────────────────────────────────────────────────────────┘

INÍCIO
  │
  ▼
┌─────────────────────┐
│  Autoridade emite   │
│  requisição oficial │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 1: CRIAÇÃO (AGENTE)                     │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Agente faz login   │
│  no sistema         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Acessa dashboard   │
│  /agent/dashboard   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Novo Laudo" │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│  Preenche formulário:   │
│  - Requisição           │
│  - Veículo              │
│  - Localização          │
│  - Prioridade           │
│  - Policial (opcional)  │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────┐
│  Sistema gera       │
│  número único:      │
│  YYYYMMDD-DEPT-XXXX │
└──────────┬──────────┘
           │
           ▼
      ┌────┴────┐
      │ Atribuiu│
      │policial?│
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             ▼
Status:      Status:
RECEIVED     PENDING
    │             │
    └──────┬──────┘
           │
           ▼
┌─────────────────────┐
│  Laudo criado       │
│  Audit: CREATED     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│              FASE 2: ATRIBUIÇÃO (se não feito)                  │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Agente acessa      │
│  lista de laudos    │
│  /agent/reports     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Seleciona laudo    │
│  PENDING            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Atribuir"   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Seleciona policial │
│  da lista           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Sistema atualiza:  │
│  - assignedTo       │
│  - assignedAt       │
│  - status=RECEIVED  │
│  Audit: ASSIGNED    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FASE 3: EXECUÇÃO (POLICIAL)                    │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Policial faz login │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Acessa dashboard   │
│  /officer/dashboard │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Vê laudo RECEIVED  │
│  em "Recebidos"     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Iniciar"    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  status=IN_PROGRESS │
│  Audit: UPDATED     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Policial vai ao    │
│  local indicado     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│  Abre formulário no     │
│  celular                │
│  /officer/reports/[id]  │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────┐
│  Preenche aba a aba:│
│  1. Dados veículo   │
│  2. Fotos           │
│  3. Evidências (?)  │
│  4. Dados originais │
│  5. Informações     │
│  6. Análise         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Tira fotos com     │
│  câmera do celular  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Sistema salva      │
│  automaticamente    │
│  (auto-save 30s)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Preenche conclusão:│
│  - Texto            │
│  - Conclusivo?      │
│  - Justificativa    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Finalizar"  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Sistema valida     │
│  campos obrigatórios│
└──────────┬──────────┘
           │
      ┌────┴────┐
      │  Todos  │
      │preench? │
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             ▼
Finaliza    Mostra erros
    │        volta form
    │             │
    │             ▼
    │         FIM (volta)
    │
    ▼
┌─────────────────────┐
│  status=COMPLETED   │
│  Audit: UPDATED     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Redireciona para   │
│  /officer/reports/  │
│  completed          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                FASE 4: VISUALIZAÇÃO (AGENTE)                    │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Agente vê laudo    │
│  COMPLETED na lista │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clica para ver     │
│  detalhes completos │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Visualiza:         │
│  - Todos os dados   │
│  - Fotos numeradas  │
│  - Análise          │
│  - Histórico        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Gerar PDF"  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Sistema gera PDF   │
│  oficial formatado  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Download automático│
│  laudo-XXXX.pdf     │
└──────────┬──────────┘
           │
           ▼
          FIM
```

## 5.2. Fluxo de Autenticação

```
INÍCIO
  │
  ▼
┌─────────────────────┐
│  Usuário acessa     │
│  /auth/login        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Insere:            │
│  - Username         │
│  - Senha            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Entrar"     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Sistema valida     │
│  credenciais no BD  │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │ Válido? │
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             ▼
Continua    Erro: Credenciais
    │        inválidas
    │             │
    │             ▼
    │           VOLTAR
    │
    ▼
┌─────────────────────┐
│  Busca profile      │
│  e roles            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Verifica           │
│  mustChangePassword │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │  true?  │
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             ▼
Solicita      Gera JWT
nova senha        │
    │             │
    ▼             ▼
Usuário      Salva no
informa      cookie
    │             │
    ▼             ▼
Valida       Atualiza
(min 8 char) lastLogin
    │             │
    ▼             ▼
Atualiza     Redireciona
senha            │
    │             │
    ▼        ┌────┴────┐
Marca        │  Role?  │
mustChange   └────┬────┘
= false           │
    │        ┌────┴────┐
    │        │         │
    └────►AGENT     OFFICER
              │         │
              ▼         ▼
         /agent/    /officer/
         dashboard  dashboard
              │         │
              └────┬────┘
                   │
                   ▼
                  FIM
```

## 5.3. Fluxo de Criação de Laudo

```
INÍCIO
  │
  ▼
┌─────────────────────┐
│  Agente no          │
│  /agent/dashboard   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clica botão        │
│  "Novo Laudo"       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Abre dialog        │
│  CreateReportDialog │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────┐
│  ETAPA 1: Requisição     │
│  - Órgão requisitante    │
│  - Autoridade            │
│  - Guia/Ofício           │
│  - Data                  │
│  - Ocorrência            │
│  - Objetivo (padrão)     │
│  - Preâmbulo (padrão)    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  ETAPA 2: Veículo        │
│  - Placa (obrigatório)   │
│  - Marca/Modelo          │
│  - Espécie/Tipo          │
│  - Cor                   │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  ETAPA 3: Localização    │
│  - Endereço              │
│  - Cidade                │
│  - Estado                │
│  - Coordenadas (GPS)     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  ETAPA 4: Atribuição     │
│  - Prioridade (obrig)    │
│  - Prazo                 │
│  - Policial (opcional)   │
└──────────┬───────────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Criar"      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Valida campos      │
│  obrigatórios       │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │ Válido? │
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             ▼
Continua    Mostra erros
    │        (campos em
    │         vermelho)
    │             │
    │             ▼
    │          VOLTAR
    │
    ▼
┌─────────────────────┐
│  Busca departamento │
│  do agente          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Conta laudos do    │
│  dia do depto       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Gera número:       │
│  YYYYMMDD-DEPT-XXXX │
│  Ex: 20241130-      │
│  TRAFFIC-0001       │
└──────────┬──────────┘
           │
           ▼
      ┌────┴────┐
      │Policial │
      │atribuído│
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             ▼
Status:      Status:
RECEIVED     PENDING
assignedTo   assignedTo
= id         = null
assignedAt   assignedAt
= now()      = null
    │             │
    └──────┬──────┘
           │
           ▼
┌─────────────────────┐
│  Insere no banco    │
│  (Prisma)           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Cria audit log:    │
│  action=CREATED     │
│  userId=agentId     │
│  userName=nome      │
└──────────┬──────────┘
           │
           ▼
      ┌────┴────┐
      │Policial │
      │atribuído│
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             │
Cria audit log   │
action=ASSIGNED  │
details=nome pol │
    │             │
    └──────┬──────┘
           │
           ▼
┌─────────────────────┐
│  Fecha dialog       │
│  Mostra toast       │
│  "Laudo criado!"    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Atualiza lista     │
│  de laudos          │
└──────────┬──────────┘
           │
           ▼
          FIM
```

## 5.4. Fluxo de Preenchimento de Laudo (Policial)

```
INÍCIO
  │
  ▼
┌─────────────────────┐
│  Policial acessa    │
│  laudo RECEIVED     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Iniciar"    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  status→IN_PROGRESS │
│  Audit: UPDATED     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Abre formulário    │
│  /officer/reports/  │
│  [id]               │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│        ABA: Dados Veículo       │
├─────────────────────────────────┤
│  Preenche:                      │
│  - Chassi, VIN                  │
│  - Marca, Modelo, Ano           │
│  - Cor, Categoria               │
│  - Série Motor                  │
│  - Licenciado para              │
│  - Condições técnicas           │
│  - ☐ Veículo adulterado?        │
└──────────┬──────────────────────┘
           │
      ┌────┴────┐
      │Adulter? │
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             ▼
Habilita     Desabilita
abas:        abas:
-Evidências  -Evidências
-Originais   -Originais
    │             │
    └──────┬──────┘
           │
           ▼
┌─────────────────────┐
│  Auto-save          │
│  (debounce 2s)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│           ABA: Fotos            │
├─────────────────────────────────┤
│  Para cada categoria:           │
│  1. Veículo                     │
│  2. Placa                       │
│  3. Vidros                      │
│  4. Chassi                      │
│  5. Motor                       │
│  6. Etiquetas                   │
│  7. Plaqueta Ano                │
│  8. Central Eletrônica          │
│  9. Séries Auxiliares           │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Tirar Foto" │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Abre câmera do     │
│  celular            │
│  <input capture>    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Tira foto          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Converte para      │
│  base64             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Valida:            │
│  - Tamanho < 5MB    │
│  - Formato válido   │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │ Válido? │
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             ▼
Salva no     Erro: tamanho
banco        ou formato
    │             │
    ▼             ▼
Mostra       VOLTAR
preview
    │
    └──────┬──────┘
           │
           ▼
      ┌────┴────┐
      │ Adulter?│
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             │
┌──────────────   │
│ABA: Evidências  │
│  Para cada tipo:│
│  -Chassi adult. │
│  -Motor adult.  │
│  -Vidros adult. │
│  -Placas adult. │
│  ...            │
│  (mesma lógica  │
│   de fotos)     │
└──────────┬─────┘
           │
    ┌──────┘
    │
    ▼
┌──────────────────────────────┐
│   ABA: Dados Originais       │
│  (se adulterado)             │
├──────────────────────────────┤
│  Preenche:                   │
│  - Placa original            │
│  - Marca/Modelo original     │
│  - Espécie/Tipo original     │
│  - Cor original              │
│  - Chassi original           │
│  - Motor original            │
│  - Proprietário original     │
│  - Detalhes da análise       │
└──────────┬───────────────────┘
           │
    └──────┘
           │
           ▼
┌─────────────────────────────────┐
│   ABA: Informações Adicionais   │
├─────────────────────────────────┤
│  Preenche (todos opcionais):    │
│  - Info vidros                  │
│  - Info placas                  │
│  - Info motor                   │
│  - Central eletrônica           │
│  - Séries auxiliares            │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│     ABA: Análise/Conclusão      │
├─────────────────────────────────┤
│  Preenche:                      │
│  - Conclusão (obrig)            │
│  - ⚪ Conclusivo                │
│  - ⚪ Inconclusivo              │
│  - Justificativa (se incon)     │
│  - Observações (opcional)       │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Finalizar"  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Valida campos      │
│  obrigatórios:      │
│  - Conclusão        │
│  - Tipo (conc/inc)  │
│  - Justif (se inc)  │
│  - Originais (adult)│
└──────────┬──────────┘
           │
      ┌────┴────┐
      │ Válido? │
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             ▼
Continua    Mostra erros
    │        vai para aba
    │        com erro
    │             │
    │             ▼
    │          VOLTAR
    │
    ▼
┌─────────────────────┐
│  Mostra dialog      │
│  confirmação        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  "Tem certeza?      │
│   Não poderá editar │
│   após finalizar"   │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │Confirma?│
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             ▼
Finaliza     Fecha dialog
    │         VOLTAR
    │
    ▼
┌─────────────────────┐
│  status→COMPLETED   │
│  Audit: UPDATED     │
│  details: finalizado│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Mostra toast       │
│  "Laudo finalizado" │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Redireciona para   │
│  /officer/reports/  │
│  completed          │
└──────────┬──────────┘
           │
           ▼
          FIM
```

## 5.5. Fluxo de Geração de PDF

```
INÍCIO
  │
  ▼
┌─────────────────────┐
│  Usuário visualiza  │
│  laudo COMPLETED    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clica "Gerar PDF"  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Busca dados        │
│  completos do laudo │
│  (include: fotos)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Busca dados do     │
│  perito (officer)   │
│  - Nome             │
│  - Matrícula        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Cria documento     │
│  jsPDF (A4)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Adiciona cabeçalho │
│  oficial:           │
│  - Governo BA       │
│  - SSP              │
│  - DPT              │
│  - Diretoria/Coord  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Adiciona título:   │
│  LAUDO Nº [NUMBER]  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Seção 1:           │
│  Requisição         │
│  (tabela)           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Seção 2:           │
│  Objetivo           │
│  (texto)            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Seção 3:           │
│  Preâmbulo          │
│  (texto)            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Seção 4:           │
│  Dados Veículo      │
│  (tabela)           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Seção 5:           │
│  Localização        │
│  (texto)            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Seção 6:           │
│  Informações        │
│  Técnicas           │
│  (texto)            │
└──────────┬──────────┘
           │
           ▼
      ┌────┴────┐
      │Adulter? │
      └────┬────┘
           │
    ┌──────┴──────┐
    │             │
  SIM            NÃO
    │             │
    ▼             │
Seção 7:         │
Dados            │
Originais        │
(tabela)         │
    │             │
    └──────┬──────┘
           │
           ▼
┌─────────────────────┐
│  Seção 8: Fotos     │
│  Loop por foto:     │
│  - 2 fotos/página   │
│  - Numeradas        │
│  - Com categoria    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Para cada 2 fotos: │
│  - Nova página (?)  │
│  - addImage(base64) │
│  - Texto "Foto X"   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Seção 9:           │
│  Análise/Conclusão  │
│  (texto)            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Seção 10:          │
│  Assinatura         │
│  - Nome perito      │
│  - Matrícula        │
│  - Local/Data       │
│  - Espaço assinar   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Rodapé em todas    │
│  páginas:           │
│  - Nº laudo         │
│  - Página X de Y    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  doc.save()         │
│  "laudo-XXXX.pdf"   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Browser faz        │
│  download           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Mostra toast       │
│  "PDF gerado!"      │
└──────────┬──────────┘
           │
           ▼
          FIM
```

## 5.6. Diagrama de Estados do Laudo

```
┌──────────────────────────────────────────────────────────┐
│              ESTADOS DE UM LAUDO                         │
└──────────────────────────────────────────────────────────┘

           ┌─────────────┐
     CRIAR │   PENDING   │
     ─────►│             │
           │ Aguardando  │
           │ atribuição  │
           └──────┬──────┘
                  │
            ATRIBUIR
                  │
                  ▼
           ┌─────────────┐
           │  RECEIVED   │
           │             │
           │ Atribuído   │
           │ ao policial │
           └──────┬──────┘
                  │
             INICIAR
                  │
                  ▼
           ┌─────────────┐
           │IN_PROGRESS  │
           │             │
           │ Policial    │
           │ preenchendo │
           └──────┬──────┘
                  │
            FINALIZAR
                  │
                  ▼
           ┌─────────────┐
           │ COMPLETED   │
           │             │
           │ Finalizado  │
           │ (terminal)  │
           └─────────────┘

           ┌─────────────┐
           │ CANCELLED   │
     ───┐  │             │
        │  │ Cancelado   │
        │  │ (terminal)  │
        │  └─────────────┘
        │
    CANCELAR (a partir de qualquer estado não-terminal)
```

**Estados Terminais** (não podem voltar):
- COMPLETED
- CANCELLED

**Transições Válidas**:
| De | Para | Ação | Quem |
|----|------|------|------|
| - | PENDING | Criar laudo sem atribuir | AGENT |
| - | RECEIVED | Criar laudo e atribuir | AGENT |
| PENDING | RECEIVED | Atribuir policial | AGENT |
| RECEIVED | IN_PROGRESS | Iniciar laudo | OFFICER |
| IN_PROGRESS | COMPLETED | Finalizar laudo | OFFICER |
| PENDING | CANCELLED | Cancelar | AGENT |
| RECEIVED | CANCELLED | Cancelar | AGENT |
| IN_PROGRESS | CANCELLED | Cancelar | AGENT |

---

**Próximo**: [README.md - Índice Geral](./README.md)
