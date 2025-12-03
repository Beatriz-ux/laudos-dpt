# 1. Visão Geral do Sistema

## 1.1. Contexto

O Departamento de Polícia Técnica (DPT) da Polícia Civil do Estado da Bahia realiza diariamente dezenas de exames periciais em veículos para identificar adulterações, clonagens e outros crimes relacionados. Atualmente, esse processo envolve múltiplas etapas manuais, documentos físicos e uma grande quantidade de tempo entre a requisição do laudo e sua conclusão.

### Cenário Atual
- **Requisição Manual**: Autoridades requisitam laudos através de ofícios físicos
- **Atribuição Manual**: Agentes distribuem manualmente os laudos entre os policiais
- **Preenchimento em Papel**: Policiais preenchem laudos à mão no local da perícia
- **Digitalização Posterior**: Laudos são digitalizados após conclusão
- **Perda de Informações**: Fotos podem se perder, dados podem ser mal interpretados
- **Tempo Excessivo**: Processo completo pode levar dias ou semanas

### Problemas Identificados
1. **Falta de Rastreabilidade**: Difícil saber em que etapa está cada laudo
2. **Comunicação Ineficiente**: Sem notificações automáticas entre agentes e policiais
3. **Dificuldade de Gestão**: Impossível visualizar estatísticas em tempo real
4. **Risco de Extravio**: Documentos físicos podem se perder
5. **Retrabalho**: Digitação posterior dos dados coletados
6. **Qualidade das Fotos**: Fotos podem ser de baixa qualidade ou desorganizadas

## 1.2. Solução Proposta

O **Sistema de Laudos Policiais - DPT** é uma aplicação web moderna que digitaliza e automatiza todo o processo de criação, gerenciamento e execução de laudos periciais de veículos.

### Características Principais
- **100% Digital**: Desde a criação até a conclusão
- **Multiplataforma**: Acesso via web (desktop e mobile)
- **Tempo Real**: Atualizações instantâneas de status
- **Rastreabilidade Completa**: Histórico de todas as ações (audit trail)
- **Gestão Centralizada**: Dashboard com estatísticas e métricas
- **Acesso Móvel**: Policiais podem preencher laudos no local usando celular
- **Captura de Fotos**: Câmera do celular integrada para documentação visual
- **Geração de PDF**: Relatório oficial gerado automaticamente

## 1.3. Objetivos

### Objetivo Geral
Desenvolver um sistema web que permita a criação, atribuição, preenchimento e gestão de laudos periciais de veículos de forma digital, segura e eficiente, reduzindo o tempo de processamento e aumentando a qualidade das informações coletadas.

### Objetivos Específicos

1. **Digitalização do Processo**
   - Eliminar formulários em papel
   - Permitir preenchimento digital em tempo real
   - Gerar documentos PDF oficiais automaticamente

2. **Gestão Eficiente**
   - Permitir que agentes criem e atribuam laudos rapidamente
   - Fornecer dashboard com estatísticas em tempo real
   - Rastrear status de cada laudo

3. **Mobilidade**
   - Permitir acesso mobile responsivo
   - Integrar câmera do celular para captura de fotos
   - Funcionar em diferentes tamanhos de tela

4. **Segurança e Auditoria**
   - Implementar autenticação segura
   - Controlar acesso baseado em papéis (RBAC)
   - Manter histórico completo de ações

5. **Qualidade de Dados**
   - Padronizar formulários de coleta
   - Validar dados em tempo real
   - Organizar fotos por categorias

6. **Redução de Tempo**
   - Diminuir tempo entre requisição e atribuição
   - Facilitar preenchimento no local da perícia
   - Eliminar etapa de digitalização posterior

## 1.4. Escopo do Sistema

### O que está incluído (In Scope)

#### Para Agentes (AGENT)
- Criar novos laudos
- Visualizar todos os laudos do sistema
- Atribuir laudos a policiais
- Acompanhar progresso de laudos
- Cancelar laudos com justificativa
- Gerenciar policiais (criar, editar, desativar)
- Ver estatísticas gerais do departamento
- Gerar relatórios em PDF

#### Para Policiais (OFFICER)
- Visualizar laudos atribuídos a si
- Preencher dados do veículo no local
- Capturar fotos com câmera do celular
- Preencher análise técnica e conclusão
- Finalizar laudos
- Ver estatísticas pessoais
- Alterar senha de acesso

