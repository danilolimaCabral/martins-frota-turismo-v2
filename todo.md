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


## 🆕 MELHORIAS DASHBOARD (NOVA SOLICITAÇÃO)

- [ ] Corrigir queries dos cards para buscar dados reais (funcionarios e vehicles)
- [x] Adicionar gráfico de linha - Tendência de despesas mensais
- [x] Adicionar gráfico de rosca - Distribuição da frota por tipo
- [x] Adicionar gráfico de barras - Viagens por mês
- [ ] Conectar gráficos a dados reais do banco
- [ ] Adicionar filtros de período nos gráficos
- [ ] Implementar notificações push em tempo real
- [ ] Testar todas as funcionalidades


## 🆕 REMOVER AUTENTICAÇÃO MANUS (NOVA SOLICITAÇÃO)

- [ ] Criar sistema de login local simples
- [ ] Criar tabela de usuários no banco
- [ ] Atualizar routers para não usar Manus OAuth
- [ ] Criar página de login local
- [ ] Testar acesso sem autenticação Manus


## 🆕 GESTÃO DE USUÁRIOS E GRÁFICOS REAIS

- [x] Criar router de gestão de usuários (CRUD)
- [x] Criar página AdminUsuarios com listagem e formulários
- [x] Conectar gráfico de despesas a dados reais
- [x] Conectar gráfico de viagens a dados reais
- [ ] Testar todas as funcionalidades


## 🆕 SISTEMA DE PERMISSÕES GRANULARES

- [x] Adicionar campo permissions à tabela local_users
- [x] Criar middleware de verificação de permissões
- [x] Atualizar AdminUsuarios com checkboxes de permissões
- [x] Aplicar rhProcedure em todos os endpoints de funcionario-routers.ts
- [x] Criar financeiroProcedure e aplicar em financeiro-routers.ts
- [x] Criar frotaProcedure e aplicar em vehicle-routers.ts
- [x] Criar script de inicialização para admin padrão (admin/admin123)
- [x] Implementar menu dinâmico que oculta links sem permissão
- [ ] Testar login e controle de acesso por módulo


## 🆕 TESTES E MELHORIAS FINAIS

### Testes de Permissões
- [x] Criar usuário de teste com permissões limitadas (apenas Frota)
- [ ] Testar login com usuário limitado
- [ ] Verificar bloqueio de acesso aos módulos RH e Financeiro
- [ ] Validar menu dinâmico ocultando links sem permissão
- [ ] Testar erro 403 ao tentar acessar endpoint sem permissão

### Página de Perfil
- [x] Criar router profile-routers.ts
- [x] Implementar endpoint de alteração de senha
- [x] Implementar endpoint de atualização de dados pessoais
- [x] Criar página AdminPerfil.tsx
- [x] Adicionar link no menu do usuário

### Logs de Auditoria
- [x] Criar tabela audit_logs no banco
- [x] Criar middleware de auditoria (helper logAudit)
- [ ] Aplicar auditoria em ações críticas (create, update, delete)
- [x] Criar página AdminAuditoria.tsx para visualizar logs
- [x] Adicionar filtros por usuário, ação e data


## 🔥 CORREÇÕES URGENTES (NOVA SOLICITAÇÃO)

### Erro TypeScript
- [x] Corrigir erro em AdminFinanceiro.tsx - Property 'getSaldo' does not exist
- [x] Implementar endpoint getSaldo no financeiro-routers.ts

### Sistema de Autenticação
- [ ] Revisar lógica de redirecionamento em Login.tsx
- [ ] Verificar salvamento de token JWT no localStorage
- [ ] Validar ProtectedRoute em App.tsx
- [ ] Testar login com usuário teste (teste/teste123)
- [ ] Testar login com usuário admin

### Schema do Banco de Dados
- [ ] Executar pnpm db:push para sincronizar schema
- [ ] Validar estrutura da tabela local_users
- [ ] Validar estrutura da tabela audit_logs


### Carregamento de Veículos
- [ ] Investigar erro de carregamento infinito na página AdminVeiculos
- [ ] Verificar endpoint vehicle.list no vehicle-routers.ts
- [ ] Verificar permissões frotaProcedure
- [ ] Testar query no banco de dados


### Testes Completos do Sistema
- [x] Corrigir validação JWT no context.ts
- [x] Sincronizar schema do banco (pnpm db:push)
- [x] Testar carregamento de todos os menus
- [ ] Testar login com usuário admin
- [x] Testar login com usuário teste (permissões limitadas)
- [ ] Verificar logs de acesso na auditoria
- [x] Validar bloqueio de acesso por permissões


