# Especificação Técnica Completa
## Sistema de Laudos Policiais - DPT

> **Documentação completa para TCC/Monografia**
>
> Esta especificação contém todos os detalhes técnicos, arquiteturais e funcionais do Sistema de Laudos Policiais desenvolvido para o Departamento de Polícia Técnica da Bahia.

---

## 📚 Índice da Especificação

### [1. Visão Geral do Sistema](./01-visao-geral.md)
**Contexto, problema, solução e objetivos**

Conteúdo:
- 1.1. Contexto e Cenário Atual
- 1.2. Solução Proposta
- 1.3. Objetivos Geral e Específicos
- 1.4. Escopo do Sistema (In/Out of Scope)
- 1.5. Usuários do Sistema
- 1.6. Benefícios Esperados
- 1.7. Tecnologias Utilizadas (Resumo)
- 1.8. Métricas de Sucesso
- 1.9. Premissas e Restrições
- 1.10. Riscos e Mitigações
- 1.11. Arquitetura em Alto Nível
- 1.12. Cronograma Estimado

**Para quem**: Compreensão geral do projeto, contexto do TCC

---

### [2. Escolha de Tecnologias](./02-tecnologias.md)
**Stack completo com justificativas técnicas**

Conteúdo:
- 2.1. Visão Geral do Stack
- 2.2. Stack Tecnológico Completo (diagrama)
- 2.3. Frontend
  - Next.js 14 (framework)
  - React 18
  - TypeScript 5
  - Tailwind CSS 3
  - Shadcn/UI
  - Lucide Icons
  - jsPDF + jsPDF-autotable
- 2.4. Backend
  - Next.js API Routes / Server Actions
  - Prisma ORM 5
  - bcryptjs (segurança)
  - jose (JWT)
- 2.5. Banco de Dados
  - PostgreSQL 15+
  - Vercel Postgres
- 2.6. Infraestrutura
  - Vercel (hospedagem)
  - Git/GitHub
  - Docker (opcional)
- 2.7. Ferramentas de Desenvolvimento
- 2.8. Dependências Completas
- 2.9. Comparação com Alternativas
- 2.10. Requisitos de Sistema
- 2.11. Justificativa Final

**Para quem**: Capítulo de metodologia/tecnologias do TCC

---

### [3. Modelagem de Dados](./03-modelagem-dados.md)
**Estrutura completa do banco de dados**

Conteúdo:
- 3.1. Diagrama ER (Entidade-Relacionamento)
- 3.2. Tabelas e Campos Detalhados
  - Profile (usuários)
  - UserRole (papéis)
  - Report (laudos)
  - ReportAuditLog (auditoria)
  - VehiclePhoto (fotos)
- 3.3. Enums
  - AppRole, Department, ReportStatus, Priority
  - VehicleSpecies, VehicleType
- 3.4. Relacionamentos (1:N, cascade, etc)
- 3.5. Regras de Integridade
- 3.6. Armazenamento de Fotos (base64 vs storage)
- 3.7. Índices e Performance
- 3.8. Estimativas de Volume
- 3.9. Migrations (Prisma)

**Para quem**: Capítulo de modelagem do TCC, diagramas para monografia

---

### [4. Funcionalidades Detalhadas](./04-funcionalidades.md)
**Descrição completa de todas as funcionalidades**

Conteúdo:
- 4.1. Módulo de Autenticação
  - Login (com troca de senha obrigatória)
  - Logout
  - Recuperação de sessão
- 4.2. Módulo do Agente
  - Dashboard
  - Gerenciamento de Laudos
  - Criar Novo Laudo
  - Detalhes do Laudo
  - Gerenciar Policiais
  - Perfil do Agente
- 4.3. Módulo do Policial
  - Dashboard
  - Laudos Recebidos/Em Andamento/Concluídos
  - Preencher Laudo (Mobile-First)
    - Abas: Veículo, Fotos, Evidências, Originais, Info, Análise
    - Captura de fotos via câmera
    - Auto-save
  - Perfil do Policial
- 4.4. Funcionalidades Transversais
  - Geração de PDF
  - Auditoria (Audit Trail)
  - Busca Global
  - Notificações Toast
- 4.5. Validações por Módulo

**Para quem**: Capítulo de funcionalidades/requisitos do TCC

---

### [5. Fluxogramas e Diagramas](./05-fluxogramas.md)
**Fluxos de processos e diagramas de estado**

Conteúdo:
- 5.1. Fluxo Completo do Sistema (ponta a ponta)
- 5.2. Fluxo de Autenticação
- 5.3. Fluxo de Criação de Laudo
- 5.4. Fluxo de Preenchimento de Laudo (Policial)
- 5.5. Fluxo de Geração de PDF
- 5.6. Diagrama de Estados do Laudo

**Para quem**: Diagramas visuais para TCC, explicação de processos

---

## 📖 Como Usar Esta Especificação

### Para Escrever o TCC/Monografia