#### Funcionalidades Gerais
- Autenticação com email/senha
- Troca obrigatória de senha no primeiro acesso
- Histórico de auditoria (audit trail)
- Busca e filtros de laudos
- Interface responsiva (desktop e mobile)
- Captura de fotos via câmera
- Geração de PDF oficial
- Validação de dados em tempo real

### O que não está incluído (Out of Scope)

❌ **Não Implementado na Versão 1.0**:
- Notificações por email/SMS
- Assinatura digital eletrônica
- Integração com outros sistemas (DETRAN, etc)
- Modo offline (trabalha apenas online)
- Backup automático de fotos local
- Exportação em outros formatos (Excel, Word)
- Relatórios estatísticos avançados
- Impressão direta de laudos
- Sistema de mensagens entre usuários
- Anexação de documentos externos

## 1.5. Usuários do Sistema

### Agente (AGENT)
**Papel**: Gerente/Coordenador de laudos

**Perfil**:
- Funcionário do DPT com acesso ao escritório
- Responsável por receber requisições de laudos
- Gerencia equipe de policiais
- Acompanha métricas e prazos

**Necessidades**:
- Criar laudos rapidamente
- Atribuir para policial disponível
- Acompanhar status em tempo real
- Ver estatísticas do departamento
- Gerenciar equipe

**Frequência de Uso**: Diária (múltiplas vezes ao dia)

---

### Policial (OFFICER)
**Papel**: Perito/Executor de laudos

**Perfil**:
- Policial técnico especializado em veículos
- Realiza perícias no local (pátio, delegacia, etc)
- Usa celular ou tablet no campo
- Preenche laudos em tempo real

**Necessidades**:
- Ver laudos atribuídos a si
- Preencher formulário facilmente no celular
- Tirar fotos com boa qualidade
- Salvar rascunhos
- Finalizar laudos

**Frequência de Uso**: Diária (perícias no campo)

## 1.6. Benefícios Esperados

### Para o Departamento
- ⏱️ **Redução de 60% no tempo de processamento** de laudos
- 📊 **Visibilidade total** do status de todos os laudos
- 📈 **Métricas em tempo real** para tomada de decisão
- 🔒 **Maior segurança** dos dados e documentos
- 📝 **Padronização** dos laudos gerados
- 🌱 **Sustentabilidade** - eliminação de papel

### Para os Agentes
- 🚀 **Agilidade** na criação e atribuição de laudos
- 👀 **Visibilidade** do progresso de cada laudo
- 📱 **Acesso** de qualquer lugar
- 📊 **Relatórios** automáticos
- 🎯 **Priorização** eficiente

### Para os Policiais
- 📱 **Mobilidade** - preenche no local da perícia
- 📸 **Qualidade** - fotos organizadas e numeradas
- 💾 **Segurança** - dados salvos automaticamente
- ⏰ **Tempo** - sem necessidade de redigitação
- ✅ **Facilidade** - interface intuitiva

## 1.7. Tecnologias Utilizadas (Resumo)

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/UI** - Componentes de interface

### Backend
- **Prisma ORM** - Acesso ao banco de dados
- **PostgreSQL** - Banco de dados relacional
- **Next.js API Routes** - Endpoints REST
- **JWT** - Autenticação

### Outros
- **jsPDF** - Geração de PDFs
- **bcrypt** - Criptografia de senhas
- **Vercel Postgres** - Hospedagem do banco
- **Git/GitHub** - Controle de versão

*Detalhes completos no documento [02-tecnologias.md](./02-tecnologias.md)*

## 1.8. Métricas de Sucesso

### Métricas Quantitativas
| Métrica | Antes | Meta | Como Medir |
|---------|-------|------|------------|
| Tempo médio de conclusão de laudo | 5-7 dias | 2-3 dias | Sistema de auditoria |
| Laudos perdidos/extraviados | 2-3% | 0% | Rastreabilidade completa |
| Tempo de atribuição | 1-2 dias | Minutos | Timestamp de criação vs atribuição |
| Qualidade das fotos | Baixa/Média | Alta | Resolução e organização |
| Retrabalho (redigitação) | 100% | 0% | Eliminado pela digitalizaç

ão |

### Métricas Qualitativas
- ✅ Satisfação dos usuários (pesquisa após 3 meses)
- ✅ Redução de reclamações sobre prazos
- ✅ Facilidade de uso relatada pelos policiais
- ✅ Padronização dos laudos gerados

