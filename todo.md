# TODO - Sistema Martins Turismo

## ✅ CONCLUÍDO

### Landing Page
- [x] Atualizar landing page para mostrar apenas ANTT, DER e Cadastur

### Módulo RH - Fase 1
- [x] Criar tabela employees (funcionários completa) - EXISTENTE
- [x] Criar tabela dependents (dependentes) - EXISTENTE
- [x] Criar tabela payroll (folhas de pagamento) - EXISTENTE
- [x] Criar tabela time_records (registros de ponto) - EXISTENTE
- [x] Criar tabela vacations (férias) - EXISTENTE
- [x] Criar employee-routers.ts (CRUD funcionários)
- [x] Criar payroll-routers.ts (folha de pagamento)
- [x] Criar página AdminFuncionarios (/admin/funcionarios)
- [x] Criar página AdminFolhaPagamento (/admin/folha)
- [x] Adicionar links no menu do admin

---

## 🔄 EM ANDAMENTO

### Módulo RH - Fase 2 (Completar)
- [x] Criar ponto-routers.ts (controle de ponto) - CRIADO
- [x] Criar ferias-routers.ts (gestão de férias) - CRIADO
- [ ] Integrar ponto-routers e ferias-routers no servidor
- [ ] Criar sistema de lançamentos flexível (créditos/débitos)
- [ ] Implementar geração de arquivo CNAB para pagamento bancário
- [ ] Criar alertas de documentos vencendo
- [ ] Criar página AdminPonto (/admin/ponto)
- [ ] Criar página AdminFerias (/admin/ferias)

---

## 🆕 PENDENTE - PRIORIDADE CRÍTICA

### 1. MÓDULO FINANCEIRO (0% - CRIAR DO ZERO)

#### Schemas do Banco de Dados
- [ ] Criar tabela contas_pagar
- [ ] Criar tabela contas_receber
- [ ] Criar tabela categorias_financeiras
- [ ] Criar tabela extratos_bancarios
- [ ] Criar tabela movimentacoes_caixa
- [ ] Criar tabela conciliacoes_bancarias
- [ ] Executar migrations

#### Routers tRPC
- [ ] Criar financeiro-routers.ts (contas a pagar/receber)
- [ ] Criar caixa-routers.ts (movimentações de caixa)
- [ ] Criar banco-routers.ts (extratos e conciliação)
- [ ] Integrar routers no servidor

#### Interfaces Administrativas
- [ ] Criar página AdminFinanceiro (/admin/financeiro)
- [ ] Criar página AdminContasPagar (/admin/contas-pagar)
- [ ] Criar página AdminContasReceber (/admin/contas-receber)
- [ ] Criar página AdminFluxoCaixa (/admin/fluxo-caixa)
- [ ] Criar página AdminExtratos (/admin/extratos)
- [ ] Adicionar links no menu do admin

#### Relatórios e Dashboard
- [ ] Dashboard financeiro com KPIs
- [ ] Relatório de fluxo de caixa
- [ ] Relatório de DRE (Demonstrativo de Resultados)
- [ ] Gráficos de receitas vs despesas

---

### 2. AGENDA DE COMPROMISSOS (0% - CRIAR DO ZERO)

#### Schemas do Banco de Dados
- [ ] Criar tabela eventos
- [ ] Criar tabela compromissos_viagens
- [ ] Criar tabela pagamentos_eventos
- [ ] Executar migrations

#### Routers tRPC
- [ ] Criar agenda-routers.ts
- [ ] Criar eventos-routers.ts
- [ ] Integrar routers no servidor

#### Interfaces Administrativas
- [ ] Criar página AdminAgenda (/admin/agenda)
- [ ] Implementar calendário visual (FullCalendar ou similar)
- [ ] Criar formulário de novo evento com todos os campos:
  * Nome do evento
  * Data início e fim
  * Cliente vinculado
  * Veículo vinculado
  * Valor da viagem
  * Valores pagos com datas
  * Tipo de serviço (Viagem, Especial)
  * Descrição
- [ ] Criar visualização de resumo em calendário
- [ ] Adicionar link no menu do admin

---

## 🎯 PENDENTE - PRIORIDADE ALTA

### 3. ROTEIRIZAÇÃO INTELIGENTE (50% - COMPLETAR)

#### Backend
- [ ] Implementar upload de planilha Excel/CSV com endereços
- [ ] Criar algoritmo de otimização de rotas
- [ ] Implementar sugestão de pontos de embarque
- [ ] Adicionar configurações:
  * Distância máxima que usuário pode percorrer
  * Tempo máximo de rota
- [ ] Criar endpoint para gerar link de rota para motorista

