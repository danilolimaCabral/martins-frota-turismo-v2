# TODO - Sistema Martins Turismo

## 🎯 IMPLEMENTAÇÃO EM ANDAMENTO

### 📱 1. Layout Mobile Responsivo
- [ ] Criar componente MobileMenu com hamburguer
- [ ] Atualizar Admin.tsx com layout responsivo
- [ ] Otimizar cards para mobile
- [ ] Melhorar botões touch
- [ ] Testar em celular

### 📄 2. Certificados ANTT/DER/Cadastur
- [ ] Adicionar campos no schema vehicles
- [ ] Atualizar router de veículos
- [ ] Atualizar interface AdminVeiculos
- [ ] Criar alertas de vencimento

### 👥 3. Módulo RH
- [ ] Criar schema employees
- [ ] Criar schema payroll
- [ ] Criar router RH
- [ ] Criar página AdminRH
- [ ] Adicionar ao menu

### 🗺️ 4. Módulo Roteirização
- [ ] Criar schema routes
- [ ] Integrar Google Maps
- [ ] Criar router roteirização
- [ ] Criar página AdminRoteirizacao
- [ ] Adicionar ao menu

### 💾 5. Popular Banco
- [ ] Criar script seed completo
- [ ] Adicionar 5 veículos
- [ ] Adicionar 3 motoristas
- [ ] Adicionar 10 viagens
- [ ] Executar seed

- [ ] Remover campos IPVA, Seguro e Licenciamento do schema

- [x] Atualizar landing page para mostrar apenas ANTT, DER e Cadastur


## 🆕 MÓDULO RH FINANCEIRO (NOVA SOLICITAÇÃO)

### 📊 Schema do Banco de Dados
- [x] Criar tabela employees (funcionários completa) - EXISTENTE
- [x] Criar tabela dependents (dependentes) - EXISTENTE
- [x] Criar tabela payroll (folhas de pagamento) - EXISTENTE
- [x] Criar tabela time_records (registros de ponto) - EXISTENTE
- [x] Criar tabela vacations (férias) - EXISTENTE
- [x] Criar tabela absences (afastamentos) - EXISTENTE
- [ ] Executar migrations

### 🔧 Routers tRPC
- [x] Criar employee-routers.ts (CRUD funcionários)
- [x] Criar payroll-routers.ts (folha de pagamento)
- [ ] Criar timerecord-routers.ts (controle de ponto)
- [ ] Criar vacation-routers.ts (férias e afastamentos)
- [x] Integrar routers no servidor

### 🖥️ Interfaces Administrativas
- [x] Criar página AdminFuncionarios (/admin/funcionarios)
- [x] Criar página AdminFolhaPagamento (/admin/folha)
- [ ] Criar página AdminPonto (/admin/ponto)
- [ ] Criar página AdminFerias (/admin/ferias)
- [x] Adicionar links no menu do admin

### 📈 Relatórios Financeiros
- [ ] Relatório de custos com pessoal
- [ ] Relatório de encargos mensais
- [ ] Relatório de horas trabalhadas
- [ ] Dashboard RH com KPIs