## 1.9. Premissas e Restrições

### Premissas
1. ✓ Todos os usuários têm acesso à internet
2. ✓ Policiais possuem smartphone com câmera
3. ✓ Usuários têm conhecimento básico de informática
4. ✓ Há suporte técnico disponível para dúvidas
5. ✓ Infraestrutura de rede do DPT suporta o sistema

### Restrições
1. 🔒 **Segurança**: Dados sensíveis - seguir LGPD
2. 💰 **Orçamento**: Usar tecnologias gratuitas/open-source
3. ⏰ **Prazo**: 6 meses de desenvolvimento
4. 🖥️ **Infraestrutura**: Usar cloud (Vercel) para hospedagem
5. 📱 **Compatibilidade**: Funcionar em Chrome, Firefox, Safari, Edge

## 1.10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Resistência dos usuários | Média | Alto | Treinamento e suporte dedicado |
| Problemas de conectividade no campo | Média | Médio | Mensagens claras de erro e retry |
| Perda de dados | Baixa | Muito Alto | Backups automáticos diários |
| Falha de segurança | Baixa | Muito Alto | Testes de penetração, audit trail |
| Sobrecarga do servidor | Baixa | Médio | Monitoramento e escalabilidade |

## 1.11. Arquitetura em Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIOS                                  │
│                                                              │
│  ┌────────────────┐              ┌────────────────┐         │
│  │    AGENTES     │              │   POLICIAIS    │         │
│  │                │              │                │         │
│  │  - Desktop     │              │  - Mobile      │         │
│  │  - Navegador   │              │  - Smartphone  │         │
│  └────────────────┘              └────────────────┘         │
└───────────────┬──────────────────────────┬──────────────────┘
                │                          │
                │         HTTPS            │
                ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAMADA DE APRESENTAÇÃO                     │
│                      (Next.js App)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Interface Web Responsiva (React + TypeScript)       │  │
│  │  - Páginas dinâmicas                                 │  │
│  │  - Componentes reutilizáveis                         │  │
│  │  - Validação client-side                             │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ API REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               CAMADA DE LÓGICA DE NEGÓCIO                   │
│                   (Next.js API Routes)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Actions (Server Actions)                            │  │
│  │  - Autenticação                                      │  │
│  │  - CRUD de Laudos                                    │  │
│  │  - Gerenciamento de Usuários                         │  │
│  │  - Auditoria                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 CAMADA DE PERSISTÊNCIA                      │
│                   (PostgreSQL Database)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tabelas:                                            │  │
│  │  - profiles (usuários)                               │  │
│  │  - user_roles (papéis)                               │  │
│  │  - reports (laudos)                                  │  │
│  │  - report_audit_log (auditoria)                      │  │
│  │  - vehicle_photos (fotos em base64)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 1.12. Cronograma Estimado

### Fase 1: Planejamento (1 mês)
- Levantamento de requisitos
- Definição de tecnologias
- Prototipagem de telas
- Modelagem do banco de dados

### Fase 2: Desenvolvimento Core (2 meses)
- Autenticação e autorização
- CRUD de laudos
- CRUD de usuários
- Dashboard básico

### Fase 3: Funcionalidades Avançadas (2 meses)
- Formulário completo de laudo
- Captura e gestão de fotos
- Auditoria completa
- Geração de PDF

### Fase 4: Mobile e Ajustes (1 mês)
- Responsividade mobile
- Captura de fotos via câmera
- Testes em dispositivos reais
- Ajustes de UX

### Fase 5: Testes e Deploy (0.5 mês)
- Testes de integração
- Testes de segurança
- Testes com usuários reais
- Deploy em produção

**Total: 6 meses**

## 1.13. Conclusão

O Sistema de Laudos Policiais - DPT representa uma modernização significativa no processo de perícias veiculares do Departamento de Polícia Técnica da Bahia. Através da digitalização completa do processo, mobilidade no campo e rastreabilidade total, o sistema promete reduzir drasticamente o tempo de processamento de laudos, aumentar a qualidade dos dados coletados e fornecer uma gestão muito mais eficiente dos recursos do departamento.

A escolha de tecnologias modernas, escaláveis e gratuitas garante não apenas a viabilidade econômica do projeto, mas também sua sustentabilidade e evolução futura.

---

**Próximo**: [02. Escolha de Tecnologias](./02-tecnologias.md)