#### Interface Administrativa
- [ ] Criar página AdminRoteirizacao (/admin/roteirizacao)
- [ ] Implementar upload de planilha
- [ ] Mostrar mapa com rota otimizada
- [ ] Permitir ajustes manuais nos pontos
- [ ] Gerar link para motorista

#### Apps (Opcional - Fase Futura)
- [ ] Desenvolver APP motorista (React Native ou PWA)
- [ ] Desenvolver APP rastreamento cliente (React Native ou PWA)

---

## 📋 PENDENTE - PRIORIDADE MÉDIA

### 4. ATENDIMENTO AO CLIENTE (80% - MELHORAR)

#### Formulário de Orçamento Estruturado
- [ ] Reestruturar formulário com campos obrigatórios:
  * Nome completo
  * Início da viagem (Endereço)
  * Destino com endereço
  * Data início e fim
  * Pernoite (casa ou hotel)
  * Quantidade de pessoas
  * Categoria de veículo (dropdown)
  * Finalidade do evento
- [ ] Criar validações
- [ ] Melhorar fluxo de aprovação

#### Sistema de Tickets Internos
- [ ] Criar tabela tickets
- [ ] Criar router tickets-routers.ts
- [ ] Criar interface de tickets
- [ ] Permitir interação entre funcionários
- [ ] Histórico de interações

---

## 🔧 MELHORIAS TÉCNICAS

### Integrações
- [ ] Validar integração Google Maps em produção
- [ ] Testar geração de CNAB bancário
- [ ] Validar uploads de arquivos S3

### Performance
- [ ] Otimizar queries do banco de dados
- [ ] Implementar cache para relatórios
- [ ] Adicionar paginação em listas grandes

### Segurança
- [ ] Revisar permissões de admin
- [ ] Adicionar logs de auditoria
- [ ] Implementar backup automático

---

## 📊 ESTATÍSTICAS DO PROJETO

**Routers Criados:** 20
**Páginas Admin:** 10
**Tabelas no Banco:** ~35
**Completude Geral:** ~60%

**Módulos por Status:**
- ✅ Completo (100%): Veículos/Frota
- 🟡 Parcial (70%): RH
- 🟡 Parcial (80%): Atendimento
- 🟡 Parcial (50%): Roteirização
- 🔴 Pendente (0%): Financeiro
- 🔴 Pendente (0%): Agenda

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO SUGERIDA

1. **Completar RH** (lançamentos + CNAB + alertas + interfaces)
2. **Criar Módulo Financeiro** (schemas + routers + interfaces)
3. **Criar Agenda de Compromissos** (schemas + routers + calendário)
4. **Melhorar Roteirização** (upload planilha + otimização)
5. **Melhorar Atendimento** (formulário estruturado + tickets)


## 🚀 FINALIZAÇÃO HOJE

### Interfaces RH
- [ ] Criar AdminLancamentosRH.tsx
- [ ] Criar AdminAlertas.tsx
- [ ] Criar AdminPonto.tsx
- [ ] Criar AdminFerias.tsx
- [ ] Adicionar rotas no App.tsx
- [ ] Adicionar links no menu Admin

### Módulo Financeiro
- [ ] Criar financeiro-routers.ts
- [ ] Criar AdminFinanceiro.tsx (dashboard)
- [ ] Criar AdminContasPagar.tsx
- [ ] Criar AdminContasReceber.tsx
- [ ] Criar AdminFluxoCaixa.tsx
- [ ] Adicionar rotas e links

### Agenda de Compromissos
- [ ] Criar schemas de eventos
- [ ] Criar agenda-routers.ts
- [ ] Criar AdminAgenda.tsx (calendário)
- [ ] Integrar com veículos e clientes
- [ ] Adicionar rotas e links


## 🆕 NOVA IMPLEMENTAÇÃO

### Páginas de Ponto e Férias
- [ ] Criar AdminPonto.tsx (registro entrada/saída)
- [ ] Criar AdminFerias.tsx (solicitações e aprovações)
- [ ] Adicionar rotas no App.tsx
- [ ] Adicionar links no menu Admin

### Relatórios em PDF
- [ ] Criar endpoint de geração de relatório financeiro
- [ ] Criar endpoint de relatório de folha de pagamento
- [ ] Criar endpoint de relatório de custos operacionais
- [ ] Criar página AdminRelatorios.tsx com opções de download

### Notificações Automáticas
- [ ] Configurar sistema de alertas por e-mail
- [ ] Alertas de CNH vencendo
- [ ] Alertas de ANTT/DER vencendo
- [ ] Alertas de pagamentos pendentes