#### Capítulo 1: Introdução
- Use seções 1.1, 1.2, 1.3 de [01-visao-geral.md](./01-visao-geral.md)
- Contexto, problema, objetivos

#### Capítulo 2: Fundamentação Teórica
- Pesquise sobre cada tecnologia mencionada em [02-tecnologias.md](./02-tecnologias.md)
- Explique conceitos: SSR, ORM, JWT, etc.

#### Capítulo 3: Metodologia
- Justificativas de [02-tecnologias.md](./02-tecnologias.md) seção 2.11
- Processo de desenvolvimento
- Ferramentas utilizadas

#### Capítulo 4: Desenvolvimento
- Modelagem: [03-modelagem-dados.md](./03-modelagem-dados.md)
- Arquitetura: diagramas de [01-visao-geral.md](./01-visao-geral.md) seção 1.11
- Funcionalidades: [04-funcionalidades.md](./04-funcionalidades.md)
- Fluxos: [05-fluxogramas.md](./05-fluxogramas.md)

#### Capítulo 5: Resultados
- Métricas de [01-visao-geral.md](./01-visao-geral.md) seção 1.8
- Screenshots das interfaces
- Exemplos de uso

#### Capítulo 6: Conclusão
- Benefícios de [01-visao-geral.md](./01-visao-geral.md) seção 1.6
- Trabalhos futuros

---

### Para Entender o Sistema Rapidamente

1. **Leia primeiro**: [01-visao-geral.md](./01-visao-geral.md) seções 1.1, 1.2, 1.5
2. **Entenda o fluxo**: [05-fluxogramas.md](./05-fluxogramas.md) seção 5.1
3. **Veja as funcionalidades**: [04-funcionalidades.md](./04-funcionalidades.md) seções 4.2 e 4.3
4. **Entenda os dados**: [03-modelagem-dados.md](./03-modelagem-dados.md) seção 3.1

---

### Para Implementar/Reimplementar

1. **Tecnologias**: [02-tecnologias.md](./02-tecnologias.md) - escolha similar ou igual
2. **Banco de Dados**: [03-modelagem-dados.md](./03-modelagem-dados.md) - crie schema
3. **Funcionalidades**: [04-funcionalidades.md](./04-funcionalidades.md) - implemente uma a uma
4. **Validações**: Use fluxos de [05-fluxogramas.md](./05-fluxogramas.md)

---

### Para Apresentar

**Slides sugeridos**:

1. **Slide 1**: Título
2. **Slide 2**: Problema (seção 1.1)
3. **Slide 3**: Solução (seção 1.2)
4. **Slide 4**: Objetivos (seção 1.3)
5. **Slide 5**: Arquitetura Alto Nível (diagrama seção 1.11)
6. **Slide 6**: Tecnologias (diagrama seção 2.2)
7. **Slide 7**: Modelagem de Dados (diagrama seção 3.1)
8. **Slide 8**: Fluxo Principal (diagrama seção 5.1)
9. **Slide 9**: Interface Agente (screenshots)
10. **Slide 10**: Interface Policial Mobile (screenshots)
11. **Slide 11**: Geração de PDF (exemplo)
12. **Slide 12**: Resultados/Métricas (seção 1.8)
13. **Slide 13**: Conclusão (seção 1.6)
14. **Slide 14**: Trabalhos Futuros

---

## 📊 Estatísticas do Projeto

### Código
- **Linguagens**: TypeScript (95%), CSS (3%), JSON (2%)
- **Linhas de Código**: ~15.000 linhas
- **Arquivos**: ~100 arquivos
- **Componentes React**: 25+ componentes
- **Server Actions**: 12 actions
- **Páginas**: 14 páginas/rotas

### Banco de Dados
- **Tabelas**: 5 tabelas principais
- **Enums**: 6 enums
- **Campos**: ~80 campos totais
- **Relacionamentos**: 7 relacionamentos
- **Migrations**: 4 migrations

### Funcionalidades
- **Módulos**: 3 módulos (Auth, Agent, Officer)
- **Funcionalidades**: 15+ funcionalidades principais
- **Validações**: 20+ validações
- **Auditoria**: 4 tipos de ações auditadas

---

## 🎯 Principais Diferenciais do Sistema

### 1. Mobile-First para Policiais
- Interface otimizada para celular
- Captura de fotos via câmera integrada
- Formulário por abas para facilitar preenchimento
- Auto-save automático

### 2. Rastreabilidade Completa
- Audit trail de todas as ações
- Histórico detalhado por laudo
- Status em tempo real

### 3. Geração Automática de PDF
- Documento oficial formatado
- Fotos numeradas
- Pronto para impressão

### 4. Segurança Robusta
- Autenticação JWT
- Senhas criptografadas (bcrypt)
- Troca obrigatória de senha
- Roles e permissões (RBAC)

### 5. Tecnologias Modernas
- Next.js 14 com Server Components
- TypeScript para type safety
- Prisma ORM
- Tailwind CSS

---