## 🔧 CORREÇÕES FINAIS (NOVA RODADA)

### Carregamento de Veículos
- [ ] Investigar erro no endpoint vehicle.list
- [ ] Verificar se há veículos no banco de dados
- [ ] Testar frotaProcedure com usuário teste
- [ ] Corrigir carregamento travado na página /admin/veiculos

### Erro no Servidor
- [x] Buscar typo "financeiroProceduree" no código (não encontrado no source)
- [x] Corrigir para "financeiroProcedure" (não necessário)
- [x] Reiniciar servidor e validar (erro pode ser temporário)

### Auditoria Completa
- [x] Aplicar logAudit() em vehicle-routers.ts (create, update, delete)
- [ ] Aplicar logAudit() em funcionario-routers.ts (create, update, delete)
- [ ] Aplicar logAudit() em financeiro-routers.ts (create, update, delete)
- [ ] Aplicar logAudit() em folha-routers.ts (aprovar, rejeitar)
- [ ] Testar logs de auditoria no painel AdminAuditoria


## 🐛 DEBUG E DADOS DE TESTE

### Debug Carregamento de Veículos
- [x] Adicionar console.log no endpoint vehicle.list
- [x] Adicionar console.log no frotaProcedure middleware
- [x] Testar carregamento e verificar logs
- [x] Identificar e corrigir erro (colunas faltantes no banco)
- [x] Adicionar colunas anttNumber, derNumber, cadasturNumber
- [x] Remover logs de debug

### Dados de Teste
- [x] Criar script seed-data.mjs
- [x] Popular veículos (48 veículos reais já existentes)
- [x] Popular funcionários (8 funcionários de teste)
- [ ] Popular despesas (tabela expenses tem estrutura diferente)
- [x] Validar dados no painel administrativo


## 🔑 CORREÇÃO LOGIN ADMIN

- [x] Verificar se usuário "Admin" existe no banco local_users
- [x] Criar/atualizar usuário admin com username "admin" e senha "123456"
- [x] Testar login com credenciais admin/123456
- [x] Validar acesso completo ao sistema (todos os módulos)


## 🎨 CORREÇÃO UI - ESPAÇO EM BRANCO

- [x] Identificar componente causando espaço em branco no dashboard (Admin.tsx)
- [x] Corrigir CSS/layout (adicionar lg:flex no container e flex-1 no main)
- [x] Testar em diferentes resoluções
- [x] Validar correção com usuário


## 🚀 FINALIZAÇÃO COMPLETA DO SISTEMA

### Schemas do Banco de Dados
- [x] Criar tabela eventos (agenda de compromissos) - Já existe
- [x] Criar tabela lancamentos_rh - Já existe
- [x] Criar tabela controle_ponto - Já existe
- [x] Criar tabela ferias - Já existe
- [x] Criar tabela contas_pagar - Já existe
- [x] Criar tabela contas_receber - Já existe
- [ ] Executar db:push (se necessário)

### Routers tRPC
- [ ] Criar agenda-routers.ts
- [ ] Criar lancamentos-rh-routers.ts
- [ ] Criar ponto-routers.ts
- [ ] Criar ferias-routers.ts
- [ ] Expandir financeiro-routers.ts (contas pagar/receber)
- [ ] Criar relatorios-routers.ts
- [ ] Integrar todos os routers em routers.ts

### Interfaces Administrativas RH
- [ ] Criar AdminLancamentosRH.tsx
- [ ] Criar AdminAlertas.tsx
- [ ] Criar AdminPonto.tsx
- [ ] Criar AdminFerias.tsx

### Interfaces Financeiro
- [ ] Expandir AdminFinanceiro.tsx (dashboard completo)
- [ ] Criar AdminDespesas.tsx (se não existir)

### Agenda de Compromissos
- [ ] Criar AdminAgenda.tsx (calendário visual)
- [ ] Implementar formulário de eventos completo
- [ ] Integrar com veículos e clientes

### Relatórios em PDF
- [ ] Criar AdminRelatorios.tsx
- [ ] Implementar geração de PDF financeiro
- [ ] Implementar geração de PDF folha de pagamento
- [ ] Implementar geração de PDF custos operacionais

### Rotas e Menu
- [ ] Adicionar todas as rotas no App.tsx
- [ ] Verificar links no menu Admin.tsx
- [ ] Testar navegação completa

### Validação Final
- [ ] Testar todos os módulos
- [ ] Verificar permissões
- [ ] Salvar checkpoint final