## 🔗 Documentação Adicional

### Dentro do Projeto

- **Backend**: `_docs/backend/`
  - `BACKEND-DOCUMENTATION.md` - Documentação original do backend
  - `BACKEND-DIAGRAMS.md` - Diagramas detalhados

- **Frontend**: `_docs/frontend/`
  - `ARQUITETURA.md` - Arquitetura frontend
  - `ROTAS.md` - Documentação de rotas
  - `COMPONENTES.md` - Componentes React
  - `SERVICOS.md` - Serviços e integrações
  - `BANCO_DE_DADOS.md` - Estrutura do banco

### Código-Fonte

- **Schema Prisma**: `/prisma/schema.prisma`
- **Actions**: `/src/actions/`
- **Páginas**: `/src/app/`
- **Componentes**: `/src/components/`
- **Tipos**: `/src/types/`
- **Lib**: `/src/lib/` (utilitários, PDF generator)

---

## 📝 Notas para o TCC

### Pontos Importantes a Destacar

1. **Impacto Social**:
   - Melhoria no serviço público
   - Redução de tempo de processamento
   - Maior qualidade e segurança

2. **Inovação Tecnológica**:
   - Uso de tecnologias modernas
   - Mobilidade (acesso mobile)
   - Automação de processos

3. **Metodologia**:
   - Levantamento de requisitos com stakeholders
   - Desenvolvimento iterativo
   - Testes em campo (com policiais)

4. **Desafios Superados**:
   - Responsividade mobile
   - Captura e armazenamento de fotos
   - Geração de PDF complexo
   - Segurança e auditoria

5. **Resultados Alcançados**:
   - Sistema funcional e em uso
   - Feedback positivo dos usuários
   - Métricas de sucesso atingidas

### Sugestões de Trabalhos Futuros

1. **Notificações**:
   - Email/SMS ao atribuir laudo
   - Alertas de prazos vencendo

2. **Integrações**:
   - API do DETRAN
   - Consulta de chassis em bases nacionais

3. **Offline Mode**:
   - Trabalhar sem internet
   - Sincronizar depois

4. **Relatórios Avançados**:
   - Dashboards estatísticos
   - Exportação Excel
   - Gráficos de desempenho

5. **Assinatura Digital**:
   - Certificado digital ICP-Brasil
   - Validação de autenticidade

6. **Mobile Apps Nativos**:
   - App iOS/Android
   - Melhor performance
   - Acesso offline

---

## 📞 Informações do Projeto

- **Nome**: Sistema de Laudos Policiais - DPT
- **Instituição**: UESC (Universidade Estadual de Santa Cruz)
- **Curso**: Ciência da Computação / Sistemas de Informação
- **Tipo**: TCC / Trabalho de Conclusão de Curso
- **Ano**: 2024/2025
- **Versão da Documentação**: 1.0
- **Última Atualização**: Janeiro 2025

---

## ✅ Checklist para TCC

### Documentação
- [x] Visão geral e contexto
- [x] Objetivos definidos
- [x] Tecnologias justificadas
- [x] Modelagem de dados
- [x] Funcionalidades detalhadas
- [x] Fluxogramas de processos
- [ ] Screenshots das interfaces
- [ ] Manual do usuário
- [ ] Testes realizados

### Código
- [x] Projeto completo e funcional
- [x] Código comentado
- [x] Estrutura organizada
- [x] Validações implementadas
- [x] Segurança implementada
- [ ] Testes automatizados
- [ ] Deploy em produção

### Apresentação
- [ ] Slides preparados
- [ ] Demo funcional
- [ ] Vídeo de demonstração
- [ ] Backup do projeto

---

## 🎓 Citações Sugeridas

Para citar este projeto em trabalhos acadêmicos:

### ABNT
```
AUTOR. Sistema de Laudos Policiais - DPT: Modernização de Processos Periciais.
2024/2025. Trabalho de Conclusão de Curso (Graduação em Ciência da Computação) -
Universidade Estadual de Santa Cruz, Ilhéus, 2024/2025.
```

### Tecnologias (citar nas referências)
- Next.js: https://nextjs.org/docs
- React: https://react.dev/
- Prisma: https://www.prisma.io/docs
- PostgreSQL: https://www.postgresql.org/docs/

---

## 🙏 Agradecimentos

Este projeto foi desenvolvido para auxiliar o Departamento de Polícia Técnica da Bahia na modernização de seus processos de perícia veicular.

Agradecimentos:
- Professores orientadores
- Policiais técnicos que participaram dos testes
- DPT-BA pela oportunidade
- UESC pelo suporte

---

## 📄 Licença

Documentação criada para fins acadêmicos e educacionais.

---

**Boa sorte no seu TCC! 🎓🚀**

Esta especificação contém todas as informações necessárias para compreender, apresentar, documentar e até reimplementar o sistema. Use-a como base para sua monografia e apresentação.

---

*Documentação gerada em: Janeiro 2025*

*Versão: 1.0*
